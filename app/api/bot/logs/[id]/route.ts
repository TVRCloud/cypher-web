import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotLogModel } from "@/lib/bot/models/log";
import { Types } from "mongoose";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("analytics.read");
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) return fail("Invalid ID", 400);

    const LogModel = await getBotLogModel();
    const [result] = await LogModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      { $limit: 1 },
    ]);

    if (!result) return fail("Log not found", 404);
    return ok(result);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch log", 400);
  }
}
