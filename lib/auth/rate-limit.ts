import { env } from "@/lib/config/env";

/**
 * Minimal in-memory sliding-window rate limiter.
 * NOTE: state lives in this process only. With several instances / serverless
 * isolates each keeps its own counters, so effective limits are per instance.
 * Use a shared store (e.g. Redis) if strict global limits are required.
 */
type Bucket = number[];

/** Buckets are partitioned by key namespace (text before the first ":") so keys an attacker can
 *  mint freely (e.g. emails) can never push out buckets in another namespace (e.g. IPs). */
const namespaces = new Map<string, Map<string, Bucket>>();
const MAX_KEYS_PER_NAMESPACE = 10_000;
const lastSweep = new Map<string, number>();

function nsOf(key: string) {
  const i = key.indexOf(":");
  return i === -1 ? key : key.slice(0, i);
}

function bucketsFor(key: string) {
  const ns = nsOf(key);
  let map = namespaces.get(ns);
  if (!map) {
    map = new Map();
    namespaces.set(ns, map);
  }
  return { ns, map };
}

const live = (hits: Bucket, now: number, windowMs: number) => hits.filter((t) => now - t < windowMs);

function makeRoom(ns: string, map: Map<string, Bucket>, now: number, windowMs: number, limit: number) {
  if (now - (lastSweep.get(ns) ?? 0) < 60_000 && map.size < MAX_KEYS_PER_NAMESPACE) return;
  lastSweep.set(ns, now);
  for (const [k, hits] of map) {
    if (!live(hits, now, windowMs).length) map.delete(k);
  }
  // Still full: evict the buckets with the FEWEST live hits (never blocking ones), so an
  // attacker flooding single-hit junk keys can't push out a bucket that is close to its limit.
  if (map.size >= MAX_KEYS_PER_NAMESPACE) {
    const candidates: [string, number][] = [];
    for (const [k, hits] of map) {
      const n = live(hits, now, windowMs).length;
      if (n < limit) candidates.push([k, n]);
    }
    candidates.sort((x, y) => x[1] - y[1]);
    const toDrop = Math.min(candidates.length, Math.ceil(MAX_KEYS_PER_NAMESPACE * 0.1));
    for (let i = 0; i < toDrop; i++) map.delete(candidates[i][0]);
  }
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSec: number };

/** Read-only check: is `key` already at its limit? Does not record a hit. */
export function isRateLimited(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const hits = namespaces.get(nsOf(key))?.get(key);
  return !!hits && live(hits, now, windowMs).length >= limit;
}

/** Records a hit for `key` and reports whether it is within `limit` per `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const { ns, map } = bucketsFor(key);
  makeRoom(ns, map, now, windowMs, limit);
  // Only possible when the namespace is full of buckets that are all actively blocking.
  if (!map.has(key) && map.size >= MAX_KEYS_PER_NAMESPACE) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil(windowMs / 1000) };
  }
  const hits = live(map.get(key) ?? [], now, windowMs);

  if (hits.length >= limit) {
    map.set(key, hits);
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
  }

  hits.push(now);
  map.set(key, hits);
  return { allowed: true, remaining: limit - hits.length, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
  namespaces.get(nsOf(key))?.delete(key);
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
