"use client";

import {
  MessageSquare,
  Users,
  Terminal,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/_ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import { BotStatusCard } from "@/components/dashboard/bot-status-card";
import { MessageChart } from "@/components/dashboard/message-chart";
import { CommandChart } from "@/components/dashboard/command-chart";
import { RecentMessagesTable } from "@/components/dashboard/recent-messages-table";
import { useBotStatsQuery } from "@/hooks/use-bot-stats-query";
import { useTopFilesQuery } from "@/hooks/use-top-files-query";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function DashboardPageContent() {
  const { data: botStats } = useBotStatsQuery();
  const { data: topFiles = [] } = useTopFilesQuery();

  const stats = useMemo(
    () => [
      {
        label: "Total Files",
        value: formatNumber(botStats?.totalFiles ?? 0),
        change: `${formatNumber(botStats?.approvedGroups ?? 0)} approved`,
        positive: true,
        icon: MessageSquare,
        sub: "in bot database",
      },
      {
        label: "Bot Users",
        value: formatNumber(botStats?.totalUsers ?? 0),
        change: `${formatNumber(botStats?.totalGroups ?? 0)} groups`,
        positive: true,
        icon: Users,
        sub: "tracked by bot",
      },
      {
        label: "Bot Actions",
        value: formatNumber(botStats?.botActionLogs ?? 0),
        change: `${formatNumber(botStats?.totalLogs ?? 0)} total logs`,
        positive: true,
        icon: Terminal,
        sub: "from event logs",
      },
      {
        label: "Pending Feedbacks",
        value: formatNumber(botStats?.pendingFeedbacks ?? 0),
        change: `${formatNumber(botStats?.pausedGroups ?? 0)} paused groups`,
        positive: (botStats?.pendingFeedbacks ?? 0) === 0,
        icon: TrendingUp,
        sub: "needs admin review",
      },
    ],
    [botStats],
  );

  const hb = botStats?.botHeartbeat ?? null;
  const maxTopCount = topFiles[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const Arrow = s.positive ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="flex items-center gap-1 text-xs mt-1 text-muted-foreground">
                  <span
                    className={`flex items-center font-medium ${
                      s.positive ? "text-emerald-500" : "text-destructive"
                    }`}
                  >
                    <Arrow className="h-3 w-3" />
                    {s.change}
                  </span>
                  {s.sub}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-8">
          <TabsTrigger value="overview" className="text-xs px-3">Overview</TabsTrigger>
          <TabsTrigger value="messages" className="text-xs px-3">Downloads</TabsTrigger>
          <TabsTrigger value="commands" className="text-xs px-3">Top Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <BotStatusCard
                botName="@CypherBot"
                online={hb?.online ?? false}
                lastSeen={hb?.lastSeen ?? null}
                uptimeSeconds={hb?.uptimeSeconds ?? null}
                version={hb?.version ?? null}
                totalHandled={botStats?.totalFiles ?? 0}
              />
            </div>
            <div className="lg:col-span-2">
              <MessageChart />
            </div>
          </div>

          <RecentMessagesTable />
        </TabsContent>

        <TabsContent value="messages" className="mt-4 space-y-4">
          <MessageChart />
          <RecentMessagesTable />
        </TabsContent>

        <TabsContent value="commands" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CommandChart data={topFiles} />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Download Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topFiles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No download data yet</p>
                ) : (
                  topFiles.map((f) => (
                    <div key={f.file_name} className="flex items-center gap-3 text-xs">
                      <p
                        className="w-36 shrink-0 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                        title={f.file_name}
                      >
                        {f.file_name}
                      </p>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${Math.round((f.count / maxTopCount) * 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-muted-foreground">
                        {formatNumber(f.count)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
