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

function buildToastDescription(
  rawMeta: string | null | undefined,
  userId: string | number | null | undefined,
): string | undefined {
  const parts: string[] = [];

  if (rawMeta) {
    try {
      const m = JSON.parse(rawMeta) as Record<string, unknown>;
      const str = (k: string) => (typeof m[k] === "string" && (m[k] as string).trim() ? m[k] as string : null);

      // Actor: prefer @username over display name over user_id
      const actor = str("username")
        ? `@${str("username")}`
        : str("user") ?? (userId ? `User ${userId}` : null);
      if (actor) parts.push(actor);

      // What happened
      if (str("action")) parts.push(str("action")!);

      // Reference numbers
      if (str("ticket_id")) parts.push(`#${str("ticket_id")}`);
      if (str("command")) parts.push(str("command")!);

      // Message content — most meaningful, show truncated
      const msg = str("message") ?? str("text") ?? str("reason");
      if (msg) parts.push(`"${msg.slice(0, 60)}${msg.length > 60 ? "…" : ""}"`);
    } catch {
      // meta wasn't JSON — skip it
    }
  } else if (userId) {
    parts.push(`User ${userId}`);
  }

  return parts.length ? parts.join(" · ") : undefined;
}

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

          const dest = d.id
            ? `/dashboard/logs/${d.id}`
            : "/dashboard/notifications";

          const description = buildToastDescription(d.meta, d.userId);

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
