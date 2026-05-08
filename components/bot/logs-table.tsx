"use client";

import { useState } from "react";
import { usePaginatedFetch } from "@/lib/hooks/use-paginated-fetch";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/_ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

type BotLog = {
  _id: string;
  type: string;
  user_id: number | null;
  meta: Record<string, unknown>;
  timestamp: string | null;
  date: string | null;
  time: string | null;
};

const LOG_TYPE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  error: "destructive",
  warn: "outline",
  info: "secondary",
  command: "default",
};

export function BotLogsTable() {
  const permissions = useAuthStore((s) => s.permissions);
  const canRead = permissions.includes("analytics.read");
  const [typeFilter, setTypeFilter] = useState("all");

  const apiUrl = typeFilter === "all" ? "/api/bot/logs" : `/api/bot/logs?type=${typeFilter}`;
  const { data, total, totalPages, page, limit, loading, error, setPage, setLimit } =
    usePaginatedFetch<BotLog>(apiUrl);

  if (!canRead) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>You do not have permission to view logs.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Bot Logs</CardTitle>
          <CardDescription>{total.toLocaleString()} entries</CardDescription>
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="h-7 w-[130px] text-xs">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="command">Command</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12%]">Type</TableHead>
              <TableHead className="w-[12%]">User ID</TableHead>
              <TableHead className="w-[36%]">Meta</TableHead>
              <TableHead className="w-[20%]">Date</TableHead>
              <TableHead className="w-[20%]">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No logs found.</TableCell>
              </TableRow>
            ) : (
              data.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <Badge variant={LOG_TYPE_COLORS[log.type] ?? "outline"} className="text-[10px]">
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-xs text-muted-foreground">{log.user_id ?? "—"}</TableCell>
                  <TableCell className="max-w-0 overflow-hidden">
                    <TruncatedCell value={log.meta ? JSON.stringify(log.meta) : "—"} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.date ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.time ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="px-6">
          <DataPagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} onLimitChange={setLimit} />
        </div>
      </CardContent>
    </Card>
  );
}
