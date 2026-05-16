import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotGroupsPage() {
  return (
    <BotModuleTable
      title="Bot Groups"
      description="Collection: groups"
      module="groups"
      searchable
      searchPlaceholder="Search by group title…"
      columns={[
        { key: "chat_id",         label: "Chat ID",  sortable: true },
        { key: "title",           label: "Title",    sortable: true },
        { key: "status",          label: "Status" },
        { key: "member_count",    label: "Members",  sortable: true },
        { key: "last_stats_check",label: "Last Check" },
      ]}
    />
  );
}
