import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    let grossRevenue = 0;
    let gatewayFees = 0;
    let netSettlement = 0;
    let refunds = 0;

    transactions.forEach(tx => {
      if (tx.status === "SUCCESS") {
        grossRevenue += tx.amount;
        gatewayFees += tx.gatewayFee;
        netSettlement += tx.netAmount;
      } else if (tx.status === "REFUNDED") {
        refunds += tx.amount;
      }
    });

    return NextResponse.json({
      transactions,
      stats: {
        grossRevenue,
        gatewayFees,
        netSettlement,
        refunds
      }
    });
  } catch (error) {
    console.error("Payments Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
