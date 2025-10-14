import { NextResponse, type NextRequest } from "next/server";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/user";
import { RefreshToken } from "@/models/refresh-token";
import { verifyPassword, getClientIp } from "@/lib/auth-helpers";
import { loginSchema } from "@/validation/auth";
import { rateLimit } from "@/lib/rate-limit";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setRefreshCookie } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`login:${ip}`, { windowMs: 60_000, max: 20 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  await connectToDB();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

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
    { accessToken: access.token, expiresIn: access.expiresIn },
    { status: 200 }
  );
  setRefreshCookie(res, refresh.token, refresh.expiresIn);
  return res;
}
