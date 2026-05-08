"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BotMessageSquare, Wifi, WifiOff, Clock } from "lucide-react";

interface BotStatusCardProps {
  botName: string;
  online: boolean;
  uptime: number; // percentage
  responseRate: number; // percentage
  lastSeen: string;
  totalHandled: number;
}

export function BotStatusCard({
  botName,
  online,
  uptime,
  responseRate,
  lastSeen,
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
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Uptime</span>
            <span className="font-medium">{uptime}%</span>
          </div>
          <Progress value={uptime} className="h-1.5" />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Response Rate</span>
            <span className="font-medium">{responseRate}%</span>
          </div>
          <Progress value={responseRate} className="h-1.5" />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Last seen</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastSeen}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Messages handled</p>
            <p className="font-medium">{totalHandled.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
