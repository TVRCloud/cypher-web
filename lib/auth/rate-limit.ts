/**
 * Minimal in-memory sliding-window rate limiter.
 * NOTE: state lives in this process only. With several instances / serverless
 * isolates each keeps its own counters, so effective limits are per instance.
 * Use a shared store (e.g. Redis) if strict global limits are required.
 */
type Bucket = number[];

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;
let lastSweep = 0;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000 && buckets.size < MAX_KEYS) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    if (!hits.length || now - hits[hits.length - 1] > windowMs) buckets.delete(key);
  }
  // Hard cap: drop oldest entries (Map keeps insertion order).
  while (buckets.size >= MAX_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSec: number };

/** Records a hit for `key` and reports whether it is within `limit` per `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  sweep(now, windowMs);
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, remaining: limit - hits.length, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/** Best-effort client IP. x-forwarded-for is only trustworthy behind a proxy that overwrites it. */
export function getIpFromHeaders(get: (name: string) => string | null | undefined): string {
  const forwarded = get("x-forwarded-for") ?? get("x-real-ip") ?? "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}
