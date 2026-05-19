import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotDownloadModel } from "@/lib/bot/models/download";

export async function GET() {
  try {
    await requirePermission("analytics.read");

    const DownloadModel = await getBotDownloadModel();
    const data = await DownloadModel.aggregate([
      { $group: { _id: "$file_name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { file_name: "$_id", count: 1, _id: 0 } },
    ]);

    return ok(data);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch top files", 400);
  }
}
