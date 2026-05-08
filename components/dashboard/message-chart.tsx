"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/_ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data7d = [
  { day: "Mon", incoming: 420, outgoing: 380 },
  { day: "Tue", incoming: 610, outgoing: 540 },
  { day: "Wed", incoming: 530, outgoing: 490 },
  { day: "Thu", incoming: 740, outgoing: 670 },
  { day: "Fri", incoming: 880, outgoing: 820 },
  { day: "Sat", incoming: 460, outgoing: 430 },
  { day: "Sun", incoming: 310, outgoing: 290 },
];

const data30d = [
  { day: "Week 1", incoming: 2940, outgoing: 2700 },
  { day: "Week 2", incoming: 3210, outgoing: 2950 },
  { day: "Week 3", incoming: 2780, outgoing: 2540 },
  { day: "Week 4", incoming: 3580, outgoing: 3280 },
];

const chartConfig = {
  incoming: { label: "Incoming", color: "oklch(0.62 0.2 250)" },
  outgoing: { label: "Outgoing", color: "oklch(0.65 0.18 145)" },
} satisfies ChartConfig;

export function MessageChart() {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const data = range === "7d" ? data7d : data30d;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">Message Volume</CardTitle>
          <CardDescription className="text-xs">
            Incoming vs outgoing messages
          </CardDescription>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as "7d" | "30d")}>
          <SelectTrigger className="h-7 w-[90px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-incoming)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-incoming)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillOutgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-outgoing)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-outgoing)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="incoming"
              stroke="var(--color-incoming)"
              strokeWidth={2}
              fill="url(#fillIncoming)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="outgoing"
              stroke="var(--color-outgoing)"
              strokeWidth={2}
              fill="url(#fillOutgoing)"
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
