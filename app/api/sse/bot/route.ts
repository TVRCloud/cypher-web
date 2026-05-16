import { requireAuth } from "@/lib/auth/guards";
import { connectBotDb } from "@/lib/db/bot-mongoose";
import { HttpError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

const WATCHED_COLLECTIONS = new Set(["logs", "files", "users", "groups", "feedbacks"]);

export async function GET(req: Request) {
  try {
    await requireAuth();
  } catch (err) {
    if (err instanceof HttpError) return new Response("Unauthorized", { status: 401 });
    return new Response("Internal Server Error", { status: 500 });
  }

  const conn = await connectBotDb();
  const db = conn.db;
  if (!db) return new Response("Bot DB not ready", { status: 503 });

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let changeStream: any = null;

      const cleanup = () => {
        void changeStream?.close().catch(() => null);
      };

      const enqueue = (data: string) => {
        try { controller.enqueue(enc.encode(data)); } catch { /* closed */ }
      };

      try {
        changeStream = db.watch([], { fullDocument: "updateLookup" });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeStream.on("change", (change: any) => {
          const collection = String((change?.ns?.coll) ?? "");
          if (!WATCHED_COLLECTIONS.has(collection)) return;
          enqueue(`data: ${JSON.stringify({ collection, op: change.operationType })}\n\n`);
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

      req.signal.addEventListener("abort", () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
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
