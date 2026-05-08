"use client";

import { usePaginatedFetch } from "@/lib/hooks/use-paginated-fetch";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/_ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/_ui/table";
import { AlertCircle } from "lucide-react";

type BotUser = {
  _id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  lang_code: string | null;
  is_premium: boolean;
  permission: boolean;
  date: string | null;
};

function fullName(u: BotUser) {
  return [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
}

export function BotUsersTable() {
  const permissions = useAuthStore((s) => s.permissions);
  const canRead = permissions.includes("analytics.read");

  const { data, total, totalPages, page, limit, loading, error, setPage, setLimit } =
    usePaginatedFetch<BotUser>("/api/bot/users");

  if (!canRead) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>You do not have permission to view bot users.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Users</CardTitle>
        <CardDescription>Telegram users who have interacted with the bot · {total.toLocaleString()} total</CardDescription>
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
              <TableHead className="w-[10%]">ID</TableHead>
              <TableHead className="w-[22%]">Name</TableHead>
              <TableHead className="w-[20%]">Username</TableHead>
              <TableHead className="w-[8%]">Lang</TableHead>
              <TableHead className="w-[10%]">Premium</TableHead>
              <TableHead className="w-[10%]">Access</TableHead>
              <TableHead className="w-[20%]">Joined</TableHead>
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
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found.</TableCell>
              </TableRow>
            ) : (
              data.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="tabular-nums text-muted-foreground text-xs">{u._id}</TableCell>
                  <TableCell className="max-w-0 overflow-hidden font-medium">
                    <TruncatedCell value={fullName(u)} />
                  </TableCell>
                  <TableCell className="max-w-0 overflow-hidden">
                    <TruncatedCell value={u.username ? `@${u.username}` : "—"} />
                  </TableCell>
                  <TableCell className="uppercase text-xs">{u.lang_code ?? "—"}</TableCell>
                  <TableCell>
                    {u.is_premium ? <Badge variant="default">Premium</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.permission ? "secondary" : "destructive"}>
                      {u.permission ? "Allowed" : "Banned"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.date ?? "—"}</TableCell>
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
