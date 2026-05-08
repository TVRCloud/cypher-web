import { revokeSessionSchema } from "@/lib/validation/auth";
import { requirePermission } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { revokeSessionById } from "@/lib/services/auth-service";

export async function POST(req: Request) {
  try {
    await requirePermission("sessions.revoke");

    const body = await req.json();
    const { sessionId } = revokeSessionSchema.parse(body);
    const session = await revokeSessionById(sessionId);

    return ok({ success: true, sessionId: session._id.toString() });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to revoke session", 400);
  }
}
