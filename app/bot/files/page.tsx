import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotFilesPage() {
  return (
    <BotModuleTable
      title="Bot Files"
      description="Collection: files"
      module="files"
      columns={[
        { key: "_id", label: "ID" },
        { key: "file_name", label: "Name" },
        { key: "quality", label: "Quality" },
        { key: "language", label: "Language" },
        { key: "year", label: "Year" },
      ]}
    />
  );
}
