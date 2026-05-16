"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getBotLogs } from "@/lib/services/bot/logs.service";
import { toast } from "sonner";

type LogItem = Record<string, unknown>;

export type NotifItem = {
  id: string;
  collection: "logs" | "feedbacks";
  logType: string;
  user_id?: string | number;
  date?: string;
  time?: string;
};

export const ALL_NOTIF_TYPES = [
  "ADMIN_ACTION",
  "GROUP_ACTION",
  "BOT_ACTION",
  "USER_ACTION",
  "FEEDBACK",
] as const;

export type NotifType = (typeof ALL_NOTIF_TYPES)[number];

export const TYPE_LABELS: Record<string, string> = {
  ADMIN_ACTION: "Admin Action",
  GROUP_ACTION: "Group Action",
  BOT_ACTION:   "Bot Action",
  USER_ACTION:  "User Action",
  FEEDBACK:     "New Feedback",
};

const LOG_COLLECTION_TYPES = new Set(["ADMIN_ACTION", "GROUP_ACTION", "BOT_ACTION", "USER_ACTION"]);

type SseEvent = {
  collection?: string;
  op?: string;
  logType?: string;
  type?: string;
  id?: string;
  userId?: string | number | null;
  date?: string | null;
  time?: string | null;
  meta?: string | null;
};

export function useNotifications() {
  const qc = useQueryClient();
  const router = useRouter();
  const [subscribedTypes, setSubscribedTypes] = useState<string[]>([...ALL_NOTIF_TYPES]);
  const [unread, setUnread] = useState(0);
  const prevTotal = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/user/notification-prefs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { subscribedTypes?: string[] } | null) => {
        if (d?.subscribedTypes?.length) setSubscribedTypes(d.subscribedTypes);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      es = new EventSource("/api/sse/notifications");

      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data as string) as SseEvent;
          if (d.type === "error") return;
          if (d.op !== "insert" || !d.logType) return;

          const label = TYPE_LABELS[d.logType] ?? d.logType;

          // Navigate to detail page if we have an ID, else fall back to list
          const dest = d.id
            ? `/dashboard/logs/${d.id}`
            : d.collection === "feedbacks"
              ? "/dashboard/feedbacks"
              : "/dashboard/notifications";

          const parts: string[] = [];
          if (d.userId) parts.push(`User ${d.userId}`);
          if (d.date || d.time) parts.push([d.date, d.time].filter(Boolean).join(" "));
          if (d.meta) {
            try {
              const parsed = JSON.parse(d.meta) as Record<string, unknown>;
              const readable = Object.entries(parsed)
                .filter(([, v]) => v !== null && v !== undefined && v !== "")
                .map(([k, v]) => `${k.replace(/_/g, " ")}: ${String(v)}`)
                .join(" • ");
              if (readable) parts.push(readable);
            } catch {
              if (d.meta.trim()) parts.push(d.meta);
            }
          }
          const description = parts.join("  ·  ") || undefined;

          const toastAction = {
            label: "View",
            onClick: () => router.push(dest),
          };

          if (d.logType === "ADMIN_ACTION") {
            toast.error(label, { description, action: toastAction });
          } else if (d.logType === "FEEDBACK") {
            toast.warning(label, { description, action: toastAction });
          } else {
            toast.info(label, { description, action: toastAction });
          }

          setUnread((n) => n + 1);
          void qc.invalidateQueries({ queryKey: ["notifications"] });
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
  }, [qc, router]);

  const logTypeParam = subscribedTypes
    .filter((t) => LOG_COLLECTION_TYPES.has(t))
    .join(",");

  const { data } = useQuery({
    queryKey: ["notifications", logTypeParam],
    queryFn: () => getBotLogs({ type: logTypeParam, limit: 20, page: 0 }),
    enabled: logTypeParam.length > 0,
    placeholderData: (prev) => prev,
  });

  const recent: NotifItem[] = ((data?.data ?? []) as LogItem[]).map((r) => ({
    id: String(r._id ?? ""),
    collection: "logs",
    logType: String(r.type ?? "").toUpperCase(),
    user_id: r.user_id as string | number | undefined,
    date: r.date as string | undefined,
    time: r.time as string | undefined,
  }));

  const total = data?.total ?? 0;

  useEffect(() => {
    if (prevTotal.current === null) {
      prevTotal.current = total;
    }
  }, [total]);

  const clearUnread = useCallback(() => {
    setUnread(0);
    prevTotal.current = total;
  }, [total]);

  return { unread, recent, clearUnread, subscribedTypes };
}
