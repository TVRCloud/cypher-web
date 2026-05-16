import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotUserModel } from "@/lib/bot/models/user";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const page = Math.max(Number(url.searchParams.get("page") ?? "0"), 0);
    const search = url.searchParams.get("search") ?? null;
    const skip = page * limit;

    const ALLOWED_SORTS = ["_id", "first_name", "username", "date"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "_id";
    const sortDir = url.searchParams.get("sort_dir") === "asc" ? 1 : -1;

    const match = search ? { $or: [{ first_name: { $regex: search, $options: "i" } }, { last_name: { $regex: search, $options: "i" } }, { username: { $regex: search, $options: "i" } }] } : {};

    const UserModel = await getBotUserModel();
    const [result] = await UserModel.aggregate([
      { $match: match },
      {
        $facet: {
          data: [{ $sort: { [sortBy]: sortDir } }, { $skip: skip }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    const data = result?.data ?? [];
    const total: number = result?.meta[0]?.total ?? 0;

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot users", 400);
  }
}
