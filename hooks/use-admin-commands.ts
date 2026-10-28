"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type AdminCommandType =
  | "group.approve"
  | "group.disapprove"
  | "group.pause"
  | "group.resume"
  | "file.delete";

export type AdminCommand = {
  _id: string;
  type: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "done" | "failed";
  requested_by: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  result: Record<string, unknown> | null;
  error: string | null;
};

export type CommandSummary = {
  counts: Record<string, number>;
  botLastSeen: string | null;
  botStale: boolean;
};

type ListResponse = { data: AdminCommand[]; summary?: CommandSummary };

const isActive = (c: AdminCommand) => c.status === "pending" || c.status === "processing";

export function useAdminCommands(opts: { status?: string; target?: string; limit?: number; summary?: boolean } = {}) {
  const { status, target, limit = 20, summary } = opts;
  return useQuery<ListResponse>({
    queryKey: ["admin-commands", { status, target, limit, summary }],
    queryFn: async () => {
      const qs = new URLSearchParams({ limit: String(limit) });
      if (status) qs.set("status", status);
      if (target) qs.set("target", target);
      if (summary) qs.set("summary", "1");
      const res = await fetch(`/api/bot/commands?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load commands");
      return json as ListResponse;
    },
    // Poll fast while something is in flight, slowly otherwise.
    refetchInterval: (q) => (q.state.data?.data.some(isActive) ? 2000 : 15000),
  });
}

export function useCreateAdminCommand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { type: AdminCommandType; payload: Record<string, unknown> }) => {
      const res = await fetch("/api/bot/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to queue command");
      return json as { command: AdminCommand };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-commands"] }),
  });
}
