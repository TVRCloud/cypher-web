import { BotModuleTable } from "@/components/bot/bot-module-table";

export default function BotFeedbacksPage() {
  return (
    <BotModuleTable
      title="Bot Feedbacks"
      description="Collection: feedbacks"
      module="feedbacks"
      columns={[
        { key: "ticket_id", label: "Ticket" },
        { key: "user_id", label: "User ID" },
        { key: "status", label: "Status" },
        { key: "type", label: "Type" },
        { key: "feedback", label: "Feedback" },
      ]}
    />
  );
}
