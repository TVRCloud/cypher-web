"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { botKeys } from "@/lib/query-keys";

const INVALIDATE_DEBOUNCE_MS = 500;

export function useChangeStream() {
  const qc = useQueryClient();

  useEffect(() => {
    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    const dirty = new Set<string>();

    // Coalesce bursts: one invalidation per collection (and one for stats) per window.
    const flush = () => {
      flushTimer = null;
      const collections = [...dirty];
      dirty.clear();
      for (const c of collections) void qc.invalidateQueries({ queryKey: botKeys.modules(c) });
      if (collections.length) void qc.invalidateQueries({ queryKey: botKeys.stats });
    };

    const connect = () => {
      es = new EventSource("/api/sse/bot");
      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data as string) as { collection?: string };
          if (d.collection) {
            dirty.add(d.collection);
            if (!flushTimer) flushTimer = setTimeout(flush, INVALIDATE_DEBOUNCE_MS);
          }
        } catch {
          // ignore parse errors
        }
      };
      es.onerror = () => {
        es?.close();
        retry = setTimeout(connect, 5000);
      };
    };
    connect();
    return () => {
      es?.close();
      if (retry) clearTimeout(retry);
      if (flushTimer) clearTimeout(flushTimer);
    };
  }, [qc]);
}
