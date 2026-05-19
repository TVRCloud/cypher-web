"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentDownloads } from "@/lib/services/bot/downloads.service";

export function useRecentDownloadsQuery() {
  return useQuery({
    queryKey: ["recent-downloads"],
    queryFn: getRecentDownloads,
    placeholderData: (prev) => prev,
  });
}
