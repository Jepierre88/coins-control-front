"use client"

import * as React from "react"

import { CalendarDate, type DateValue } from "@internationalized/date"
import { DatePicker, DatePickerTrigger } from "@/components/ui/date-picker"

export type CoinsMonthPickerProps = {
  value: string // YYYY-MM
  onChange: (next: string) => void
  disabled?: boolean
  className?: string
  label?: string
}

function parseMonth(value: string): { year: number; month: number } {
  const [y, m] = value.split("-").map((v) => Number(v))
  return { year: y, month: m }
}

export default function CoinsMonthPicker({
  value,
  onChange,
  disabled,
  className,
  label = "Mes",
}: CoinsMonthPickerProps) {
  const { year, month } = React.useMemo(() => parseMonth(value), [value])
  const pickerValue = React.useMemo<DateValue>(() => {
    const safeYear = year || new Date().getFullYear()
    const safeMonth = month && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1
    return new CalendarDate(safeYear, safeMonth, 1)
  }, [year, month])

  return (
    <div className={className}>
      <div className="text-muted-fg text-sm/6">{label}</div>
      <div className="mt-1">
        <DatePicker
          value={pickerValue}
          onChange={(next) => {
            if (!next) return
            // We only use year-month for filtering; day is ignored.
            const nextMonth = String(next.month).padStart(2, "0")
            onChange(`${next.year}-${nextMonth}`)
          }}
          isDisabled={disabled}
          // If supported by react-aria, this keeps the field on month granularity.
          // Otherwise it's ignored at runtime; TS will tell us if unsupported.
          // @ts-expect-error - granularity may not include 'month' depending on version.
          granularity="month"
        >
          <DatePickerTrigger className="w-full" />
        </DatePicker>
      </div>
    </div>
  )
}
