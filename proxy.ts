import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthRoute,
  isProtectedRoute,
  isPublicApiRoute,
  isPublicRoute,
} from "@/lib/route-list";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const isFileAsset = /\.[a-zA-Z0-9]+$/.test(pathname);
  const authHeader = req.headers.get("authorization");
  const headerToken = authHeader?.replace("Bearer ", "");
  const cookieToken = req.cookies.get("access_token")?.value;
  const token = headerToken ?? cookieToken;

  if (isFileAsset) {
    return NextResponse.next();
  }

  if (isAuthRoute(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isPublicRoute(pathname) || isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const signInUrl = new URL("/sign-in", req.nextUrl);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
