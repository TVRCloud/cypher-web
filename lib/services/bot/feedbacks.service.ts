import { fetchBotModule } from "@/lib/services/bot/base";
import type { PaginatedParams } from "@/lib/services/bot/types";

export function getBotFeedbacks(params: PaginatedParams) {
  return fetchBotModule("/api/bot/feedbacks", params);
}
