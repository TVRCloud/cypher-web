import { apiFetch } from "@/lib/services/bot/base";

export type DownloadChartPoint = { date: string; count: number };

export type RecentDownload = {
  _id: string;
  uniq_id: string;
  file_name: string;
  user_id: number;
  file_size: number;
  timestamp: string;
};

export type TopFile = { file_name: string; count: number };

export function getDownloadsChart(days: number): Promise<DownloadChartPoint[]> {
  return apiFetch<DownloadChartPoint[]>(`/api/bot/downloads/chart?days=${days}`, undefined, "Failed to fetch download chart");
}

export function getRecentDownloads(): Promise<RecentDownload[]> {
  return apiFetch<RecentDownload[]>("/api/bot/downloads/recent", undefined, "Failed to fetch recent downloads");
}

export function getTopFiles(): Promise<TopFile[]> {
  return apiFetch<TopFile[]>("/api/bot/downloads/top-files", undefined, "Failed to fetch top files");
}
