import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotUsersPage() {
  return (
    <BotModuleTable
      title="Bot Users"
      description="Collection: users"
      module="users"
      searchable
      searchPlaceholder="Search by name or username…"
      columns={[
        { key: "_id",        label: "User ID",    sortable: true },
        { key: "first_name", label: "First Name", sortable: true },
        { key: "username",   label: "Username",   sortable: true },
        { key: "lang_code",  label: "Language" },
        { key: "permission", label: "Access" },
      ]}
      filters={[
        {
          param: "permission",
          label: "Access",
          options: [
            { value: "true",  label: "Allowed" },
            { value: "false", label: "Banned" },
          ],
        },
      ]}
    />
  );
}
