import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotFeedbacksPage() {
  return (
    <BotModuleTable
      title="Feedbacks"
      description="Collection: feedbacks"
      module="feedbacks"
      searchable
      searchPlaceholder="Search by username or message…"
      columns={[
        { key: "ticket_id", label: "Ticket",   sortable: true },
        { key: "user_id",   label: "User ID",  sortable: true },
        { key: "status",    label: "Status",   sortable: true },
        { key: "type",      label: "Type",     sortable: true },
        { key: "feedback",  label: "Message" },
      ]}
      filters={[
        {
          param: "status",
          label: "Status",
          options: [
            { value: "Pending",  label: "Pending" },
            { value: "Resolved", label: "Resolved" },
            { value: "Closed",   label: "Closed" },
          ],
        },
        {
          param: "type",
          label: "Type",
          options: [
            { value: "bug",         label: "Bug" },
            { value: "suggestion",  label: "Suggestion" },
            { value: "complaint",   label: "Complaint" },
            { value: "other",       label: "Other" },
          ],
        },
      ]}
    />
  );
}
