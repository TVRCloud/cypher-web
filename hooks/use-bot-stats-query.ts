"use client";

import { useQuery } from "@tanstack/react-query";
import { botKeys } from "@/lib/query-keys";
import { getBotStats } from "@/lib/services/bot/stats.service";

export function useBotStatsQuery() {
  return useQuery({
    queryKey: botKeys.stats,
    queryFn: getBotStats,
    placeholderData: (prev) => prev,
  });
}
