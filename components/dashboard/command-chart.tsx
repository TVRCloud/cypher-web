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
import type { TopFile } from "@/lib/services/bot/downloads.service";

const chartConfig = {
  count: { label: "Downloads", color: "oklch(0.62 0.2 250)" },
} satisfies ChartConfig;

interface CommandChartProps {
  data: TopFile[];
}

export function CommandChart({ data }: CommandChartProps) {
  const chartData = data.map((f) => ({
    name: f.file_name.length > 22 ? f.file_name.slice(0, 22) + "…" : f.file_name,
    count: f.count,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Top Downloaded Files</CardTitle>
        <CardDescription className="text-xs">Most downloaded files of all time</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-55 w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={88}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
