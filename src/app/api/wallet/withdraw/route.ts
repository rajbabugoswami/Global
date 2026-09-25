import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 10) {
      return NextResponse.json({ error: "Minimum withdrawal amount is $10" }, { status: 400 });
    }

    // In a real app, you'd check if `user.earningsBalance >= amount` before allowing this.
    // We are simulating for now.

    const request = await prisma.payoutRequest.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Create Payout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
