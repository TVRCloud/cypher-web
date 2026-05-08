import type { PaginatedParams, PaginatedResponse } from "@/lib/services/bot/types";

function toQueryString(params: PaginatedParams) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  return search.toString();
}

export async function fetchBotItem<T = Record<string, unknown>>(
  endpoint: string,
  id: string,
): Promise<T> {
  const url = `${endpoint}/${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "GET" });
  const payload = (await res.json()) as T | { message?: string };

  if (!res.ok) {
    throw new Error((payload as { message?: string }).message ?? "Item not found");
  }

  return payload as T;
}

export async function fetchBotModule<T = Record<string, unknown>>(
  endpoint: string,
  params: PaginatedParams,
): Promise<PaginatedResponse<T>> {
  const query = toQueryString(params);
  const url = query ? `${endpoint}?${query}` : endpoint;

  const res = await fetch(url, { method: "GET" });
  const payload = (await res.json()) as PaginatedResponse<T> | { message?: string };

  if (!res.ok) {
    throw new Error((payload as { message?: string }).message ?? "Failed to fetch data");
  }

  const ok = payload as PaginatedResponse<T>;
  return {
    ...ok,
    totalPages: ok.totalPages ?? Math.ceil(ok.total / ok.limit),
  };
}
