import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotFileModel } from "@/lib/bot/models/file";
import { getBotUserModel } from "@/lib/bot/models/user";
import { getBotGroupModel } from "@/lib/bot/models/group";
import { getBotFeedbackModel } from "@/lib/bot/models/feedback";
import { getBotLogModel } from "@/lib/bot/models/log";
import { getBotConfigModel } from "@/lib/bot/models/config";

const COUNTS_TTL_MS = 30_000;

type Counts = {
  totalFiles: number;
  totalUsers: number;
  totalGroups: number;
  approvedGroups: number;
  pausedGroups: number;
  pendingFeedbacks: number;
  totalLogs: number;
  botActionLogs: number;
};

// Per-instance cache for counts only. Heartbeat is always read fresh.
let countsCache: { at: number; value: Counts } | null = null;
let countsInflight: Promise<Counts> | null = null;

async function loadCounts(): Promise<Counts> {
  if (countsCache && Date.now() - countsCache.at < COUNTS_TTL_MS) return countsCache.value;
  if (countsInflight) return countsInflight;

  countsInflight = (async () => {
    const [FileModel, UserModel, GroupModel, FeedbackModel, LogModel] = await Promise.all([
      getBotFileModel(),
      getBotUserModel(),
      getBotGroupModel(),
      getBotFeedbackModel(),
      getBotLogModel(),
    ]);

    const [totalFiles, totalUsers, totalGroups, approvedGroups, pausedGroups, pendingFeedbacks, totalLogs, botActionLogs] =
      await Promise.all([
        FileModel.estimatedDocumentCount(),
        UserModel.estimatedDocumentCount(),
        GroupModel.countDocuments({}),
        GroupModel.countDocuments({ status: "approved" }),
        GroupModel.countDocuments({ status: "paused" }),
        FeedbackModel.countDocuments({ status: "Pending" }),
        LogModel.estimatedDocumentCount(),
        LogModel.countDocuments({ type: "BOT_ACTION" }),
      ]);

    const value = { totalFiles, totalUsers, totalGroups, approvedGroups, pausedGroups, pendingFeedbacks, totalLogs, botActionLogs };
    countsCache = { at: Date.now(), value };
    return value;
  })().finally(() => {
    countsInflight = null;
  });

  return countsInflight;
}

export async function GET() {
  try {
    await requirePermission("analytics.read");

    const ConfigModel = await getBotConfigModel();
    const [counts, heartbeatDoc] = await Promise.all([
      loadCounts(),
      ConfigModel.findOne({ _id: "bot_heartbeat" }).lean(),
    ]);

    const hb = heartbeatDoc?.value as { last_seen?: string; uptime_seconds?: number; version?: string } | null;
    const lastSeen = hb?.last_seen ?? null;

    return ok({
      ...counts,
      botHeartbeat: {
        lastSeen,
        uptimeSeconds: hb?.uptime_seconds ?? null,
        version: hb?.version ?? null,
        online: lastSeen ? Date.now() - new Date(lastSeen).getTime() < 90_000 : false,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch bot stats", 400);
  }
}
