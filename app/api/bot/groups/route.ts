import { fail, ok } from "@/lib/http/response";
import { paginate } from "@/lib/bot/paginate";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotGroupModel } from "@/lib/bot/models/group";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const page = Math.max(Number(url.searchParams.get("page") ?? "0"), 0);
    const search = url.searchParams.get("search") ?? null;
    const skip = page * limit;

    const ALLOWED_SORTS = ["_id", "title", "member_count", "added_at"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "added_at";
    const sortDir = url.searchParams.get("sort_dir") === "asc" ? 1 : -1;

    const match = search ? { title: { $regex: search, $options: "i" } } : {};

    const GroupModel = await getBotGroupModel();
    const { data, total } = await paginate(GroupModel, match, { [sortBy]: sortDir, _id: -1 }, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot groups", 400);
  }
}
