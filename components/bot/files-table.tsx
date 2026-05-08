"use client";

import { usePaginatedFetch } from "@/lib/hooks/use-paginated-fetch";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/_ui/table";
import { AlertCircle } from "lucide-react";

type BotFile = {
  _id: string;
  file_name: string;
  file_size: number;
  file_type: string | null;
  language: string | null;
  quality: string | null;
  year: string | null;
  created_at: string | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BotFilesTable() {
  const permissions = useAuthStore((s) => s.permissions);
  const canRead = permissions.includes("analytics.read");

  const { data, total, totalPages, page, limit, loading, error, setPage, setLimit } =
    usePaginatedFetch<BotFile>("/api/bot/files");

  if (!canRead) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>You do not have permission to view files.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Files</CardTitle>
        <CardDescription>{total.toLocaleString()} files indexed</CardDescription>
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
              <TableHead className="w-[35%]">File Name</TableHead>
              <TableHead className="w-[10%]">Size</TableHead>
              <TableHead className="w-[10%]">Type</TableHead>
              <TableHead className="w-[10%]">Lang</TableHead>
              <TableHead className="w-[10%]">Quality</TableHead>
              <TableHead className="w-[8%]">Year</TableHead>
              <TableHead className="w-[17%]">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No files found.</TableCell>
              </TableRow>
            ) : (
              data.map((f) => (
                <TableRow key={f._id}>
                  <TableCell className="max-w-0 overflow-hidden font-medium">
                    <TruncatedCell value={f.file_name} />
                  </TableCell>
                  <TableCell className="tabular-nums text-xs text-muted-foreground">{formatBytes(f.file_size)}</TableCell>
                  <TableCell>
                    {f.file_type ? <Badge variant="outline" className="text-[10px]">{f.file_type}</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-xs uppercase">{f.language ?? "—"}</TableCell>
                  <TableCell className="text-xs">{f.quality ?? "—"}</TableCell>
                  <TableCell className="text-xs tabular-nums">{f.year ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}
                  </TableCell>
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
