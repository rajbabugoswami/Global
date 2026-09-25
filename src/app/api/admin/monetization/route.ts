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

    let settings = await prisma.systemSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: "global",
          adsEnabled: false,
          adsenseConfig: ""
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Monetization Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { adsEnabled, adsenseConfig } = await req.json();

    const settings = await prisma.systemSettings.upsert({
      where: { id: "global" },
      update: {
        adsEnabled,
        adsenseConfig
      },
      create: {
        id: "global",
        adsEnabled,
        adsenseConfig
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Monetization Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
