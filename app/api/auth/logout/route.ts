import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requireAuth } from "@/lib/auth/guards";
import { logoutAllUserSessions } from "@/lib/services/auth-service";

export async function POST() {
  try {
    const user = await requireAuth();
    await logoutAllUserSessions(user.id);
    return ok({ success: true });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode);
    return fail("Unable to logout", 400);
  }
}
