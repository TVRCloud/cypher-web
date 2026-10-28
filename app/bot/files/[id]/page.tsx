"use client";

import { useParams } from "next/navigation";
import { BotItemDetail } from "@/components/bot/bot-item-detail";
import { FileAdminActions } from "@/components/bot/admin-command-actions";

export default function FileDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="space-y-4">
      <FileAdminActions id={String(id)} />
      <BotItemDetail module="files" />
    </div>
  );
}
