import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Subscription: { include: { plan: true } } }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Handle Daily Reset
    const now = new Date();
    const lastReset = user.lastResetDate;
    let dailyUsed = user.dailyUsedMins;
    
    // If last reset was on a different calendar day, reset usage to 0
    if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      dailyUsed = 0;
      await prisma.user.update({
        where: { id: user.id },
        data: { dailyUsedMins: 0, lastResetDate: now }
      });
    }

    // Determine Daily Limit from Subscription
    let dailyLimit = 0;
    if (user.Subscription && user.Subscription.status === "ACTIVE") {
      dailyLimit = user.Subscription.plan.dailyCallingLimitMins;
    }

    // Determine Remaining Limits
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const adWallet = user.walletBalanceMins;

    const totalAvailableMins = dailyRemaining + adWallet;

    return NextResponse.json({
      walletBalanceMins: adWallet,
      dailyLimit,
      dailyUsed,
      dailyRemaining,
      totalAvailableMins,
      subscription: user.Subscription ? {
        planName: user.Subscription.plan.name,
        status: user.Subscription.status,
        endDate: user.Subscription.endDate
      } : null
    });
  } catch (error) {
    console.error("Wallet Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
