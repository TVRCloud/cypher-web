"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, ChevronDown, RefreshCw, Search, SlidersHorizontal, X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/_ui/card";
import { Button } from "@/components/_ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { DataPagination } from "@/components/ui/data-pagination";
import { useBotModuleQuery, type BotModuleKey } from "@/hooks/use-bot-module-query";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/_ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ColumnDef = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown) => React.ReactNode;
};

export type FilterConfig =
  | { type?: "select";      param: string; label: string; options: { value: string; label: string }[] }
  | { type: "input";        param: string; label: string; placeholder?: string; inputMode?: "text" | "numeric" }
  | { type: "multiselect";  param: string; label: string; options: { value: string; label: string }[] };

function safeText(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}


function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function BotModuleTable({
  title,
  description,
  module,
  columns,
  navigatable = true,
  detailBase,
  searchable = false,
  searchPlaceholder = "Search…",
  filters = [],
}: {
  title: string;
  description: string;
  module: BotModuleKey;
  columns: ColumnDef[];
  navigatable?: boolean;
  detailBase?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
}) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>({});
  const debouncedFilterInputs = useDebounce(filterInputs, 400);
  const [filterMulti, setFilterMulti] = useState<Record<string, string[]>>({});

  const search = useDebounce(searchInput, 400);

  // While the user is mid-type (input hasn't settled), treat page as 0
  // so we don't fire a wasted query with old search + new page reset.
  const effectivePage = searchInput !== search ? 0 : page;

  const extraParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (sortBy) { p.sort_by = sortBy; p.sort_dir = sortDir; }
    Object.entries(filterValues).forEach(([k, v]) => { if (v && v !== "all") p[k] = v; });
    Object.entries(debouncedFilterInputs).forEach(([k, v]) => { if (v.trim()) p[k] = v.trim(); });
    Object.entries(filterMulti).forEach(([k, vals]) => { if (vals.length > 0) p[k] = vals.join(","); });
    return p;
  }, [search, sortBy, sortDir, filterValues, debouncedFilterInputs, filterMulti]);

  const { data: payload, isLoading, isFetching, error, refetch } = useBotModuleQuery(module, {
    page: effectivePage, limit, ...extraParams,
  });

  const rows = useMemo(() => payload?.data ?? [], [payload]);
  const totalPages = useMemo(() => {
    if (!payload) return 0;
    return typeof payload.totalPages === "number"
      ? payload.totalPages
      : Math.ceil(payload.total / payload.limit);
  }, [payload]);

  function handleRowClick(row: Record<string, unknown>) {
    if (!navigatable) return;
    const id = row._id;
    if (id === null || id === undefined) return;
    const base = detailBase ?? `/bot/${module}`;
    router.push(`${base}/${encodeURIComponent(String(id))}`);
  }

  function handleSearchChange(val: string) {
    setSearchInput(val);
  }

  function toggleSort(key: string) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  function handleFilterChange(param: string, val: string) {
    setFilterValues((prev) => ({ ...prev, [param]: val }));
    setPage(0);
  }

  const hasActiveFilters =
    searchInput ||
    sortBy ||
    Object.values(filterValues).some((v) => v && v !== "all") ||
    Object.values(filterInputs).some((v) => v.trim()) ||
    Object.values(filterMulti).some((vals) => vals.length > 0);

  function clearAll() {
    setSearchInput("");
    setSortBy("");
    setSortDir("desc");
    setFilterValues({});
    setFilterInputs({});
    setFilterMulti({});
    setPage(0);
  }

  function toggleMultiOption(param: string, value: string) {
    setFilterMulti((prev) => {
      const current = prev[param] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [param]: next };
    });
    setPage(0);
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="px-4 pt-4 pb-0 border-b border-border/40">
        <div className="flex items-center justify-between gap-2 pb-3">
          <div>
            <p className="text-base font-semibold leading-none">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {description} ·{" "}
              <span className="font-medium text-foreground tabular-nums">
                {payload?.total?.toLocaleString() ?? 0}
              </span>{" "}
              records
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground" onClick={clearAll}>
                <X size={12} /> Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        {(searchable || filters.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 pb-3">
            {searchable && (
              <div className="relative flex-1 min-w-40">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-8 h-8 text-sm"
                  placeholder={searchPlaceholder}
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchInput && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
            {filters.map((f) =>
              f.type === "input" ? (
                <div key={f.param} className="relative">
                  <Input
                    className="h-8 w-28 text-xs pl-2.5 pr-6"
                    placeholder={f.placeholder ?? f.label}
                    inputMode={f.inputMode ?? "text"}
                    value={filterInputs[f.param] ?? ""}
                    onChange={(e) =>
                      setFilterInputs((prev) => ({ ...prev, [f.param]: e.target.value }))
                    }
                  />
                  {filterInputs[f.param] && (
                    <button
                      onClick={() => setFilterInputs((prev) => ({ ...prev, [f.param]: "" }))}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              ) : f.type === "multiselect" ? (
                <DropdownMenu key={f.param}>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-background text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <SlidersHorizontal size={11} />
                      {f.label}
                      {(filterMulti[f.param]?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                          {filterMulti[f.param].length}
                        </span>
                      )}
                      <ChevronDown size={10} className="opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {f.options.map((o) => (
                      <DropdownMenuCheckboxItem
                        key={o.value}
                        checked={(filterMulti[f.param] ?? []).includes(o.value)}
                        onCheckedChange={() => toggleMultiOption(f.param, o.value)}
                        className="text-xs"
                      >
                        {o.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Select
                  key={f.param}
                  value={filterValues[f.param] ?? "all"}
                  onValueChange={(v) => handleFilterChange(f.param, v)}
                >
                  <SelectTrigger className="h-8 w-auto min-w-27.5 text-xs gap-1.5">
                    <SlidersHorizontal size={11} className="text-muted-foreground" />
                    <SelectValue placeholder={f.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{f.label}: All</SelectItem>
                    {"options" in f && f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{String(error)}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* ── Tablet / desktop table (md+) ── */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="h-9 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 select-none"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        <button
                          onClick={() => toggleSort(col.key)}
                          className="rounded p-0.5 hover:bg-muted transition-colors"
                          aria-label={`Sort by ${col.label}`}
                        >
                          {sortBy === col.key
                            ? sortDir === "asc"
                              ? <ArrowUp size={11} className="text-primary" />
                              : <ArrowDown size={11} className="text-primary" />
                            : <ArrowUpDown size={11} className="text-muted-foreground/30" />}
                        </button>
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30">
                    {columns.map((col) => (
                      <TableCell key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow className="border-b-0">
                  <TableCell
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    {searchInput || Object.values(filterValues).some((v) => v && v !== "all")
                      ? "No results match your search."
                      : "No data found."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow
                    key={String((row as Record<string, unknown>)._id ?? idx)}
                    onClick={() => handleRowClick(row as Record<string, unknown>)}
                    className={`border-b border-border/30 transition-colors ${
                      navigatable ? "cursor-pointer hover:bg-muted/30 active:bg-muted/50" : "hover:bg-transparent"
                    }`}
                  >
                    {columns.map((col) => {
                      const val = (row as Record<string, unknown>)[col.key] ?? null;
                      return (
                        <TableCell key={col.key} className="max-w-0 overflow-hidden px-4 py-3 text-sm">
                          {col.render ? col.render(val) : <TruncatedCell value={safeText(val)} />}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Mobile cards (< md) ── */}
        <div className="md:hidden p-3 space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/30 bg-card p-4 space-y-3">
                <Skeleton className="h-4 w-3/5" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {searchInput || Object.values(filterValues).some((v) => v && v !== "all")
                ? "No results match your filters."
                : "No data found."}
            </p>
          ) : (
            rows.map((row, idx) => {
              const r = row as Record<string, unknown>;
              const primaryCol = columns[0];
              const secondaryCols = columns.slice(1);
              return (
                <div
                  key={String(r._id ?? idx)}
                  onClick={() => handleRowClick(r)}
                  className={`rounded-2xl border border-border/30 bg-card p-4 space-y-3 transition-colors ${
                    navigatable ? "cursor-pointer active:bg-muted/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate flex-1 leading-snug">
                      {safeText(r[primaryCol.key])}
                    </p>
                    {navigatable && (
                      <ChevronRight size={15} className="text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                  </div>
                  {secondaryCols.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                      {secondaryCols.map((col) => (
                        <div key={col.key} className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 leading-none mb-1">
                            {col.label}
                          </p>
                          {col.render
                            ? <div className="mt-0.5">{col.render(r[col.key])}</div>
                            : <p className="text-xs text-foreground/80 truncate">{safeText(r[col.key])}</p>
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="px-4">
          <DataPagination
            page={effectivePage}
            totalPages={totalPages}
            total={payload?.total ?? 0}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(0); }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
