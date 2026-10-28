"use client";

import { useState } from "react";
import { useAdminCommands } from "@/hooks/use-admin-commands";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CommandStatusBadge } from "@/components/bot/command-status-badge";

const FILTERS = [
  { label: "All", value: undefined },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" },
] as const;

function target(payload: Record<string, unknown>) {
  return String(payload.chat_id ?? payload.file_id ?? "—");
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString() : "—";
}

export default function CommandQueuePage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useAdminCommands({ status, limit: 50, summary: true });
  const counts = data?.summary?.counts ?? {};
  const lastSeen = data?.summary?.botLastSeen;
  const stale = data?.summary?.botStale ?? false;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Queue health</CardTitle>
          <CardDescription>
            Bot heartbeat: {lastSeen ? new Date(lastSeen).toLocaleString() : "never seen"}
            {stale ? " (stale: pending commands will not run until the bot is back)" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
          {["pending", "processing", "done", "failed"].map((s) => (
            <div key={s} className="rounded-lg border p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s}</div>
              <div className="text-2xl font-semibold">{counts[s] ?? 0}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin commands</CardTitle>
          <CardDescription>Collection: admin_commands (auto-refreshing)</CardDescription>
          <div className="flex gap-2 pt-2">
            {FILTERS.map((f) => (
              <Button
                key={f.label}
                size="sm"
                variant={status === f.value ? "default" : "outline"}
                onClick={() => setStatus(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Failed to load</AlertTitle>
              <AlertDescription>{error instanceof Error ? error.message : String(error)}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Finished</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data ?? []).map((c) => (
                  <TableRow key={c._id}>
                    <TableCell><CommandStatusBadge status={c.status} /></TableCell>
                    <TableCell className="font-mono text-xs">{c.type}</TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs">{target(c.payload)}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{c.requested_by}</TableCell>
                    <TableCell>{fmt(c.created_at)}</TableCell>
                    <TableCell>{fmt(c.finished_at)}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-destructive">{c.error ?? ""}</TableCell>
                  </TableRow>
                ))}
                {!data?.data.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No commands</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
