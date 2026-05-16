import { requireAuth } from "@/lib/auth/guards";
import { connectBotDb } from "@/lib/db/bot-mongoose";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { NotificationPrefModel } from "@/lib/models/notification-pref";
import { HttpError } from "@/lib/http/errors";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const PREF_REFRESH_MS = 60_000;
const ALL_TYPES = ["ADMIN_ACTION", "GROUP_ACTION", "BOT_ACTION", "USER_ACTION", "FEEDBACK"];

const LOG_TYPES = new Set(["ADMIN_ACTION", "GROUP_ACTION", "BOT_ACTION", "USER_ACTION"]);

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

      try {
        await connectPrimaryDb();
        const userObjectId = new mongoose.Types.ObjectId(userId);

        let prefDoc = await NotificationPrefModel.findOne({ userId: userObjectId }).lean() as
          | { subscribedTypes?: string[] } | null;
        let subscribedTypes: string[] = prefDoc?.subscribedTypes?.length
          ? prefDoc.subscribedTypes
          : ALL_TYPES;

        prefRefreshTimer = setInterval(async () => {
          try {
            prefDoc = await NotificationPrefModel.findOne({ userId: userObjectId }).lean() as
              | { subscribedTypes?: string[] } | null;
            subscribedTypes = prefDoc?.subscribedTypes?.length
              ? prefDoc.subscribedTypes
              : ALL_TYPES;
          } catch { /* non-fatal */ }
        }, PREF_REFRESH_MS);

        const botConn = await connectBotDb();
        const db = botConn.db;
        if (!db) throw new Error("Bot DB not ready");

        // Watch both logs and feedbacks at the DB level
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

            if (coll === "logs") {
              const rawType = typeof doc.type === "string" ? doc.type : "";
              const logType = rawType.toUpperCase();
              if (!LOG_TYPES.has(logType)) return;
              if (!subscribedTypes.map((t) => t.toUpperCase()).includes(logType)) return;
              const meta = doc.meta != null
                ? (typeof doc.meta === "object" ? JSON.stringify(doc.meta) : String(doc.meta))
                : null;
              enqueue(`data: ${JSON.stringify({
                collection: "logs",
                op: "insert",
                logType,
                id: String(doc._id ?? ""),
                userId: doc.user_id ?? null,
                date: doc.date ?? null,
                time: doc.time ?? null,
                meta: meta ? meta.slice(0, 120) : null,
              })}\n\n`);
            } else if (coll === "feedbacks") {
              if (!subscribedTypes.map((t) => t.toUpperCase()).includes("FEEDBACK")) return;
              const desc = typeof doc.message === "string"
                ? doc.message.slice(0, 120)
                : (typeof doc.content === "string" ? doc.content.slice(0, 120) : null);
              enqueue(`data: ${JSON.stringify({
                collection: "feedbacks",
                op: "insert",
                logType: "FEEDBACK",
                id: String(doc._id ?? ""),
                userId: doc.user_id ?? null,
                date: doc.date ?? null,
                time: doc.time ?? null,
                meta: desc,
              })}\n\n`);
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
