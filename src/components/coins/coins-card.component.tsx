import * as React from "react"

import { twMerge } from "tailwind-merge"

export type CoinsCardProps = React.HTMLAttributes<HTMLDivElement>

export default function CoinsCard({ className, ...props }: CoinsCardProps) {
  return (
    <div
      data-slot="card"
      className={twMerge(
        "group/card flex flex-col gap-(--gutter) rounded-lg border py-(--gutter) text-fg shadow-xs [--gutter:--spacing(6)] has-[table]:overflow-hidden has-[table]:not-has-data-[slot=card-footer]:pb-0 **:data-[slot=table-header]:bg-muted/50 has-[table]:**:data-[slot=card-footer]:border-t **:[table]:overflow-hidden",
        className,
      )}
      {...props}
    />
  )
}

export type CoinsCardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
}

export function CoinsCardHeader({
  className,
  title,
  description,
  children,
  ...props
}: CoinsCardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={twMerge(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-(--gutter) has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    >
      {title && <CoinsCardTitle>{title}</CoinsCardTitle>}
      {description && <CoinsCardDescription>{description}</CoinsCardDescription>}
      {!title && typeof children === "string" ? <CoinsCardTitle>{children}</CoinsCardTitle> : children}
    </div>
  )
}

export type CoinsCardTitleProps = React.ComponentProps<"div">

export function CoinsCardTitle({ className, ...props }: CoinsCardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={twMerge("text-balance font-semibold text-base/6", className)}
      {...props}
    />
  )
}

export type CoinsCardDescriptionProps = React.HTMLAttributes<HTMLDivElement>

export function CoinsCardDescription({ className, ...props }: CoinsCardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={twMerge("row-start-2 text-pretty text-muted-fg text-sm/6", className)}
      {...props}
    />
  )
}

export type CoinsCardActionProps = React.HTMLAttributes<HTMLDivElement>

export function CoinsCardAction({ className, ...props }: CoinsCardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={twMerge("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

export type CoinsCardContentProps = React.HTMLAttributes<HTMLDivElement>

export function CoinsCardContent({ className, ...props }: CoinsCardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={twMerge("px-(--gutter) has-[table]:border-t", className)}
      {...props}
    />
  )
}

export type CoinsCardFooterProps = React.HTMLAttributes<HTMLDivElement>

export function CoinsCardFooter({ className, ...props }: CoinsCardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={twMerge(
        "flex items-center px-(--gutter) group-has-[table]/card:pt-(--gutter) [.border-t]:pt-6",
        className,
      )}
      {...props}
    />
  )
}
