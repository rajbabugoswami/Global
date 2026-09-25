import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userSettings = await prisma.userSettings.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!userSettings) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userSettings = await prisma.userSettings.create({
          data: { userId: user.id },
        });
      }
    }

    return NextResponse.json(userSettings);
  } catch (error: any) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      notifications,
      soundEnabled,
      theme,
      wallpaper,
      lowBandwidth,
      callQuality
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (notifications !== undefined) updateData.notifications = notifications;
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled;
    if (theme !== undefined) updateData.theme = theme;
    if (wallpaper !== undefined) updateData.wallpaper = wallpaper;
    if (lowBandwidth !== undefined) updateData.lowBandwidth = lowBandwidth;
    if (callQuality !== undefined) updateData.callQuality = callQuality;

    const userSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData
      },
    });

    return NextResponse.json({ message: "Settings updated successfully", userSettings });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
