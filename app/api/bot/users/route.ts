import { fail, ok } from "@/lib/http/response";
import { cleanTextParam, containsRegex, parsePagination } from "@/lib/http/query";
import { paginate } from "@/lib/bot/paginate";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotUserModel } from "@/lib/bot/models/user";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams, { defaultLimit: 20, maxLimit: 100 });
    const search = cleanTextParam(url.searchParams.get("search"));

    const ALLOWED_SORTS = ["_id", "first_name", "username", "date"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "_id";
    const sortDir = url.searchParams.get("sort_dir") === "asc" ? 1 : -1;

    const match = search ? { $or: [{ first_name: containsRegex(search) }, { last_name: containsRegex(search) }, { username: containsRegex(search) }] } : {};

    const UserModel = await getBotUserModel();
    const { data, total } = await paginate(UserModel, match, { [sortBy]: sortDir }, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot users", 400);
  }
}
