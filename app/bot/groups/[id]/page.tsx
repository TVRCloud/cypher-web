"use client";

import { useParams } from "next/navigation";
import { BotItemDetail } from "@/components/bot/bot-item-detail";
import { GroupAdminActions } from "@/components/bot/admin-command-actions";

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="space-y-4">
      <GroupAdminActions id={String(id)} />
      <BotItemDetail module="groups" />
    </div>
  );
}
