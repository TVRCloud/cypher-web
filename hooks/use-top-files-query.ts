"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopFiles } from "@/lib/services/bot/downloads.service";

export function useTopFilesQuery() {
  return useQuery({
    queryKey: ["top-files"],
    queryFn: getTopFiles,
    placeholderData: (prev) => prev,
  });
}
