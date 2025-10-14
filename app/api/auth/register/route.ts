import { NextResponse, type NextRequest } from "next/server";
import { User } from "@/models/user";
import { hashPassword, getClientIp } from "@/lib/auth-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/validation/auth";
import { connectToDB } from "@/lib/db";

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

  const { email, password, username } = parsed.data;

  await connectToDB();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    username,
    email,
    password: passwordHash,
    role: "user",
  });

  console.log(user);

  return NextResponse.json(
    {
      message: "Registered",
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
    { status: 201 }
  );
}
