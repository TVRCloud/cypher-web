"use client";

import { useState } from "react";
import { usePaginatedFetch } from "@/lib/hooks/use-paginated-fetch";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/_ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/_ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

type BotFeedback = {
  _id: string;
  user_id: number;
  username: string;
  feedback: string;
  ticket_id: string;
  status: string;
  type: string;
  date: string | null;
  time: string | null;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Resolved: "default",
  Closed: "secondary",
};

export function BotFeedbacksTable() {
  const permissions = useAuthStore((s) => s.permissions);
  const canRead = permissions.includes("analytics.read");
  const [statusFilter, setStatusFilter] = useState("all");

  const apiUrl = statusFilter === "all" ? "/api/bot/feedbacks" : `/api/bot/feedbacks?status=${statusFilter}`;
  const { data, total, totalPages, page, limit, loading, error, setPage, setLimit } =
    usePaginatedFetch<BotFeedback>(apiUrl);

  if (!canRead) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>You do not have permission to view messages.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Messages & Feedback</CardTitle>
          <CardDescription>{total.toLocaleString()} entries</CardDescription>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
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
              <TableHead className="w-[14%]">Ticket</TableHead>
              <TableHead className="w-[14%]">User</TableHead>
              <TableHead className="w-[32%]">Message</TableHead>
              <TableHead className="w-[10%]">Type</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[20%]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No messages found.</TableCell>
              </TableRow>
            ) : (
              data.map((fb) => (
                <TableRow key={fb._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground overflow-hidden">
                    <TruncatedCell value={fb.ticket_id} />
                  </TableCell>
                  <TableCell className="max-w-0 overflow-hidden">
                    <TruncatedCell value={fb.username !== "N/A" ? `@${fb.username}` : String(fb.user_id)} />
                  </TableCell>
                  <TableCell className="max-w-0 overflow-hidden">
                    <TruncatedCell value={fb.feedback} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] capitalize">{fb.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[fb.status] ?? "outline"} className="text-[10px]">
                      {fb.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fb.date ?? "—"} {fb.time ?? ""}</TableCell>
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
