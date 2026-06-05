import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

// Proxy (formerly Middleware in older Next.js) — runs on the Node.js runtime in
// Next 16, so it can verify the signed session cookie before /dashboard and
// /admin ever render. No valid cookie => bounced to /login.
export function proxy(request: NextRequest) {
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // The admin area is super_admin only.
  if (request.nextUrl.pathname.startsWith("/admin") && session.role !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
