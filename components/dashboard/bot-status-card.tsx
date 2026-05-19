"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/_ui/card";
import { Badge } from "@/components/_ui/badge";
import { Separator } from "@/components/ui/separator";
import { BotMessageSquare, Wifi, WifiOff, Clock, Timer, Tag } from "lucide-react";

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
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

interface BotStatusCardProps {
  botName: string;
  online: boolean;
  lastSeen: string | null;
  uptimeSeconds: number | null;
  version: string | null;
  totalHandled: number;
}

export function BotStatusCard({
  botName,
  online,
  lastSeen,
  uptimeSeconds,
  version,
  totalHandled,
}: BotStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <BotMessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{botName}</CardTitle>
              <p className="text-xs text-muted-foreground">Telegram Bot</p>
            </div>
          </div>
          <Badge
            variant={online ? "default" : "destructive"}
            className="gap-1 text-xs"
          >
            {online ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {online ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="text-muted-foreground flex items-center gap-1">
              <Timer className="h-3 w-3" /> Uptime
            </p>
            <p className="font-medium">
              {uptimeSeconds != null ? formatUptime(uptimeSeconds) : "—"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground flex items-center gap-1">
              <Tag className="h-3 w-3" /> Version
            </p>
            <p className="font-medium truncate" title={version ?? "—"}>
              {version ?? "—"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Last seen</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastSeen ? relativeTime(lastSeen) : "—"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Files served</p>
            <p className="font-medium">{totalHandled.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
