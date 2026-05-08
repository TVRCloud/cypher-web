import { fetchBotModule } from "@/lib/services/bot/base";
import type { PaginatedParams } from "@/lib/services/bot/types";

export function getBotSettings(params: PaginatedParams) {
  return fetchBotModule("/api/bot/settings", params);
}
