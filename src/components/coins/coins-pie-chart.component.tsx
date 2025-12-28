"use client";

import * as React from "react";
import { PieChart } from "@/components/ui/pie-chart";
import type { ChartConfig } from "@/components/ui/chart";
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
  onSliceClick?: (item: CoinsPieChartItem | null) => void;
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
  onSliceClick,
}: CoinsPieChartProps) {
  const { isLoading: isLoadingContext } = useLoading();
  const isLoading = loadingKey ? isLoadingContext(loadingKey) : false;
  
  const [selectedName, setSelectedName] = React.useState<string | null>(null);

  const totalValue = React.useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.value, 0);
  }, [items]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const cfg: ChartConfig = {};

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
    return items.map((item, idx) => {
      const key =
        item.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || `item-${idx}`;
      return {
        name: key,
        value: item.value,
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
      <PieChart
        data={chartData}
        dataKey="value"
        nameKey="name"
        config={chartConfig}
        containerHeight={containerHeight}
        variant="donut"
        showLabel
        label={`${totalValue}\n${middleLabel}`}
        valueFormatter={(v) => v.toLocaleString()}
        pieProps={{
          innerRadius: "50%",
          outerRadius: (dp: { name: string }) => (dp.name === selectedName ? 110 : 90),
          onClick: (data: any) => {
            const isDeselecting = selectedName === data.name;
            setSelectedName(isDeselecting ? null : data.name);
            
            if (onSliceClick) {
              if (isDeselecting) {
                onSliceClick(null as any);
              } else {
                const originalItem = items.find(item => {
                  const key =
                    item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "") || "";
                  return key === data.name;
                });
                if (originalItem) {
                  onSliceClick(originalItem);
                }
              }
            }
          },
          style: { cursor: "pointer" },
        }}
      />
    </div>
  );
}
