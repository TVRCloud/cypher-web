import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  isAuthRoute,
  isProtectedRoute,
  isPublicApiRoute,
  isPublicRoute,
} from "@/lib/route-list";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api");
  const isFileAsset = /\.[a-zA-Z0-9]+$/.test(pathname);

  if (isFileAsset) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isAuthRoute(pathname)) {
    if (token) return NextResponse.redirect(new URL("/", req.nextUrl));
    return NextResponse.next();
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
