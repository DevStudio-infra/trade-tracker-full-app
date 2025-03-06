import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const isOnProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isOnProtectedRoute) {
    if (!isAuthenticated) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  }

  return NextResponse.next();
});

// Optionally configure middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/credits/:path*",
    "/api/user/:path*",
  ],
};
