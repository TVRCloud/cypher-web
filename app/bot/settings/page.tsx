import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotSettingsPage() {
  return (
    <BotModuleTable
      title="Bot Settings"
      description="Collection: settings"
      module="settings"
      navigatable={false}
      columns={[
        { key: "_id", label: "Key" },
        { key: "value", label: "Value" },
      ]}
    />
  );
}
