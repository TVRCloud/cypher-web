"use client";

import { BotModuleTable } from "@/components/bot/bot-module-table";
import { Badge } from "@/components/ui/badge";

const TYPE_STYLES: Record<string, string> = {
  ADMIN_ACTION: "bg-red-400/10 text-red-400 border-red-400/20",
  GROUP_ACTION: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  BOT_ACTION:   "bg-blue-400/10 text-blue-400 border-blue-400/20",
  USER_ACTION:  "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

const TYPE_LABELS: Record<string, string> = {
  ADMIN_ACTION: "Admin",
  GROUP_ACTION: "Group",
  BOT_ACTION:   "Bot",
  USER_ACTION:  "User",
};

function LogTypeBadge(value: unknown) {
  const raw = String(value ?? "").toUpperCase();
  const cls = TYPE_STYLES[raw] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${cls}`}>
      {(TYPE_LABELS[raw] ?? raw) || "—"}
    </Badge>
  );
}

export default function DashboardLogsPage() {
  return (
    <BotModuleTable
      title="Bot Logs"
      description="Collection: logs"
      module="logs"
      navigatable={true}
      detailBase="/dashboard/logs"
      columns={[
        { key: "type",    label: "Type",    sortable: true, render: LogTypeBadge },
        { key: "user_id", label: "User ID", sortable: true },
        { key: "date",    label: "Date",    sortable: true },
        { key: "time",    label: "Time" },
        { key: "meta",    label: "Meta" },
      ]}
      filters={[
        {
          type: "multiselect",
          param: "type",
          label: "Action Type",
          options: [
            { value: "ADMIN_ACTION", label: "Admin Action" },
            { value: "GROUP_ACTION", label: "Group Action" },
            { value: "BOT_ACTION",   label: "Bot Action" },
            { value: "USER_ACTION",  label: "User Action" },
          ],
        },
      ]}
    />
  );
}
