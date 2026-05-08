"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/_ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = [
  { command: "/start",  uses: 1240 },
  { command: "/help",   uses: 890 },
  { command: "/status", uses: 640 },
  { command: "/info",   uses: 510 },
  { command: "/stop",   uses: 380 },
  { command: "/sub",    uses: 290 },
];

const chartConfig = {
  uses: { label: "Uses", color: "oklch(0.62 0.2 250)" },
} satisfies ChartConfig;

export function CommandChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Top Commands</CardTitle>
        <CardDescription className="text-xs">Most used bot commands this week</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="command"
              type="category"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="uses"
              fill="var(--color-uses)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
