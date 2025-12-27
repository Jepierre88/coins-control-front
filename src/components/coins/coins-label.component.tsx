"use client"

import * as React from "react"

import { twMerge } from "tailwind-merge"

export type CoinsLabelProps = React.ComponentPropsWithoutRef<"label">

export default function CoinsLabel({ className, ...props }: CoinsLabelProps) {
  return (
    <label
      data-slot="label"
      className={twMerge("text-sm/6 font-medium text-fg", className)}
      {...props}
    />
  )
}
