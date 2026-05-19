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

export async function getDownloadsChart(days: number): Promise<DownloadChartPoint[]> {
  const res = await fetch(`/api/bot/downloads/chart?days=${days}`);
  const payload = await res.json();
  if (!res.ok) throw new Error((payload as { message?: string })?.message ?? "Failed to fetch download chart");
  return payload as DownloadChartPoint[];
}

export async function getRecentDownloads(): Promise<RecentDownload[]> {
  const res = await fetch("/api/bot/downloads/recent");
  const payload = await res.json();
  if (!res.ok) throw new Error((payload as { message?: string })?.message ?? "Failed to fetch recent downloads");
  return payload as RecentDownload[];
}

export async function getTopFiles(): Promise<TopFile[]> {
  const res = await fetch("/api/bot/downloads/top-files");
  const payload = await res.json();
  if (!res.ok) throw new Error((payload as { message?: string })?.message ?? "Failed to fetch top files");
  return payload as TopFile[];
}
