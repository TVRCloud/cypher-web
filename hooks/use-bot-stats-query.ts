"use client";

import { useQuery } from "@tanstack/react-query";
import { getBotStats } from "@/lib/services/bot/stats.service";

export function useBotStatsQuery() {
  return useQuery({
    queryKey: ["bot-stats"],
    queryFn: getBotStats,
    placeholderData: (prev) => prev,
  });
}
