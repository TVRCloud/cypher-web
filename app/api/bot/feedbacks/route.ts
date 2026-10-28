import { fail, ok } from "@/lib/http/response";
import { paginate } from "@/lib/bot/paginate";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotFeedbackModel } from "@/lib/bot/models/feedback";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const page = Math.max(Number(url.searchParams.get("page") ?? "0"), 0);
    const status = url.searchParams.get("status") ?? null;
    const type = url.searchParams.get("type") ?? null;
    const search = url.searchParams.get("search") ?? null;
    const skip = page * limit;

    const ALLOWED_SORTS = ["timestamp", "status", "type", "user_id"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "timestamp";
    const sortDir = url.searchParams.get("sort_dir") === "asc" ? 1 : -1;

    const FeedbackModel = await getBotFeedbackModel();
    const match: Record<string, unknown> = {};
    if (status) match.status = { $regex: `^${status}$`, $options: "i" };
    if (type)   match.type   = { $regex: `^${type}$`,   $options: "i" };
    if (search) match.$or = [{ username: { $regex: search, $options: "i" } }, { feedback: { $regex: search, $options: "i" } }];

    const { data, total } = await paginate(FeedbackModel, match, { [sortBy]: sortDir, _id: -1 }, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot feedbacks", 400);
  }
}
