import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function getClientIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip =
    xf.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  return ip;
}
