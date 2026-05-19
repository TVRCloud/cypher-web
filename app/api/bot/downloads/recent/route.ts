import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotDownloadModel } from "@/lib/bot/models/download";

export async function GET() {
  try {
    await requirePermission("analytics.read");

    const DownloadModel = await getBotDownloadModel();
    const data = await DownloadModel.find({}).sort({ timestamp: -1 }).limit(10).lean();

    return ok(data);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch recent downloads", 400);
  }
}
