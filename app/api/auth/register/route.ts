import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { RefreshToken } from "@/models/refresh-token";
import { setRefreshCookie } from "@/lib/cookies";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp, hashPassword } from "@/lib/auth-helpers";
import { User } from "@/models/user";
import { connectToDB } from "@/lib/db";
import { registerSchema } from "@/validation/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`register:${ip}`, { windowMs: 60_000, max: 10 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json();
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  await connectToDB();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, password: passwordHash });

  // 🔹 Auto-login (issue access + refresh token)
  const jti = crypto.randomUUID();
  const refreshExpSec = 7 * 24 * 60 * 60;
  const access = await signAccessToken(user._id.toString());
  const refresh = await signRefreshToken(
    user._id.toString(),
    jti,
    refreshExpSec
  );

  await RefreshToken.create({
    jti,
    user: user._id,
    expiresAt: new Date(Date.now() + refreshExpSec * 1000),
  });

  const res = NextResponse.json(
    {
      message: "Registered and logged in",
      accessToken: access.token,
      expiresIn: access.expiresIn,
      user: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
      },
    },
    { status: 201 }
  );

  setRefreshCookie(res, refresh.token, refresh.expiresIn);
  return res;
}
