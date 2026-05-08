import { readRefreshCookie } from "@/lib/auth/cookies";
import { getClientMeta } from "@/lib/auth/request";
import { HttpError } from "@/lib/http/errors";
import { fail, ok } from "@/lib/http/response";
import { refreshSession } from "@/lib/services/auth-service";

export async function POST() {
  try {
    const refreshToken = await readRefreshCookie();
    if (!refreshToken) return fail("Missing refresh token", 401);

    const result = await refreshSession(refreshToken, await getClientMeta());
    return ok(result);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to refresh session", 400);
  }
}
