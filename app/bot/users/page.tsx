import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotUsersPage() {
  return (
    <BotModuleTable
      title="Bot Users"
      description="Collection: users"
      module="users"
      columns={[
        { key: "_id", label: "User ID" },
        { key: "first_name", label: "First Name" },
        { key: "username", label: "Username" },
        { key: "lang_code", label: "Language" },
        { key: "permission", label: "Permission" },
      ]}
    />
  );
}
