import { cookies } from "next/headers";

const REFRESH_COOKIE = "refresh_token";
const ACCESS_COOKIE = "access_token";

export async function setRefreshCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function setAccessCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });
}

export async function readRefreshCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
}

export async function readAccessCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function clearRefreshCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_COOKIE);
}

export async function clearAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
}
