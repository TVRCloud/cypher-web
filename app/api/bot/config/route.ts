import { fail, ok } from "@/lib/http/response";
import { parsePagination } from "@/lib/http/query";
import { paginate } from "@/lib/bot/paginate";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotConfigModel } from "@/lib/bot/models/config";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams, { defaultLimit: 50, maxLimit: 200 });

    const ConfigModel = await getBotConfigModel();
    const { data, total } = await paginate(ConfigModel, {}, { _id: 1 }, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot config", 400);
  }
}
