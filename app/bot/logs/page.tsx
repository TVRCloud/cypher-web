import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotLogsPage() {
  return (
    <BotModuleTable
      title="Bot Logs"
      description="Collection: logs"
      module="logs"
      columns={[
        { key: "type", label: "Type" },
        { key: "user_id", label: "User ID" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "meta", label: "Meta" },
      ]}
    />
  );
}
