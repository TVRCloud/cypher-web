import { requirePermission } from "@/lib/auth/guards";
import { connectBotDb } from "@/lib/db/bot-mongoose";
import { HttpError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

const WATCHED = ["logs", "files", "users", "groups", "feedbacks"];
const KEEPALIVE_MS = 25_000;
const COALESCE_MS = 1_000;
const REOPEN_MS = 5_000;

type Subscriber = (frame: string) => void;

// One change stream per server instance, shared by all SSE clients.
const subscribers = new Set<Subscriber>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let changeStream: any = null;
let reopenTimer: ReturnType<typeof setTimeout> | null = null;
// Per-collection coalescing: at most one event per collection per COALESCE_MS.
const pending = new Map<string, { op: string; timer: ReturnType<typeof setTimeout> }>();

function broadcast(frame: string) {
  for (const sub of subscribers) sub(frame);
}

function emit(collection: string, op: string) {
  if (pending.has(collection)) {
    pending.get(collection)!.op = op;
    return;
  }
  // Leading edge fires immediately; trailing event flushes if more arrive in the window.
  broadcast(`data: ${JSON.stringify({ collection, op })}\n\n`);
  const entry = {
    op: "",
    timer: setTimeout(() => {
      pending.delete(collection);
      if (entry.op) broadcast(`data: ${JSON.stringify({ collection, op: entry.op })}\n\n`);
    }, COALESCE_MS),
  };
  pending.set(collection, entry);
}

function closeStream() {
  if (reopenTimer) clearTimeout(reopenTimer);
  reopenTimer = null;
  for (const { timer } of pending.values()) clearTimeout(timer);
  pending.clear();
  const cs = changeStream;
  changeStream = null;
  void cs?.close().catch(() => null);
}

function scheduleReopen() {
  if (reopenTimer || subscribers.size === 0) return;
  reopenTimer = setTimeout(() => {
    reopenTimer = null;
    void openStream();
  }, REOPEN_MS);
}

async function openStream() {
  if (changeStream || subscribers.size === 0) return;
  try {
    const conn = await connectBotDb();
    const db = conn.db;
    if (!db) throw new Error("Bot DB not ready");
    if (changeStream || subscribers.size === 0) return;

    const cs = db.watch([{ $match: { "ns.coll": { $in: WATCHED } } }]);
    changeStream = cs;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cs.on("change", (change: any) => {
      const collection = String(change?.ns?.coll ?? "");
      if (!WATCHED.includes(collection)) return;
      emit(collection, String(change.operationType));
    });
    cs.on("error", () => {
      if (changeStream === cs) {
        changeStream = null;
        void cs.close().catch(() => null);
      }
      scheduleReopen();
    });
  } catch {
    scheduleReopen();
  }
}

function subscribe(sub: Subscriber) {
  subscribers.add(sub);
  if (subscribers.size === 1) void openStream();
  return () => {
    subscribers.delete(sub);
    if (subscribers.size === 0) closeStream();
  };
}

export async function GET(req: Request) {
  try {
    await requirePermission("analytics.read");
  } catch (err) {
    if (err instanceof HttpError) return new Response(err.message, { status: err.statusCode });
    return new Response("Internal Server Error", { status: 500 });
  }

  const conn = await connectBotDb();
  if (!conn.db) return new Response("Bot DB not ready", { status: 503 });

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      let closed = false;
      let unsubscribe: (() => void) | null = null;
      let keepalive: ReturnType<typeof setInterval> | null = null;

      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (keepalive) clearInterval(keepalive);
        unsubscribe?.();
        try { controller.close(); } catch { /* already closed */ }
      };

      const write = (data: string) => {
        try { controller.enqueue(enc.encode(data)); } catch { cleanup(); }
      };

      unsubscribe = subscribe(write);
      keepalive = setInterval(() => write(": ping\n\n"), KEEPALIVE_MS);
      req.signal.addEventListener("abort", cleanup);
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
