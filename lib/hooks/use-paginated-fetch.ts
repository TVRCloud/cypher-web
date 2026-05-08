"use client";

import { useCallback, useEffect, useState } from "react";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePaginatedFetch<T>(url: string, initialLimit = 20) {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [data, setData] = useState<T[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p: number, l: number, signal: AbortSignal) => {
      await Promise.resolve();
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${url}?page=${p}&limit=${l}`, { signal });
        const json = (await res.json()) as PaginatedResponse<T> | { message?: string };
        if (!res.ok) {
          throw new Error(
            ("message" in json ? json.message : undefined) ?? "Failed to fetch data"
          );
        }
        const payload = json as PaginatedResponse<T>;
        setData(payload.data);
        setTotal(payload.total);
        setTotalPages(payload.totalPages);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData(page, limit, controller.signal);
    return () => controller.abort();
  }, [fetchData, page, limit]);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    void fetchData(page, limit, controller.signal);
  }, [fetchData, page, limit]);

  return {
    data,
    total,
    totalPages,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refresh,
  };
}
