import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/admin");
  const isAuthPath = path.startsWith("/auth");

  // Get auth from localStorage (this runs on client, so we need a different approach)
  // For now, we'll allow access and handle auth client-side
  // In production, you'd want to verify with cookies/tokens

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
