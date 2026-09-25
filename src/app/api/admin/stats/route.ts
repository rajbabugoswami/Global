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

    const totalUsers = await prisma.user.count();
    
    // Revenue from successful transactions
    const transactions = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" }
    });

    // Pending reports
    const pendingReports = await prisma.userReport.count({
      where: { status: "PENDING" }
    });

    return NextResponse.json({
      totalUsers,
      activeCalls: Math.floor(Math.random() * 50) + 10, // Simulated live WebRTC calls
      pendingReports,
      revenue: transactions._sum.amount || 0
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
