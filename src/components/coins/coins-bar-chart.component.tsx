"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"
import { BarChart } from "@/components/ui/bar-chart"
import { useLoading } from "@/context/loading.context"
import CoinsLoader from "./coins-loader.component"

/* =======================
   Types
======================= */

export type CoinsBarChartItem = {
  label: string
  value: number
  colorVar?: "--chart-1" | "--chart-2" | "--chart-3" | "--chart-4" | "--chart-5" | "--primary"
}

export type CoinsBarChartProps = {
  items: CoinsBarChartItem[]
  className?: string
  maxValue?: number
  loadingKey?: string
  containerHeight?: number
}

/* =======================
   Tooltip
======================= */

type SimpleTooltipProps = {
  active?: boolean
  payload?: Array<{
    value?: number | string
    name?: string
  }>
}

function SingleBarValueTooltip({ active, payload }: SimpleTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0]?.value
  if (value === undefined || value === null) return null

  return (
    <div className="rounded-lg bg-overlay/70 px-3 py-2 text-overlay-fg text-xs ring ring-current/10 backdrop-blur-lg">
      <span className="font-medium font-mono tabular-nums text-fg">
        {String(value)}
      </span>
    </div>
  )
}

/* =======================
   Component
======================= */

export default function CoinsBarChart({
  items,
  className,
  maxValue,
  loadingKey,
  containerHeight,
}: CoinsBarChartProps) {
  const { isLoading: isLoadingContext } = useLoading()
  const isLoading = loadingKey ? isLoadingContext(loadingKey) : false

  /* ✅ Detect mobile */
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  /* ✅ Height final */
  const resolvedHeight =
    typeof containerHeight === "number"
      ? containerHeight
      : isMobile
      ? 450
      : 200

  /* -------- Config -------- */

  const config = React.useMemo(() => {
    const cfg: Record<string, { label: string; color?: string }> = {}

    for (const item of items) {
      const key = item.label
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

      const color =
        item.colorVar === "--chart-1"
          ? "chart-1"
          : item.colorVar === "--chart-2"
          ? "chart-2"
          : item.colorVar === "--chart-3"
          ? "chart-3"
          : item.colorVar === "--chart-4"
          ? "chart-4"
          : item.colorVar === "--chart-5"
          ? "chart-5"
          : item.colorVar
          ? `var(${item.colorVar})`
          : undefined

      cfg[key || item.label] = { label: item.label, color }
    }

    return cfg
  }, [items])

  /* -------- Data -------- */

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

  const chartKey = React.useMemo(
  () => `barchart-${resolvedHeight}-${items.length}`,
  [resolvedHeight, items.length]
)


  /* -------- Loading -------- */

  if (isLoading) {
    return (
      <div className={twMerge(className)} style={{ height: resolvedHeight }}>
        <CoinsLoader />
      </div>
    )
  }

  /* -------- Render -------- */

  return (
    <div className={twMerge(className)}>
      <BarChart
        config={config}
        data={data}
        key={chartKey}
        dataKey="label"
        containerHeight={resolvedHeight}
        yAxisProps={{ domain: [0, domainMax] }}
        tooltip={<SingleBarValueTooltip />}
      />
    </div>
  )
}
