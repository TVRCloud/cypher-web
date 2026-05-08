import { requirePermission } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { logoutAllUserSessions } from "@/lib/services/auth-service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("sessions.revoke");
    const { id } = await context.params;
    await logoutAllUserSessions(id);

    return ok({ success: true });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode);
    return fail("Unable to logout all sessions", 400);
  }
}
