import { fail, ok } from "@/lib/http/response";
import { cleanTextParam, containsRegex, exactRegex, parsePagination } from "@/lib/http/query";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotLogModel } from "@/lib/bot/models/log";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams, { defaultLimit: 20, maxLimit: 100 });
    const typeParam = url.searchParams.get("type") ?? null;
    const types = typeParam ? typeParam.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20) : null;
    const search = cleanTextParam(url.searchParams.get("search"));

    const ALLOWED_SORTS = ["timestamp", "type", "user_id"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "timestamp";
    const sortDir = url.searchParams.get("sort_dir") === "asc" ? 1 : -1;

    const LogModel = await getBotLogModel();
    const match: Record<string, unknown> = types
      ? { $or: types.map((t) => ({ type: exactRegex(t, 50) })) }
      : {};
    if (search) {
      const asNum = Number(search);
      if (!isNaN(asNum) && search.trim() !== "") {
        match.user_id = asNum;
      } else {
        match.type = containsRegex(search);
      }
    }

    const [result] = await LogModel.aggregate([
      { $match: match },
      {
        $facet: {
          data: [{ $sort: { [sortBy]: sortDir, _id: -1 } }, { $skip: skip }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    const data = result?.data ?? [];
    const total: number = result?.meta[0]?.total ?? 0;

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot logs", 400);
  }
}
