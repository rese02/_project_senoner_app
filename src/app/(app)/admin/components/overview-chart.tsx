'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const data = [
  { date: 'Mo', sales: Math.floor(Math.random() * 1000) + 200 },
  { date: 'Di', sales: Math.floor(Math.random() * 1000) + 200 },
  { date: 'Mi', sales: Math.floor(Math.random() * 1000) + 200 },
  { date: 'Do', sales: Math.floor(Math.random() * 1000) + 200 },
  { date: 'Fr', sales: Math.floor(Math.random() * 1000) + 200 },
  { date: 'Sa', sales: Math.floor(Math.random() * 1000) + 200 },
  { date: 'So', sales: Math.floor(Math.random() * 1000) + 200 },
];

const chartConfig = {
  sales: {
    label: 'Umsatz',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `€${value}`}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent formatter={(value) => `€${value}`} />}
          />
          <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
