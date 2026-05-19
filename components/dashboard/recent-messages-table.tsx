"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/_ui/card";
import { Download } from "lucide-react";
import { useRecentDownloadsQuery } from "@/hooks/use-recent-downloads-query";

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function RecentMessagesTable() {
  const { data: downloads = [] } = useRecentDownloadsQuery();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Downloads</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">File</TableHead>
              <TableHead className="hidden sm:table-cell">User ID</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {downloads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="pl-6 text-xs text-muted-foreground py-6 text-center">
                  No downloads recorded
                </TableCell>
              </TableRow>
            ) : (
              downloads.map((dl) => (
                <TableRow key={String(dl._id)}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <p className="text-xs font-medium truncate max-w-45">{dl.file_name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {dl.user_id}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatBytes(dl.file_size)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {dl.timestamp ? relativeTime(dl.timestamp) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
