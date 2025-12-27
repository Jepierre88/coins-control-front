"use client"

import * as React from "react"

import { twMerge } from "tailwind-merge"
import { LineChart } from "@/components/ui/line-chart"

export type CoinsSeriesPoint = {
  label: string
  value: number
}

export type CoinsLineChartProps = {
  points: CoinsSeriesPoint[]
  className?: string
  seriesLabel?: string
  colorVar?: "--chart-1" | "--chart-2" | "--chart-3" | "--chart-4" | "--chart-5" | "--primary"
  maxValue?: number
  containerHeight?: number
}

function resolveIntentUIColor(colorVar?: CoinsLineChartProps["colorVar"]) {
  if (!colorVar) return undefined
  return colorVar === "--chart-1"
    ? "chart-1"
    : colorVar === "--chart-2"
      ? "chart-2"
      : colorVar === "--chart-3"
        ? "chart-3"
        : colorVar === "--chart-4"
          ? "chart-4"
          : colorVar === "--chart-5"
            ? "chart-5"
            : `var(${colorVar})`
}

export default function CoinsLineChart({
  points,
  className,
  seriesLabel = "Agendamientos",
  colorVar = "--chart-1",
  maxValue,
  containerHeight = 220,
}: CoinsLineChartProps) {
  const config = React.useMemo(() => {
    return {
      value: { label: seriesLabel, color: resolveIntentUIColor(colorVar) },
    }
  }, [seriesLabel, colorVar])

  const data = React.useMemo(() => {
    return points.map((p) => ({ label: p.label, value: p.value }))
  }, [points])

  const maxFromPoints = Math.max(0, ...points.map((p) => p.value))
  const domainMax = Math.max(1, maxValue ?? maxFromPoints)

  return (
    <div className={twMerge(className)}>
      <LineChart
        config={config}
        data={data}
        dataKey="label"
        containerHeight={containerHeight}
        yAxisProps={{ domain: [0, domainMax] }}
      />
    </div>
  )
}
