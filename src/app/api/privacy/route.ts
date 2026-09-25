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

    let privacy = await prisma.userPrivacy.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!privacy) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        privacy = await prisma.userPrivacy.create({
          data: { userId: user.id },
        });
      }
    }

    return NextResponse.json(privacy);
  } catch (error: any) {
    console.error("Privacy fetch error:", error);
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
      whoCanSeeOnline, 
      whoCanCallMe, 
      whoCanAddMeToGroups, 
      allowReadReceipts, 
      disappearingMessages 
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const privacy = await prisma.userPrivacy.upsert({
      where: { userId: user.id },
      update: {
        whoCanSeeOnline,
        whoCanCallMe,
        whoCanAddMeToGroups,
        allowReadReceipts,
        disappearingMessages,
      },
      create: {
        userId: user.id,
        whoCanSeeOnline,
        whoCanCallMe,
        whoCanAddMeToGroups,
        allowReadReceipts,
        disappearingMessages,
      },
    });

    return NextResponse.json({ message: "Privacy updated successfully", privacy });
  } catch (error: any) {
    console.error("Privacy update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
