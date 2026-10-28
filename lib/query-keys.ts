import type { PaginatedParams } from "@/lib/services/bot/types";

/** Central react-query keys for bot data. Default staleTime lives in providers/query-provider.tsx. */
export const botKeys = {
  stats: ["bot-stats"] as const,
  modules: (module: string) => ["bot-module", module] as const,
  module: (module: string, params: PaginatedParams) => ["bot-module", module, params] as const,
  downloadsChart: (days: number) => ["downloads-chart", days] as const,
  recentDownloads: ["recent-downloads"] as const,
  topFiles: ["top-files"] as const,
};
