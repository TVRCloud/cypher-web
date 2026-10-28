import { fail, ok } from "@/lib/http/response";
import { paginate } from "@/lib/bot/paginate";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotFileModel } from "@/lib/bot/models/file";
import { cleanTextParam, containsRegex, escapeRegex, parsePagination } from "@/lib/http/query";

// The bot lowercases/normalizes titles and indexes normalized_title (and [normalized_title, created_at]).
function normalizeTitle(input: string) {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams);
    const search   = cleanTextParam(url.searchParams.get("search"));
    const quality  = cleanTextParam(url.searchParams.get("quality"), 50);
    const language = cleanTextParam(url.searchParams.get("language"), 50);
    const year     = cleanTextParam(url.searchParams.get("year"), 10);

    const ALLOWED_SORTS = ["file_name", "file_size", "created_at", "year"];
    const sortBy = ALLOWED_SORTS.includes(url.searchParams.get("sort_by") ?? "") ? url.searchParams.get("sort_by")! : "created_at";
    const sortDir = (url.searchParams.get("sort_dir") === "asc" ? 1 : -1) as 1 | -1;

    const FileModel = await getBotFileModel();
    const filters: Record<string, unknown>[] = [];

    if (search) {
      // Indexed prefix match on normalized_title first; fall back to an escaped
      // case-insensitive substring match on file_name when the prefix finds nothing.
      const normalized = normalizeTitle(search);
      const prefix = normalized ? { normalized_title: { $regex: `^${escapeRegex(normalized)}` } } : null;
      const hasPrefixHit = prefix ? !!(await FileModel.exists(prefix)) : false;
      filters.push(hasPrefixHit && prefix ? prefix : { file_name: containsRegex(search) });
    }
    if (quality)  filters.push({ quality:  containsRegex(quality, 50) });
    if (language) filters.push({ language: containsRegex(language, 50) });
    if (year) {
      const yearNum = Number(year);
      filters.push({ $or: Number.isNaN(yearNum) ? [{ year }] : [{ year }, { year: yearNum }] });
    }
    const match = filters.length ? { $and: filters } : {};

    // When searching, order by recency (matches the [normalized_title, created_at] index).
    const sortStage: Record<string, 1 | -1> = search ? { created_at: -1 } : { [sortBy]: sortDir };

    const { data, total } = await paginate(FileModel, match, sortStage, skip, limit);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot files", 400);
  }
}
