import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotDownloadModel } from "@/lib/bot/models/download";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const days = Math.min(Number(url.searchParams.get("days") ?? "7"), 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const DownloadModel = await getBotDownloadModel();
    const data = await DownloadModel.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "+05:30" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    return ok(data);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch download chart", 400);
  }
}
