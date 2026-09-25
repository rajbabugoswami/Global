import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const trending = searchParams.get("trending") === "true";
    
    let whereClause: any = { privacy: "PUBLIC" };
    if (category) whereClause.category = category;
    if (trending) whereClause.isTrending = true;

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { members: true, posts: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const data = await req.json();
    
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        privacy: data.privacy || "PUBLIC",
        category: data.category || "General",
        members: {
          create: {
            userId: user.id,
            role: "OWNER"
          }
        }
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
