"use client";

import * as React from "react";
import { Label, LabelList, Pie, PieChart } from "recharts";
import {
  Chart,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useLoading } from "@/context/loading.context";
import CoinsLoader from "./coins-loader.component";

export type CoinsPieChartItem = {
  name: string;
  value: number;
};

export type CoinsPieChartProps = {
  items: CoinsPieChartItem[];
  className?: string;
  containerHeight?: number;
  legendNameKey?: string;
  middleLabel?: string;
  loadingKey?: string;
};

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#a855f7", // purple
];

export default function CoinsPieChart({
  items,
  className,
  containerHeight = 280,
  middleLabel = "Total",
  loadingKey,
}: CoinsPieChartProps) {
  const { isLoading: isLoadingContext } = useLoading();
  const isLoading = loadingKey ? isLoadingContext(loadingKey) : false;
  
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const totalValue = React.useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.value, 0);
  }, [items]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const cfg: ChartConfig = {
      value: {
        label: "Agendamientos",
      },
    };

    items.forEach((item, idx) => {
      const key =
        item.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || `item-${idx}`;
      cfg[key] = {
        label: item.name,
        color: COLORS[idx % COLORS.length],
      };
    });

    return cfg;
  }, [items]);

  const chartData = React.useMemo(() => {
    const total = items.reduce((acc, curr) => acc + curr.value, 0);
    return items.map((item, idx) => {
      const key =
        item.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || `item-${idx}`;
      const percentage = total > 0 ? ((item.value / total) * 100) : 0;
      return {
        category: key,
        value: item.value,
        percentage: percentage,
        fill: `var(--color-${key})`,
      };
    });
  }, [items]);

  if (isLoading) {
    return (
      <div className={className} style={{ height: "100%" }}>
        <CoinsLoader />
      </div>
    );
  }

  return (
    <div className={className}>
      <Chart
        config={chartConfig}
        data={chartData}
        layout="radial"
        containerHeight={containerHeight}
      >
        {({ onLegendSelect, selectedLegend }) => (
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="category"
                  hideLabel
                  accessibilityLayer
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              cx={`${50}%`}
              cy={`${50}%`}
              onClick={(entry) => onLegendSelect(entry.category)}
              style={{ cursor: "pointer" }}
              label={({ value }) => {
                const percentage = totalValue > 0 ? ((value / totalValue) * 100) : 0;
                return `${percentage.toFixed(1)}%`;
              }}
              labelLine={false}
            >
              <Label
                content={() => (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none"
                  >
                    <tspan
                      x="50%"
                      dy={-2}
                      className="fill-fg text-3xl font-bold"
                    >
                      {totalValue}
                    </tspan>
                    <tspan x="50%" dy={22} className="fill-muted-fg text-sm">
                      {middleLabel}
                    </tspan>
                  </text>
                )}
              />
            </Pie>
          </PieChart>
        )}
      </Chart>
    </div>
  );
}
