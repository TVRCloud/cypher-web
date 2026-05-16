import { requirePermission } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { SessionModel } from "@/lib/models/session";

export async function GET() {
  try {
    await requirePermission("sessions.read");
    await connectPrimaryDb();

    const sessions = await SessionModel.find({ revoked: false })
      .populate({ path: "userId", select: "email roleId", options: { lean: true } })
      .sort({ lastUsedAt: -1 })
      .lean();
    return ok(sessions);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch sessions", 400);
  }
}
