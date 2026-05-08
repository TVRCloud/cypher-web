import { requirePermission } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { SessionModel } from "@/lib/models/session";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("sessions.read");
    await connectPrimaryDb();

    const { id } = await context.params;
    const sessions = await SessionModel.find({ userId: id, revoked: false }).sort({ lastUsedAt: -1 }).lean();
    return ok(sessions);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode);
    return fail("Unable to fetch user sessions", 400);
  }
}
