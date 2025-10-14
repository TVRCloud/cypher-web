import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "Missing JWT secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)."
  );
}

const accessKey = new TextEncoder().encode(ACCESS_SECRET);
const refreshKey = new TextEncoder().encode(REFRESH_SECRET);

export type AccessTokenPayload = JWTPayload & { sub: string; type: "access" };
export type RefreshTokenPayload = JWTPayload & {
  sub: string;
  type: "refresh";
  jti: string;
};

export async function signAccessToken(userId: string, expiresInSec = 10 * 60) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const token = await new SignJWT({ type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(accessKey);
  return { token, expiresIn: expiresInSec };
}

export async function signRefreshToken(
  userId: string,
  jti: string,
  expiresInSec = 7 * 24 * 60 * 60
) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const token = await new SignJWT({ type: "refresh", jti })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(refreshKey);
  return { token, expiresIn: expiresInSec };
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify<AccessTokenPayload>(token, accessKey);
  if (payload.type !== "access") throw new Error("Invalid token type");
  return payload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify<RefreshTokenPayload>(token, refreshKey);
  if (payload.type !== "refresh" || !payload.jti)
    throw new Error("Invalid refresh token");
  return payload;
}
