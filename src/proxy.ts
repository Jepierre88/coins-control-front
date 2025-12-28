import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "better-auth.session_token";
const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE}`;

function getSessionToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get(SECURE_SESSION_COOKIE)?.value ??
    request.cookies.get(SESSION_COOKIE)?.value ??
    undefined
  );
}

function buildLoginRedirect(request: NextRequest) {
  const nextPath = request.nextUrl.pathname + request.nextUrl.search;
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export function requireAdminAuth(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    return buildLoginRedirect(request);
  }

  return NextResponse.next();
}

export default function proxy(request: NextRequest) {
  return requireAdminAuth(request);
}