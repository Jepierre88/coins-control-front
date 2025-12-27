"use client"

import * as React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

export type CoinsSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type CoinsSelectProps = Omit<React.ComponentPropsWithoutRef<"select">, "children"> & {
  options: CoinsSelectOption[]
  placeholder?: string
}

export default function CoinsSelect({ className, options, placeholder, ...props }: CoinsSelectProps) {
  const {
    value,
    defaultValue,
    onChange,
    disabled,
    required,
    name,
    id,
    autoFocus,
    onBlur,
    onFocus,
    ...rest
  } = props

  const items = React.useMemo(
    () => options.map((o) => ({ id: o.value, label: o.label, isDisabled: o.disabled })),
    [options],
  )

  return (
    <Select
      {...(rest as Omit<React.ComponentProps<typeof Select>, "children">)}
      id={id}
      name={name}
      autoFocus={autoFocus}
      isDisabled={disabled}
      isRequired={required}
      placeholder={placeholder}
      selectedKey={value === undefined || value === "" ? undefined : String(value)}
      defaultSelectedKey={
        defaultValue === undefined || defaultValue === "" ? undefined : String(defaultValue)
      }
      onBlur={onBlur as unknown as React.FocusEventHandler<Element>}
      onFocus={onFocus as unknown as React.FocusEventHandler<Element>}
      onSelectionChange={(key) => {
        const nextValue = key == null ? "" : String(key)
        onChange?.({ target: { value: nextValue } } as unknown as React.ChangeEvent<HTMLSelectElement>)
      }}
    >
      <SelectTrigger className={className} />
      <SelectContent items={items}>
        {(item) => (
          <SelectItem id={item.id} isDisabled={item.isDisabled}>
            {item.label}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
