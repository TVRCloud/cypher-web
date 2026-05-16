import { requireAuth } from "@/lib/auth/guards";
import { connectBotDb } from "@/lib/db/bot-mongoose";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { NotificationPrefModel } from "@/lib/models/notification-pref";
import { PushSubscriptionModel } from "@/lib/models/push-subscription";
import { HttpError } from "@/lib/http/errors";
import { sendPush } from "@/lib/web-push";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const PREF_REFRESH_MS = 60_000;
const ALL_TYPES = ["ADMIN_ACTION", "GROUP_ACTION", "BOT_ACTION", "USER_ACTION", "FEEDBACK"];
const LOG_TYPES = new Set(["ADMIN_ACTION", "GROUP_ACTION", "BOT_ACTION", "USER_ACTION"]);

const TYPE_LABELS: Record<string, string> = {
  ADMIN_ACTION: "Admin Action",
  GROUP_ACTION: "Group Action",
  BOT_ACTION:   "Bot Action",
  USER_ACTION:  "User Action",
  FEEDBACK:     "New Feedback",
};

function buildPushBody(meta: string | null, userId: unknown): string {
  if (!meta) return userId ? `User ${userId}` : "";
  try {
    const m = JSON.parse(meta) as Record<string, unknown>;
    const str = (k: string) => (typeof m[k] === "string" && (m[k] as string).trim() ? m[k] as string : null);
    const parts: string[] = [];
    const actor = str("username") ? `@${str("username")}` : str("user") ?? (userId ? `User ${userId}` : null);
    if (actor) parts.push(actor);
    if (str("action")) parts.push(str("action")!);
    if (str("ticket_id")) parts.push(`#${str("ticket_id")}`);
    const msg = str("message") ?? str("text") ?? str("reason");
    if (msg) parts.push(`"${msg.slice(0, 60)}${msg.length > 60 ? "…" : ""}"`);
    return parts.join(" · ");
  } catch {
    return meta.slice(0, 100);
  }
}

export async function GET(req: Request) {
  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof HttpError) return new Response("Unauthorized", { status: 401 });
    return new Response("Internal Server Error", { status: 500 });
  }

  const userId = user.id;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let changeStream: any = null;
      let prefRefreshTimer: ReturnType<typeof setInterval> | null = null;
      let closed = false;

      // Push subscription for this user (refreshed with prefs)
      let pushSub: { endpoint: string; keys: { p256dh: string; auth: string } } | null = null;

      const cleanup = () => {
        closed = true;
        if (prefRefreshTimer) clearInterval(prefRefreshTimer);
        void changeStream?.close().catch(() => null);
      };

      req.signal.addEventListener("abort", () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });

      const enqueue = (data: string) => {
        if (closed) return;
        try { controller.enqueue(enc.encode(data)); } catch { /* closed */ }
      };

      const loadPrefs = async (userObjectId: mongoose.Types.ObjectId) => {
        const [prefDoc, pushDoc] = await Promise.all([
          NotificationPrefModel.findOne({ userId: userObjectId }).lean() as Promise<{ subscribedTypes?: string[] } | null>,
          PushSubscriptionModel.findOne({ userId: userObjectId }).lean() as Promise<{ enabled?: boolean; endpoint?: string; keys?: { p256dh: string; auth: string } } | null>,
        ]);
        return {
          subscribedTypes: (prefDoc?.subscribedTypes?.length ? prefDoc.subscribedTypes : ALL_TYPES),
          pushSub: (pushDoc?.enabled && pushDoc.endpoint && pushDoc.keys)
            ? { endpoint: pushDoc.endpoint, keys: pushDoc.keys }
            : null,
        };
      };

      try {
        await connectPrimaryDb();
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const initial = await loadPrefs(userObjectId);
        let subscribedTypes = initial.subscribedTypes;
        pushSub = initial.pushSub;

        prefRefreshTimer = setInterval(async () => {
          try {
            const refreshed = await loadPrefs(userObjectId);
            subscribedTypes = refreshed.subscribedTypes;
            pushSub = refreshed.pushSub;
          } catch { /* non-fatal */ }
        }, PREF_REFRESH_MS);

        const botConn = await connectBotDb();
        const db = botConn.db;
        if (!db) throw new Error("Bot DB not ready");

        changeStream = db.watch(
          [{ $match: { operationType: "insert", "ns.coll": { $in: ["logs", "feedbacks"] } } }],
          { fullDocument: "updateLookup" },
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeStream.on("change", (change: any) => {
          if (closed) return;
          try {
            const coll = String(change?.ns?.coll ?? "");
            const doc = (change as { fullDocument?: Record<string, unknown> }).fullDocument;
            if (!doc) return;

            let payload: Record<string, unknown> | null = null;

            if (coll === "logs") {
              const rawType = typeof doc.type === "string" ? doc.type : "";
              const logType = rawType.toUpperCase();
              if (!LOG_TYPES.has(logType)) return;
              if (!subscribedTypes.map((t) => t.toUpperCase()).includes(logType)) return;
              const meta = doc.meta != null
                ? (typeof doc.meta === "object" ? JSON.stringify(doc.meta) : String(doc.meta))
                : null;
              payload = {
                collection: "logs", op: "insert", logType,
                id: String(doc._id ?? ""),
                userId: doc.user_id ?? null,
                date: doc.date ?? null,
                time: doc.time ?? null,
                meta: meta ? meta.slice(0, 120) : null,
              };
            } else if (coll === "feedbacks") {
              if (!subscribedTypes.map((t) => t.toUpperCase()).includes("FEEDBACK")) return;
              const desc = typeof doc.message === "string"
                ? doc.message.slice(0, 120)
                : (typeof doc.content === "string" ? doc.content.slice(0, 120) : null);
              payload = {
                collection: "feedbacks", op: "insert", logType: "FEEDBACK",
                id: String(doc._id ?? ""),
                userId: doc.user_id ?? null,
                date: doc.date ?? null,
                time: doc.time ?? null,
                meta: desc,
              };
            }

            if (!payload) return;

            enqueue(`data: ${JSON.stringify(payload)}\n\n`);

            // Also push to the user's browser (works even if tab is backgrounded)
            if (pushSub) {
              const logType = String(payload.logType ?? "");
              const dest = payload.collection === "feedbacks"
                ? "/dashboard/feedbacks"
                : `/dashboard/logs/${String(payload.id ?? "")}`;
              void sendPush(pushSub, {
                title: TYPE_LABELS[logType] ?? logType,
                body: buildPushBody(payload.meta as string | null, payload.userId),
                url: dest,
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-72x72.png",
              }).catch((err: unknown) => {
                // 410 = subscription gone — remove it
                if ((err as { statusCode?: number })?.statusCode === 410) {
                  void PushSubscriptionModel.deleteOne({ userId: new mongoose.Types.ObjectId(userId) }).catch(() => null);
                  pushSub = null;
                }
              });
            }
          } catch { /* non-fatal */ }
        });

        changeStream.on("error", (err: Error) => {
          enqueue(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
          cleanup();
          try { controller.close(); } catch { /* already closed */ }
        });
      } catch (err) {
        enqueue(`data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`);
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      }
    },
    cancel() { /* cleanup handled via signal */ },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
