"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/_ui/table";

type ApiRole = { _id: string; key?: string; name?: string };
type ApiUser = {
  _id: string;
  email: string;
  tokenVersion: number;
  isActive: boolean;
  createdAt: string;
  roleId: string | ApiRole;
};

function roleLabel(role: ApiUser["roleId"]) {
  if (!role || typeof role === "string") return "unknown";
  return role.name ?? role.key ?? "unknown";
}

export function UsersAdminTable() {
  const permissions = useAuthStore((state) => state.permissions);
  const canRead = permissions.includes("users.read");

  const [rows, setRows] = useState<ApiUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canRead) return;
    let cancelled = false;
    void (async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/users");
        const data = (await res.json()) as ApiUser[] | { message?: string };
        if (!res.ok) throw new Error(("message" in data ? data.message : undefined) ?? "Failed to load users");
        if (!cancelled) setRows(data as ApiUser[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load users");
      }
    })();
    return () => { cancelled = true; };
  }, [canRead]);

  const activeCount = useMemo(() => (rows ?? []).filter((u) => u.isActive).length, [rows]);

  if (!canRead) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>You do not have permission to view users.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Users</CardTitle>
        <CardDescription>Active: {activeCount} / {(rows ?? []).length}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to load users</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Email</TableHead>
              <TableHead className="w-[20%]">Role</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[10%]">Token V</TableHead>
              <TableHead className="w-[15%]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows === null ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading users…</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found.</TableCell>
              </TableRow>
            ) : (
              rows.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="max-w-0 overflow-hidden font-medium">
                    <TruncatedCell value={user.email} />
                  </TableCell>
                  <TableCell className="max-w-0 overflow-hidden">
                    <TruncatedCell value={roleLabel(user.roleId)} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "secondary" : "outline"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{user.tokenVersion}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
