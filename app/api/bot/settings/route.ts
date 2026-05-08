import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotSettingModel } from "@/lib/bot/models/setting";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
    const page = Math.max(Number(url.searchParams.get("page") ?? "0"), 0);
    const skip = page * limit;

    const SettingModel = await getBotSettingModel();
    const [result] = await SettingModel.aggregate([
      { $match: {} },
      {
        $facet: {
          data: [{ $sort: { _id: 1 } }, { $skip: skip }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    const data = result?.data ?? [];
    const total: number = result?.meta[0]?.total ?? 0;

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot settings", 400);
  }
}
