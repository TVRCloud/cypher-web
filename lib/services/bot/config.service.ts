import { fetchBotModule } from "@/lib/services/bot/base";
import type { PaginatedParams } from "@/lib/services/bot/types";

export function getBotConfig(params: PaginatedParams) {
  return fetchBotModule("/api/bot/config", params);
}
