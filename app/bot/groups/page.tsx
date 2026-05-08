import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotGroupsPage() {
  return (
    <BotModuleTable
      title="Bot Groups"
      description="Collection: groups"
      module="groups"
      columns={[
        { key: "chat_id", label: "Chat ID" },
        { key: "title", label: "Title" },
        { key: "status", label: "Status" },
        { key: "member_count", label: "Members" },
        { key: "last_stats_check", label: "Last Check" },
      ]}
    />
  );
}
