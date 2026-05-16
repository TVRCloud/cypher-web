"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useChangeStream() {
  const qc = useQueryClient();

  useEffect(() => {
    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      es = new EventSource("/api/sse/bot");
      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data as string) as { collection?: string };
          if (d.collection) {
            void qc.invalidateQueries({ queryKey: ["bot-module", d.collection] });
            void qc.invalidateQueries({ queryKey: ["bot-stats"] });
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
    };
  }, [qc]);
}
