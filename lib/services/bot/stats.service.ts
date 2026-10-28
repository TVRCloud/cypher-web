import { apiFetch } from "@/lib/services/bot/base";

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

export function getBotStats(): Promise<BotStatsResponse> {
  return apiFetch<BotStatsResponse>("/api/bot/stats", { method: "GET" }, "Failed to fetch bot stats");
}
