import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { COMMAND_STATUSES, getAdminCommandModel } from "@/lib/bot/models/admin-command";
import { commandTarget, createCommandSchema } from "@/lib/validation/bot-commands";
import { writeAuditLog } from "@/lib/services/audit-service";
import { getBotConfigModel } from "@/lib/bot/models/config";

export async function GET(req: Request) {
  try {
    await requirePermission("bot.commands.read");

    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "20") || 20, 1), 100);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const targetId = url.searchParams.get("target");
    const withSummary = url.searchParams.get("summary") === "1";

    const match: Record<string, unknown> = {};
    if (status && (COMMAND_STATUSES as readonly string[]).includes(status)) match.status = status;
    if (type) match.type = type;
    if (targetId) {
      const asNum = Number(targetId);
      match.$or = [{ "payload.file_id": targetId }, ...(Number.isFinite(asNum) ? [{ "payload.chat_id": asNum }] : [])];
    }

    const Command = await getAdminCommandModel();
    const data = await Command.find(match).sort({ created_at: -1 }).limit(limit).lean();

    let summary: Record<string, unknown> | undefined;
    if (withSummary) {
      const [grouped, Config] = await Promise.all([
        Command.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        getBotConfigModel(),
      ]);
      const hb = await Config.findOne({ _id: "bot_heartbeat" }).lean();
      const counts: Record<string, number> = { pending: 0, processing: 0, done: 0, failed: 0 };
      for (const g of grouped) counts[g._id as string] = g.count;
      const lastSeen = (hb?.value as { last_seen?: string } | null)?.last_seen ?? null;
      const botStale = !lastSeen || Date.now() - new Date(lastSeen).getTime() > 5 * 60 * 1000;
      summary = { counts, botLastSeen: lastSeen, botStale };
    }

    return ok({ data, summary });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch commands", 400);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requirePermission("bot.commands.write");

    const body = await req.json().catch(() => null);
    const parsed = createCommandSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid command", 400, parsed.error.flatten());

    const input = parsed.data;
    const Command = await getAdminCommandModel();

    // Collapse double-clicks: same actor, type and payload already queued.
    const dupe = await Command.findOne({
      type: input.type,
      payload: input.payload,
      requested_by: user.email ?? user.id,
      status: { $in: ["pending", "processing"] },
    }).lean();
    if (dupe) return ok({ command: dupe, duplicate: true });

    const created = await Command.create({
      type: input.type,
      payload: input.payload,
      status: "pending",
      requested_by: user.email ?? user.id,
      created_at: new Date(),
    });

    const { targetType, targetId } = commandTarget(input);
    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email ?? null,
      action: input.type,
      targetType,
      targetId,
      commandId: String(created._id),
      meta: { payload: input.payload },
    });

    return ok({ command: created.toObject() }, 201);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to create command", 400);
  }
}
