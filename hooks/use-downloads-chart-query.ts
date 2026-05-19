"use client";

import { useQuery } from "@tanstack/react-query";
import { getDownloadsChart } from "@/lib/services/bot/downloads.service";

export function useDownloadsChartQuery(days: number) {
  return useQuery({
    queryKey: ["downloads-chart", days],
    queryFn: () => getDownloadsChart(days),
    placeholderData: (prev) => prev,
  });
}
