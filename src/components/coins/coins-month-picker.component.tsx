"use client"

import * as React from "react"

import CoinsSelect from "@/components/coins/coins-select.component"

export type CoinsMonthPickerProps = {
  value: string // YYYY-MM
  onChange: (next: string) => void
  disabled?: boolean
  className?: string
  label?: string
}

function parseMonth(value: string): { year: number; month: number } {
  const [y, m] = (value ?? "").split("-").map((v) => Number(v))
  const year = Number.isFinite(y) && y > 1900 ? y : new Date().getFullYear()
  const month = Number.isFinite(m) && m >= 1 && m <= 12 ? m : new Date().getMonth() + 1
  return { year, month }
}

function toMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

export default function CoinsMonthPicker({
  value,
  onChange,
  disabled,
  className,
  label = "Mes",
}: CoinsMonthPickerProps) {
  const { year, month } = React.useMemo(() => parseMonth(value), [value])

  const monthOptions = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat("es", { month: "long" })
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const label = formatter.format(new Date(2020, i, 1))
      return { value: String(m), label: label.charAt(0).toUpperCase() + label.slice(1) }
    })
  }, [])

  const yearOptions = React.useMemo(() => {
    const current = new Date().getFullYear()
    const years: { value: string; label: string }[] = []
    for (let y = current - 5; y <= current + 1; y++) {
      years.push({ value: String(y), label: String(y) })
    }
    return years
  }, [])

  return (
    <div className={className}>
      <div className="text-muted-fg text-sm/6">{label}</div>
      <div className="mt-1 inline-flex items-center gap-2">
        <CoinsSelect
          value={String(month)}
          onChange={(e) => onChange(toMonthValue(year, Number(e.target.value)))}
          options={monthOptions}
          placeholder="Mes"
          disabled={disabled}
          className="w-fit"
        />
        <CoinsSelect
          value={String(year)}
          onChange={(e) => onChange(toMonthValue(Number(e.target.value), month))}
          options={yearOptions}
          placeholder="Año"
          disabled={disabled}
          className="w-fit"
        />
      </div>
    </div>
  )
}
