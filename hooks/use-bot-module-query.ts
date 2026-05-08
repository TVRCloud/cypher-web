"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedParams, PaginatedResponse } from "@/lib/services/bot/types";
import { getBotFiles } from "@/lib/services/bot/files.service";
import { getBotUsers } from "@/lib/services/bot/users.service";
import { getBotGroups } from "@/lib/services/bot/groups.service";
import { getBotFeedbacks } from "@/lib/services/bot/feedbacks.service";
import { getBotLogs } from "@/lib/services/bot/logs.service";
import { getBotConfig } from "@/lib/services/bot/config.service";
import { getBotSettings } from "@/lib/services/bot/settings.service";

export type BotModuleKey =
  | "files"
  | "users"
  | "groups"
  | "feedbacks"
  | "logs"
  | "config"
  | "settings";

const serviceByModule: Record<BotModuleKey, (params: PaginatedParams) => Promise<PaginatedResponse>> = {
  files: getBotFiles,
  users: getBotUsers,
  groups: getBotGroups,
  feedbacks: getBotFeedbacks,
  logs: getBotLogs,
  config: getBotConfig,
  settings: getBotSettings,
};

export function useBotModuleQuery(module: BotModuleKey, params: PaginatedParams) {
  const queryKey = useMemo(() => ["bot-module", module, params], [module, params]);

  return useQuery({
    queryKey,
    queryFn: () => serviceByModule[module](params),
    placeholderData: (prev) => prev,
  });
}
