export type BotHeartbeat = {
  lastSeen: string | null;
  uptimeSeconds: number | null;
  version: string | null;
  online: boolean;
};

export type BotStatsResponse = {
  totalFiles: number;
  totalUsers: number;
  totalGroups: number;
  approvedGroups: number;
  pausedGroups: number;
  pendingFeedbacks: number;
  totalLogs: number;
  botActionLogs: number;
  botHeartbeat: BotHeartbeat | null;
};

export async function getBotStats(): Promise<BotStatsResponse> {
  const res = await fetch("/api/bot/stats", { method: "GET" });
  const payload = (await res.json()) as BotStatsResponse | { message?: string };

  if (!res.ok) {
    throw new Error((payload as { message?: string }).message ?? "Failed to fetch bot stats");
  }

  return payload as BotStatsResponse;
}
