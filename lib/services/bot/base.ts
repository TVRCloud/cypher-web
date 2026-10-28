import type { PaginatedParams, PaginatedResponse } from "@/lib/services/bot/types";

function toQueryString(params: PaginatedParams) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  return search.toString();
}

/** fetch + json + consistent error. Throws `payload.message` or `fallbackMessage` on non-2xx. */
export async function apiFetch<T>(
  url: string,
  init: RequestInit = { method: "GET" },
  fallbackMessage = "Request failed",
): Promise<T> {
  const res = await fetch(url, init);
  const payload = (await res.json()) as T | { message?: string };

  if (!res.ok) {
    throw new Error((payload as { message?: string } | null)?.message ?? fallbackMessage);
  }

  return payload as T;
}

export async function fetchBotItem<T = Record<string, unknown>>(
  endpoint: string,
  id: string,
): Promise<T> {
  const url = `${endpoint}/${encodeURIComponent(id)}`;
  return apiFetch<T>(url, { method: "GET" }, "Item not found");
}

export async function fetchBotModule<T = Record<string, unknown>>(
  endpoint: string,
  params: PaginatedParams,
): Promise<PaginatedResponse<T>> {
  const query = toQueryString(params);
  const url = query ? `${endpoint}?${query}` : endpoint;

  const ok = await apiFetch<PaginatedResponse<T>>(url, { method: "GET" }, "Failed to fetch data");
  return {
    ...ok,
    totalPages: ok.totalPages ?? (ok.limit > 0 ? Math.ceil(ok.total / ok.limit) : 0),
  };
}
