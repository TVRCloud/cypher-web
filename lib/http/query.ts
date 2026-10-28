/** Escape a user string so it can be embedded literally in a RegExp / Mongo $regex. */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Trim and cap length of a free-text query param; returns null when empty. */
export function cleanTextParam(value: string | null | undefined, maxLength = 100): string | null {
  const trimmed = (value ?? "").trim().slice(0, maxLength);
  return trimmed ? trimmed : null;
}

/** Case-insensitive, escaped "contains" regex for a user supplied value. */
export function containsRegex(value: string, maxLength = 100) {
  return { $regex: escapeRegex(value.slice(0, maxLength)), $options: "i" } as const;
}

/** Case-insensitive, escaped exact-match regex for a user supplied value. */
export function exactRegex(value: string, maxLength = 100) {
  return { $regex: `^${escapeRegex(value.slice(0, maxLength))}$`, $options: "i" } as const;
}

type PaginationOptions = { defaultLimit?: number; maxLimit?: number; maxPage?: number };

function toInt(raw: string | null, fallback: number) {
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/**
 * Parse zero-based `page` and `limit` query params. NaN/invalid -> defaults,
 * limit clamped to [1, maxLimit], page clamped to [0, maxPage].
 */
export function parsePagination(searchParams: URLSearchParams, options: PaginationOptions = {}) {
  const { defaultLimit = 20, maxLimit = 100, maxPage = 10_000 } = options;
  const limit = Math.min(Math.max(toInt(searchParams.get("limit"), defaultLimit), 1), maxLimit);
  const page = Math.min(Math.max(toInt(searchParams.get("page"), 0), 0), maxPage);
  return { page, limit, skip: page * limit };
}
