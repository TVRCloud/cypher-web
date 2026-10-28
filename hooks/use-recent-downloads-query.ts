"use client";

import { useQuery } from "@tanstack/react-query";
import { botKeys } from "@/lib/query-keys";
import { getRecentDownloads } from "@/lib/services/bot/downloads.service";

export function useRecentDownloadsQuery() {
  return useQuery({
    queryKey: botKeys.recentDownloads,
    queryFn: getRecentDownloads,
    placeholderData: (prev) => prev,
  });
}
