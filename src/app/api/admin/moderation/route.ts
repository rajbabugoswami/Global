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

    const reports = await prisma.userReport.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true, email: true } },
        reported: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Moderation Fetch Error:", error);
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

    const { reportId, action } = await req.json();

    if (action === "DISMISS") {
      await prisma.userReport.update({
        where: { id: reportId },
        data: { status: "DISMISSED", resolvedAt: new Date() }
      });
    } else if (action === "BAN") {
      const report = await prisma.userReport.update({
        where: { id: reportId },
        data: { status: "RESOLVED_BANNED", resolvedAt: new Date() }
      });
      await prisma.user.update({
        where: { id: report.reportedId },
        data: { isBanned: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Moderation Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
