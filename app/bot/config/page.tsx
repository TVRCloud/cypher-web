import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotConfigPage() {
  return (
    <BotModuleTable
      title="Bot Config"
      description="Collection: config"
      module="config"
      navigatable={false}
      columns={[
        { key: "_id", label: "Key" },
        { key: "value", label: "Value" },
      ]}
    />
  );
}
