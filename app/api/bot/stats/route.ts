import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotFileModel } from "@/lib/bot/models/file";
import { getBotUserModel } from "@/lib/bot/models/user";
import { getBotGroupModel } from "@/lib/bot/models/group";
import { getBotFeedbackModel } from "@/lib/bot/models/feedback";
import { getBotLogModel } from "@/lib/bot/models/log";
import { getBotConfigModel } from "@/lib/bot/models/config";

export async function GET() {
  try {
    await requirePermission("analytics.read");

    const [FileModel, UserModel, GroupModel, FeedbackModel, LogModel, ConfigModel] = await Promise.all([
      getBotFileModel(),
      getBotUserModel(),
      getBotGroupModel(),
      getBotFeedbackModel(),
      getBotLogModel(),
      getBotConfigModel(),
    ]);

    const [
      totalFiles,
      totalUsers,
      totalGroups,
      approvedGroups,
      pausedGroups,
      pendingFeedbacks,
      totalLogs,
      botActionLogs,
      heartbeatDoc,
    ] = await Promise.all([
      FileModel.countDocuments({}),
      UserModel.countDocuments({}),
      GroupModel.countDocuments({}),
      GroupModel.countDocuments({ status: "approved" }),
      GroupModel.countDocuments({ status: "paused" }),
      FeedbackModel.countDocuments({ status: "Pending" }),
      LogModel.countDocuments({}),
      LogModel.countDocuments({ type: "BOT_ACTION" }),
      ConfigModel.findOne({ _id: "bot_heartbeat" }).lean(),
    ]);

    const hb = heartbeatDoc?.value as { last_seen?: string; uptime_seconds?: number; version?: string } | null;
    const lastSeen = hb?.last_seen ?? null;

    return ok({
      totalFiles,
      totalUsers,
      totalGroups,
      approvedGroups,
      pausedGroups,
      pendingFeedbacks,
      totalLogs,
      botActionLogs,
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
