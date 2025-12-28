import { NextResponse, type NextRequest } from "next/server";

import { requireAdminAuth } from "@/proxy";

export function proxy(request: NextRequest) {
  return requireAdminAuth(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
