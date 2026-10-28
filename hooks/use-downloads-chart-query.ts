"use client";

import { useQuery } from "@tanstack/react-query";
import { botKeys } from "@/lib/query-keys";
import { getDownloadsChart } from "@/lib/services/bot/downloads.service";

export function useDownloadsChartQuery(days: number) {
  return useQuery({
    queryKey: botKeys.downloadsChart(days),
    queryFn: () => getDownloadsChart(days),
    placeholderData: (prev) => prev,
  });
}
