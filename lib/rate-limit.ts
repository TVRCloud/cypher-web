type Entry = { count: number; reset: number };

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  options: { windowMs: number; max: number }
) {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const entry = store.get(key);
  if (!entry || entry.reset < windowStart) {
    store.set(key, { count: 1, reset: now + options.windowMs });
    return {
      ok: true,
      remaining: options.max - 1,
      reset: now + options.windowMs,
    };
  }

  if (entry.count >= options.max) {
    return { ok: false, remaining: 0, reset: entry.reset };
  }

  entry.count += 1;
  store.set(key, entry);
  return { ok: true, remaining: options.max - entry.count, reset: entry.reset };
}
