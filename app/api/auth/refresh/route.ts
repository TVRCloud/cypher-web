import { NextResponse, type NextRequest } from "next/server";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/lib/jwt";
import {
  REFRESH_TOKEN_COOKIE,
  setRefreshCookie,
  clearRefreshCookie,
} from "@/lib/cookies";
import { connectToDB } from "@/lib/db";
import { RefreshToken } from "@/models/refresh-token";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!cookie) {
    return NextResponse.json(
      { error: "Missing refresh token" },
      { status: 401 }
    );
  }

  let payload: Awaited<ReturnType<typeof verifyRefreshToken>>;
  try {
    payload = await verifyRefreshToken(cookie);
  } catch {
    const res = NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
    clearRefreshCookie(res);
    return res;
  }

  await connectToDB();
  const current = await RefreshToken.findOne({ jti: payload.jti });
  if (
    !current ||
    current.revokedAt ||
    current.expiresAt.getTime() < Date.now()
  ) {
    const res = NextResponse.json(
      { error: "Refresh token expired or revoked" },
      { status: 401 }
    );
    clearRefreshCookie(res);
    return res;
  }

  // Rotate: revoke current and issue new
  const newJti = crypto.randomUUID();
  current.revokedAt = new Date();
  current.replacedBy = newJti;
  await current.save();

  const refreshExpSec = Math.floor(
    (current.expiresAt.getTime() - Date.now()) / 1000
  );
  // If near expiry, extend a fresh 7 days window instead of remaining time
  const finalRefreshExp = refreshExpSec > 0 ? refreshExpSec : 7 * 24 * 60 * 60;

  const newRefresh = await signRefreshToken(
    payload.sub as string,
    newJti,
    finalRefreshExp
  );
  await RefreshToken.create({
    jti: newJti,
    user: payload.sub,
    expiresAt: new Date(Date.now() + finalRefreshExp * 1000),
  });

  const access = await signAccessToken(payload.sub as string);

  const res = NextResponse.json(
    { accessToken: access.token, expiresIn: access.expiresIn },
    { status: 200 }
  );
  setRefreshCookie(res, newRefresh.token, newRefresh.expiresIn);
  return res;
}
