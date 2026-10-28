import { fail, ok } from "@/lib/http/response";
import { paginate } from "@/lib/bot/paginate";
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
    const { data, total } = await paginate(SettingModel, {}, { _id: 1 }, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot settings", 400);
  }
}
