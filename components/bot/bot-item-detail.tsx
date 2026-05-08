"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { fetchBotItem } from "@/lib/services/bot/base";
import { type BotModuleKey } from "@/hooks/use-bot-module-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MODULE_LABELS: Record<BotModuleKey, string> = {
  users: "User",
  files: "File",
  groups: "Group",
  feedbacks: "Feedback",
  logs: "Log",
  config: "Config",
  settings: "Setting",
};

function FieldValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === "boolean") {
    return <Badge variant={value ? "default" : "secondary"}>{String(value)}</Badge>;
  }
  if (typeof value === "object") {
    return (
      <pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return <span className="break-all">{String(value)}</span>;
}

export function BotItemDetail({ module }: { module: BotModuleKey }) {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const { data, isLoading, error } = useQuery<Record<string, unknown>>({
    queryKey: ["bot-item", module, id],
    queryFn: () => fetchBotItem<Record<string, unknown>>(`/api/bot/${module}`, id),
  });

  const label = MODULE_LABELS[module];

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{label} Detail</CardTitle>
          <CardDescription className="font-mono text-xs">{id}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load</AlertTitle>
              <AlertDescription>{String(error)}</AlertDescription>
            </Alert>
          ) : data ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {key}
                  </dt>
                  <dd>
                    <FieldValue value={value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
