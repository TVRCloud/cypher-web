import { fail, ok } from "@/lib/http/response";
import { cleanTextParam, containsRegex, exactRegex, parsePagination } from "@/lib/http/query";
import { paginate } from "@/lib/bot/paginate";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotFeedbackModel } from "@/lib/bot/models/feedback";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams, { defaultLimit: 20, maxLimit: 100 });
    const status = cleanTextParam(url.searchParams.get("status"));
    const type = cleanTextParam(url.searchParams.get("type"));
    const search = cleanTextParam(url.searchParams.get("search"));

    const ALLOWED_SORTS = ["timestamp", "status", "type", "user_id"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "timestamp";
    const sortDir = url.searchParams.get("sort_dir") === "asc" ? 1 : -1;

    const FeedbackModel = await getBotFeedbackModel();
    const match: Record<string, unknown> = {};
    if (status) match.status = exactRegex(status);
    if (type)   match.type   = exactRegex(type);
    if (search) match.$or = [{ username: containsRegex(search) }, { feedback: containsRegex(search) }];

    const { data, total } = await paginate(FeedbackModel, match, { [sortBy]: sortDir, _id: -1 }, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot feedbacks", 400);
  }
}
