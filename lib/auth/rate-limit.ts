import { env } from "@/lib/config/env";

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
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSec: number };

/** Records a hit for `key` and reports whether it is within `limit` per `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  sweep(now, windowMs);
  // Fail closed when the map is full of live entries: never evict a bucket that may be
  // blocking someone, otherwise flooding with unique keys would reset active blocks.
  if (!buckets.has(key) && buckets.size >= MAX_KEYS) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil(windowMs / 1000) };
  }
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

/**
 * Best-effort client IP. The left-most x-forwarded-for entry is client-controlled, so we
 * take the entry added by the Nth trusted proxy from the RIGHT (TRUSTED_PROXY_COUNT,
 * default 1 = the nearest proxy, e.g. Vercel/nginx). Set it to the number of proxies you run.
 */
export function getIpFromHeaders(get: (name: string) => string | null | undefined): string {
  const trusted = env.TRUSTED_PROXY_COUNT;
  const parts = (get("x-forwarded-for") ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length && trusted > 0) {
    return parts[Math.max(0, parts.length - trusted)];
  }
  return get("x-real-ip")?.trim() || "unknown";
}
