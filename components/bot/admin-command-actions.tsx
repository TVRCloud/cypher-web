"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth-store";
import { fetchBotItem } from "@/lib/services/bot/base";
import {
  useAdminCommands,
  useCreateAdminCommand,
  type AdminCommandType,
} from "@/hooks/use-admin-commands";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommandStatusBadge } from "@/components/bot/command-status-badge";

type Action = { type: AdminCommandType; label: string; confirm?: string; destructive?: boolean };

const GROUP_ACTIONS: Action[] = [
  { type: "group.approve", label: "Approve" },
  { type: "group.resume", label: "Resume" },
  { type: "group.pause", label: "Pause", confirm: "Bot stops responding in this group until resumed." },
  {
    type: "group.disapprove",
    label: "Disapprove",
    confirm: "Group is marked disapproved and the bot leaves the chat.",
    destructive: true,
  },
];

function RecentCommands({ target }: { target: string }) {
  const { data } = useAdminCommands({ target, limit: 5 });
  const rows = data?.data ?? [];
  if (!rows.length) return null;
  return (
    <ul className="space-y-1 text-xs">
      {rows.map((c) => (
        <li key={c._id} className="flex items-center gap-2">
          <CommandStatusBadge status={c.status} />
          <span className="font-mono">{c.type}</span>
          <span className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
          {c.error ? <span className="text-destructive truncate">{c.error}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function useCanWrite() {
  return useAuthStore((state) => state.permissions.includes("bot.commands.write"));
}

function ActionPanel({
  title,
  description,
  actions,
  buildPayload,
  target,
  onDone,
}: {
  title: string;
  description: string;
  actions: Action[];
  buildPayload: () => Record<string, unknown> | null;
  target: string | null;
  onDone?: () => void;
}) {
  const create = useCreateAdminCommand();
  const [pending, setPending] = useState<Action | null>(null);

  const run = (action: Action) => {
    const payload = buildPayload();
    if (!payload) return;
    create.mutate(
      { type: action.type, payload },
      {
        onSuccess: (res) => {
          toast.success(`${action.label} queued`);
          onDone?.();
          return res;
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <Button
              key={a.type}
              size="sm"
              variant={a.destructive ? "destructive" : "outline"}
              disabled={create.isPending}
              onClick={() => (a.confirm ? setPending(a) : run(a))}
            >
              {a.label}
            </Button>
          ))}
        </div>
        {target ? <RecentCommands target={target} /> : null}
      </CardContent>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.label}?</AlertDialogTitle>
            <AlertDialogDescription>{pending?.confirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) run(pending);
                setPending(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function GroupAdminActions({ id }: { id: string }) {
  const canWrite = useCanWrite();
  const { data } = useQuery<Record<string, unknown>>({
    queryKey: ["bot-item", "groups", id],
    queryFn: () => fetchBotItem<Record<string, unknown>>("/api/bot/groups", id),
  });
  if (!canWrite || !data) return null;
  const chatId = typeof data.chat_id === "number" ? data.chat_id : null;
  if (chatId === null) return null;

  return (
    <ActionPanel
      title="Admin actions"
      description={`Queued for the bot to execute. Current status: ${String(data.status ?? "unknown")}`}
      actions={GROUP_ACTIONS}
      buildPayload={() => ({ chat_id: chatId })}
      target={String(chatId)}
    />
  );
}

export function FileAdminActions({ id }: { id: string }) {
  const canWrite = useCanWrite();
  if (!canWrite) return null;

  return (
    <ActionPanel
      title="Admin actions"
      description="Deletes the file record from the bot database. The Telegram channel message is not touched."
      actions={[
        {
          type: "file.delete",
          label: "Delete file record",
          confirm: "This removes the file from search results. It cannot be undone from the panel.",
          destructive: true,
        },
      ]}
      buildPayload={() => ({ file_id: id })}
      target={id}
    />
  );
}
