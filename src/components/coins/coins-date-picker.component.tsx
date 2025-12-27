"use client"

import * as React from "react"
import { CalendarDate, parseDate } from "@internationalized/date"
import { DatePicker, DatePickerTrigger } from "@/components/ui/date-picker"

export type CoinsDatePickerProps = {
  value?: string
  onChange: (value: string) => void
  className?: string
  ariaLabel?: string
  isDisabled?: boolean
}

function toCalendarDate(value?: string): CalendarDate | null {
  if (!value) return null
  try {
    return parseDate(value)
  } catch {
    return null
  }
}

function toDateString(value: CalendarDate | null): string {
  return value ? value.toString() : ""
}

export default function CoinsDatePicker({
  value,
  onChange,
  className,
  ariaLabel = "Seleccionar fecha",
  isDisabled,
}: CoinsDatePickerProps) {
  const dateValue = React.useMemo(() => toCalendarDate(value), [value])

  return (
    <DatePicker<CalendarDate>
      aria-label={ariaLabel}
      value={dateValue ?? undefined}
      onChange={(v) => onChange(toDateString(v ?? null))}
      className={className}
      isDisabled={isDisabled}
    >
      <DatePickerTrigger />
    </DatePicker>
  )
}
