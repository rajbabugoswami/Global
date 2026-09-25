import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check Admin routes
    if (path.startsWith("/admin")) {
      const role = token?.role as string;
      if (role !== "ADMIN" && role !== "MODERATOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
