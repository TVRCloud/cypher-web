import { NextResponse, type NextRequest } from "next/server"
import { REFRESH_TOKEN_COOKIE, clearRefreshCookie } from "@/lib/cookies"
import { verifyRefreshToken } from "@/lib/jwt"
import { connectToDB } from "@/lib/db"
import { RefreshToken } from "@/models/refresh-token"

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  const res = NextResponse.json({ message: "Logged out" }, { status: 200 })
  if (!cookie) {
    clearRefreshCookie(res)
    return res
  }

  try {
    const payload = await verifyRefreshToken(cookie)
    await connectToDB()
    await RefreshToken.updateOne({ jti: payload.jti }, { $set: { revokedAt: new Date() } })
  } catch {
    // ignore invalid token, still clear cookie
  }

  clearRefreshCookie(res)
  return res
}
