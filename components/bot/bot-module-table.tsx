"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_ui/card";
import { Button } from "@/components/_ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataPagination } from "@/components/ui/data-pagination";
import { useBotModuleQuery, type BotModuleKey } from "@/hooks/use-bot-module-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/_ui/table";

function SafeValue({ value }: { value: unknown }) {
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const text = value === null || value === undefined
    ? "—"
    : typeof value === "string"
    ? value || "—"
    : JSON.stringify(value);

  useEffect(() => {
    const node = textRef.current;
    if (!node) return;

    let frame = 0;
    const measure = () => {
      const next = node.scrollWidth > node.clientWidth;
      setIsTruncated((prev) => (prev === next ? prev : next));
    };

    frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [text]);

  const content = (
    <span ref={textRef} className="block w-full truncate cursor-default">
      {text}
    </span>
  );

  if (!isTruncated) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-all text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export function BotModuleTable({
  title,
  description,
  module,
  columns,
  navigatable = true,
}: {
  title: string;
  description: string;
  module: BotModuleKey;
  columns: Array<{ key: string; label: string }>;
  navigatable?: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const { data: payload, isLoading, isFetching, error, refetch } = useBotModuleQuery(module, {
    page,
    limit,
  });

  const rows = useMemo(() => payload?.data ?? [], [payload]);
  const totalPages = useMemo(() => {
    if (!payload) return 0;
    if (typeof payload.totalPages === "number") return payload.totalPages;
    return Math.ceil(payload.total / payload.limit);
  }, [payload]);
  const currentPage = payload?.page ?? page;

  function handleRowClick(row: Record<string, unknown>) {
    if (!navigatable) return;
    const id = row._id;
    if (id === null || id === undefined) return;
    router.push(`/bot/${module}/${encodeURIComponent(String(id))}`);
  }

  return (
    <Card>
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              {description} • <span className="font-medium text-foreground">{payload?.total ?? 0}</span> records
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load data</AlertTitle>
            <AlertDescription>{String(error)}</AlertDescription>
          </Alert>
        ) : null}

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="h-9 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-border/30">
                <TableCell colSpan={columns.length} className="px-4 py-4 text-sm text-muted-foreground">
                  Loading data…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="border-b-0">
                <TableCell colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={String(row._id ?? idx)}
                  onClick={() => handleRowClick(row as Record<string, unknown>)}
                  className={`border-b border-border/30 transition-colors ${navigatable ? "cursor-pointer hover:bg-muted/30" : "hover:bg-transparent"}`}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="max-w-0 overflow-hidden px-4 py-3.5">
                      <SafeValue value={row[column.key] ?? null} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 ? (
          <DataPagination
            page={currentPage}
            totalPages={totalPages}
            total={payload?.total ?? 0}
            limit={limit}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(0);
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
