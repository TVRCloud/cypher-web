import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotFileModel } from "@/lib/bot/models/file";

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const page = Math.max(Number(url.searchParams.get("page") ?? "0"), 0);
    const search   = url.searchParams.get("search")   ?? null;
    const quality  = url.searchParams.get("quality")  ?? null;
    const language = url.searchParams.get("language") ?? null;
    const year     = url.searchParams.get("year")     ?? null;
    const skip = page * limit;

    const ALLOWED_SORTS = ["file_name", "file_size", "created_at", "year"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "created_at";
    const sortDir = (url.searchParams.get("sort_dir") === "asc" ? 1 : -1) as 1 | -1;

    const FileModel = await getBotFileModel();
    const match: Record<string, unknown> = search ? { $text: { $search: search } } : {};
    if (quality)  match.quality  = { $regex: quality,  $options: "i" };
    if (language) match.language = { $regex: language, $options: "i" };
    if (year) {
      const yearNum = Number(year);
      match.$or = isNaN(yearNum)
        ? [{ year }]
        : [{ year }, { year: yearNum }];
    }

    const sortStage: Record<string, 1 | -1 | { $meta: "textScore" }> = search
      ? { score: { $meta: "textScore" } }
      : { [sortBy]: sortDir };

    const [result] = await FileModel.aggregate([
      { $match: match },
      {
        $facet: {
          data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    const data = result?.data ?? [];
    const total: number = result?.meta[0]?.total ?? 0;

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot files", 400);
  }
}
