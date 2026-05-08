import { fetchBotModule } from "@/lib/services/bot/base";
import type { PaginatedParams } from "@/lib/services/bot/types";

export function getBotUsers(params: PaginatedParams) {
  return fetchBotModule("/api/bot/users", params);
}
