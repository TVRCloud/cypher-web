"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface DataPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DataPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: DataPaginationProps) {
  const safe = Math.max(totalPages, 1);
  const from = total === 0 ? 0 : page * limit + 1;
  const to = Math.min((page + 1) * limit, total);
  const atStart = page === 0;
  const atEnd = page >= safe - 1;

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-t border-border/40">
      {/* Left: count */}
      <p className="text-xs text-muted-foreground tabular-nums shrink-0 hidden sm:block">
        {total === 0 ? "No results" : `${from}–${to} of ${total}`}
      </p>

      {/* Centre: prev / pages / next */}
      <div className="flex items-center gap-1 mx-auto sm:mx-0">
        <button
          disabled={atStart}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-0.5">
          {buildPages(page, safe).map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="h-8 w-6 flex items-center justify-center text-xs text-muted-foreground select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={[
                  "h-8 min-w-8 px-2 rounded-lg text-xs font-medium transition-colors tabular-nums",
                  p === page
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {(p as number) + 1}
              </button>
            ),
          )}
        </div>

        <button
          disabled={atEnd}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Right: rows per page */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:inline">Rows</span>
        <Select
          value={String(limit)}
          onValueChange={(v) => { onLimitChange(Number(v)); onPageChange(0); }}
        >
          <SelectTrigger className="h-7 w-14 text-xs px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {[10, 20, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages = new Set<number>([0, total - 1]);
  for (let i = Math.max(0, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.add(i);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "…")[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const gap = sorted[i] - sorted[i - 1];
      if (gap === 2) result.push(sorted[i - 1] + 1);
      else if (gap > 2) result.push("…");
    }
    result.push(sorted[i]);
  }

  return result;
}
