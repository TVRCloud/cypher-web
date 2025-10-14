import type { NextResponse } from "next/server";

export const REFRESH_TOKEN_COOKIE = "refresh_token";

export function setRefreshCookie(
  res: NextResponse,
  token: string,
  maxAgeSec: number
) {
  res.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export function clearRefreshCookie(res: NextResponse) {
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
