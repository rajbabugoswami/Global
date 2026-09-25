import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Middleware function to check if the user is an admin
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return { error: "Unauthorized", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || user.role !== "ADMIN") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }

  return { success: true };
}

export async function GET(req: Request) {
  try {
    const auth = await checkAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        status: true
      },
      orderBy: { id: 'desc' },
      take: 50 // Limit to 50 for performance
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await checkAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { userId, action, value } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let updatedUser;

    if (action === "updateRole") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: value }
      });
    } else if (action === "toggleBan") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isBanned: !user.isBanned }
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
