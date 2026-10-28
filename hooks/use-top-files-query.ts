"use client";

import { useQuery } from "@tanstack/react-query";
import { botKeys } from "@/lib/query-keys";
import { getTopFiles } from "@/lib/services/bot/downloads.service";

export function useTopFilesQuery() {
  return useQuery({
    queryKey: botKeys.topFiles,
    queryFn: getTopFiles,
    placeholderData: (prev) => prev,
  });
}
