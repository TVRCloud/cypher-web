import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@/lib/config/env";
import { HttpError } from "@/lib/http/errors";

export type AccessTokenPayload = {
  userId: string;
  email: string;
  role: string;
  tokenVersion: number;
};

export type RefreshTokenPayload = {
  userId: string;
  tokenVersion: number;
  tokenId: string;
};

function parseExpiryToDate(duration: string) {
  const number = Number.parseInt(duration, 10);
  if (duration.endsWith("m")) return new Date(Date.now() + number * 60 * 1000);
  if (duration.endsWith("h")) return new Date(Date.now() + number * 60 * 60 * 1000);
  return new Date(Date.now() + number * 24 * 60 * 60 * 1000);
}

export function createAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  } catch {
    throw new HttpError(401, "Invalid access token");
  }
}

export function createRefreshToken(payload: RefreshTokenPayload) {
  const token = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"],
  });

  return {
    token,
    tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
    expiresAt: parseExpiryToDate(env.REFRESH_TOKEN_EXPIRES),
  };
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }
}

export function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
