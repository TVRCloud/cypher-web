"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/_ui/badge";
import { Button } from "@/components/_ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/_ui/card";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";

type SessionUser = { _id: string; email?: string };
type SessionRow = {
  _id: string;
  userId: string | SessionUser;
  device: string;
  ip: string;
  userAgent: string;
  lastUsedAt: string;
  expiresAt: string;
  revoked: boolean;
};

function resolveUserEmail(user: SessionRow["userId"]) {
  if (!user || typeof user === "string") return "Unknown user";
  return user.email ?? "Unknown user";
}

export function SessionsAdminTable() {
  const permissions = useAuthStore((state) => state.permissions);
  const canRead = permissions.includes("sessions.read");
  const canRevoke = permissions.includes("sessions.revoke");

  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadSessions = async () => {
    setError(null);
    const res = await fetch("/api/admin/sessions");
    const data = (await res.json()) as SessionRow[] | { message?: string };
    if (!res.ok)
      throw new Error(
        ("message" in data ? data.message : undefined) ??
          "Failed to load sessions",
      );
    setRows(data as SessionRow[]);
  };

  useEffect(() => {
    if (!canRead) return;
    let cancelled = false;
    void (async () => {
      try {
        await loadSessions();
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load sessions",
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canRead]);

  const onRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    setError(null);
    try {
      const res = await fetch("/api/admin/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok)
        throw new Error(payload.message ?? "Failed to revoke session");
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const activeCount = useMemo(
    () => (rows ?? []).filter((s) => !s.revoked).length,
    [rows],
  );

  if (!canRead) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view sessions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Active: {activeCount}</CardDescription>
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
        {/* table-fixed forces columns to honour their declared widths and truncate, no x-scroll */}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[22%]">User</TableHead>
              <TableHead className="w-[22%]">Device</TableHead>
              <TableHead className="w-[15%]">Last Used</TableHead>
              <TableHead className="w-[15%]">Expires</TableHead>
              <TableHead className="w-[8%]">Status</TableHead>
              <TableHead className="w-[6%] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows === null ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  Loading sessions…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((session) => (
                <TableRow key={session._id}>
                  <TableCell className="max-w-0 overflow-hidden">
                    <TruncatedCell value={resolveUserEmail(session.userId)} />
                  </TableCell>
                  <TableCell className="max-w-0 overflow-hidden">
                    <TruncatedCell value={session.device || "unknown"} />
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(session.lastUsedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(session.expiresAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.revoked ? "outline" : "secondary"}>
                      {session.revoked ? "Revoked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canRevoke ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={revokingId === session._id || session.revoked}
                        onClick={() => onRevoke(session._id)}
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        {revokingId === session._id ? "…" : "Revoke"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
