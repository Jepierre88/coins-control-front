import * as React from "react"

import { twMerge } from "tailwind-merge"

export type CoinsBadgeIntent =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted"

export type CoinsBadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  intent?: CoinsBadgeIntent
}

export default function CoinsBadge({ className, intent = "muted", ...props }: CoinsBadgeProps) {
  return (
    <span
      data-slot="badge"
      className={twMerge(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs/5 font-medium",
        "border-border",
        intent === "muted" && "bg-muted text-muted-fg",
        intent === "secondary" && "bg-secondary text-secondary-fg",
        intent === "primary" && "bg-primary-subtle text-primary-subtle-fg",
        intent === "success" && "bg-success-subtle text-success-subtle-fg",
        intent === "warning" && "bg-warning-subtle text-warning-subtle-fg",
        intent === "danger" && "bg-danger-subtle text-danger-subtle-fg",
        intent === "info" && "bg-info-subtle text-info-subtle-fg",
        className,
      )}
      {...props}
    />
  )
}

export function CoinsTag(props: CoinsBadgeProps) {
  return <CoinsBadge {...props} />
}
