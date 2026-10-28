"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AuditRow = {
  _id: string;
  actorEmail: string | null;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  commandId: string | null;
  createdAt: string;
};

type AuditResponse = { data: AuditRow[]; total: number; totalPages: number; page: number; limit: number };

const LIMIT = 20;

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useQuery<AuditResponse>({
    queryKey: ["audit-log", page],
    queryFn: async () => {
      const res = await fetch(`/api/audit?page=${page}&limit=${LIMIT}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load audit log");
      return json as AuditResponse;
    },
    placeholderData: (prev) => prev,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <CardDescription>Admin actions issued from this panel (read-only). Total: {data?.total ?? 0}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
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
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Command</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.actorEmail ?? r.actorId}</TableCell>
                  <TableCell className="font-mono text-xs">{r.action}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">
                    {r.targetType}:{r.targetId}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate font-mono text-xs">{r.commandId ?? "—"}</TableCell>
                </TableRow>
              ))}
              {!data?.data.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No entries</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page + 1} / {Math.max(data?.totalPages ?? 1, 1)}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page + 1 >= (data?.totalPages ?? 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
