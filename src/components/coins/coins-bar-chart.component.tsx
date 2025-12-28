"use client"

import * as React from "react"

import { twMerge } from "tailwind-merge"
import { BarChart } from "@/components/ui/bar-chart"
import { useLoading } from "@/context/loading.context"
import CoinsLoader from "./coins-loader.component"

export type CoinsBarChartItem = {
  label: string
  value: number
  colorVar?: "--chart-1" | "--chart-2" | "--chart-3" | "--chart-4" | "--chart-5" | "--primary"
}

export type CoinsBarChartProps = {
  items: CoinsBarChartItem[]
  className?: string
  maxValue?: number
  /** @deprecated Use loadingKey instead */
  isLoading?: boolean
  /** Loading key para usar con el LoadingContext */
  loadingKey?: string
  containerHeight?: number
}

export default function CoinsBarChart({ 
  items, 
  className, 
  maxValue,
  isLoading: isLoadingProp,
  loadingKey,
  containerHeight = 180,
}: CoinsBarChartProps) {
  const { isLoading: isLoadingContext } = useLoading()
  const isLoading = loadingKey ? isLoadingContext(loadingKey) : (isLoadingProp ?? false)

  const config = React.useMemo(() => {
    const cfg: Record<string, { label: string; color?: string }> = {}

    for (const item of items) {
      const safeKey = item.label
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

      const colorVar = item.colorVar
      const color =
        colorVar === "--chart-1"
          ? "chart-1"
          : colorVar === "--chart-2"
            ? "chart-2"
            : colorVar === "--chart-3"
              ? "chart-3"
              : colorVar === "--chart-4"
                ? "chart-4"
                : colorVar === "--chart-5"
                  ? "chart-5"
                  : colorVar
                    ? `var(${colorVar})`
                    : undefined

      cfg[safeKey || item.label] = { label: item.label, color }
    }

    return cfg
  }, [items])

  const data = React.useMemo(() => {
    const row: Record<string, unknown> = { label: "Métricas" }
    for (const item of items) {
      const key = item.label
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      row[key || item.label] = item.value
    }
    return [row]
  }, [items])

  const maxFromItems = Math.max(0, ...items.map((i) => i.value))
  const domainMax = Math.max(1, maxValue ?? maxFromItems)

  if (isLoading) {
    return (
      <div className={twMerge(className)} style={{ height: containerHeight }}>
        <CoinsLoader />
      </div>
    )
  }

  return (
    <div className={twMerge(className)}>
      <BarChart
        config={config}
        data={data}
        dataKey="label"
        containerHeight={containerHeight}
        yAxisProps={{ domain: [0, domainMax] }}
      />
    </div>
  )
}
