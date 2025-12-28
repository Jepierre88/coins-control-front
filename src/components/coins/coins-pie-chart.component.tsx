"use client"

import * as React from "react"
import { Label, LabelList, Pie, PieChart } from "recharts"
import { Chart, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export type CoinsPieChartItem = {
  name: string
  value: number
}

export type CoinsPieChartProps = {
  items: CoinsPieChartItem[]
  className?: string
  containerHeight?: number,
  legendNameKey?: string,
  middleLabel?: string,
}

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
]

export default function CoinsPieChart({
  items,
  className,
  containerHeight = 280,
  middleLabel = "Total",
}: CoinsPieChartProps) {
  const totalValue = React.useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.value, 0)
  }, [items])

  const chartConfig: ChartConfig = React.useMemo(() => {
    const cfg: ChartConfig = {
      value: {
        label: "Agendamientos",
      },
    }
    
    items.forEach((item, idx) => {
      const key = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `item-${idx}`
      cfg[key] = {
        label: item.name,
        color: COLORS[idx % COLORS.length],
      }
    })
    
    return cfg
  }, [items])

  const chartData = React.useMemo(() => {
    return items.map((item, idx) => {
      const key = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `item-${idx}`
      return {
        category: key,
        value: item.value,
        fill: `var(--color-${key})`,
      }
    })
  }, [items])

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
              content={<ChartTooltipContent nameKey="category" hideLabel accessibilityLayer/>}
            />
            <Pie 
              data={chartData} 
              dataKey="value" 
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              onClick={(entry) => {
                onLegendSelect(entry.category)
              }}
              style={{ cursor: "pointer" }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy + 30}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 40}
                          className="fill-fg text-3xl font-bold"
                        >
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 20}
                          className="fill-muted-fg"
                        >
                          {middleLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent/>}
              verticalAlign="bottom"
            />
          </PieChart>
        )}
      </Chart>
    </div>
  )
}
