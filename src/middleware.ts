import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname === "/login" || pathname === "/register";

  if (!session?.user && (isAdminRoute || isDashboardRoute)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (session?.user && isAuthRoute) {
    const dest =
      session.user.role === "ADMIN"
        ? "/admin"
        : "/dashboard";

    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (
    session?.user &&
    isAdminRoute &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  if (
    session?.user &&
    isDashboardRoute &&
    session.user.role === "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/admin", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};