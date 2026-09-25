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

    const { adProvider, adToken } = await req.json();

    if (!adProvider || !adToken) {
      return NextResponse.json({ error: "Invalid Ad Payload" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Securely fetch dynamic reward value from system settings
    const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
    const rewardMins = settings?.adRewardMins || 5;

    // TODO: Verify adToken cryptographically with adProvider SDK
    // For now, assume adToken is valid if provided

    // Update wallet
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        walletBalanceMins: { increment: rewardMins }
      }
    });

    // Log the Ad Watch History
    await prisma.adWatchHistory.create({
      data: {
        userId: user.id,
        provider: adProvider,
        minutesGranted: rewardMins,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
      }
    });

    return NextResponse.json({ 
      success: true, 
      rewardedMinutes: rewardMins,
      newWalletBalance: updatedUser.walletBalanceMins
    });

  } catch (error: any) {
    console.error("Ad Reward Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
