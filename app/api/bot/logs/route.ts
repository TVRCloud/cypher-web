import { fail, ok } from "@/lib/http/response";
import { paginate } from "@/lib/bot/paginate";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotLogModel } from "@/lib/bot/models/log";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const page = Math.max(Number(url.searchParams.get("page") ?? "0"), 0);
    const typeParam = url.searchParams.get("type") ?? null;
    const types = typeParam ? typeParam.split(",").map((t) => t.trim()).filter(Boolean) : null;
    const search = url.searchParams.get("search") ?? null;
    const skip = page * limit;

    const ALLOWED_SORTS = ["timestamp", "type", "user_id"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "timestamp";
    const sortDir = url.searchParams.get("sort_dir") === "asc" ? 1 : -1;

    const LogModel = await getBotLogModel();
    const match: Record<string, unknown> = types
      ? { $or: types.map((t) => ({ type: { $regex: `^${t}$`, $options: "i" } })) }
      : {};
    if (search) {
      const asNum = Number(search);
      if (!isNaN(asNum) && search.trim() !== "") {
        match.user_id = asNum;
      } else {
        match.type = { $regex: search, $options: "i" };
      }
    }

    const { data, total } = await paginate(LogModel, match, { [sortBy]: sortDir, _id: -1 }, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot logs", 400);
  }
}
