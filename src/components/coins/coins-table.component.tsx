"use client"

import * as React from "react"
import type { ColumnProps } from "react-aria-components"
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

export type CoinsTableColumn<TItem extends object> = {
  id: string
  header: React.ReactNode
  cell: (item: TItem) => React.ReactNode
  isRowHeader?: boolean
  allowsSorting?: boolean
  isResizable?: boolean
  className?: string
  /** En mobile, ocultar esta columna en la vista de cards */
  hideOnMobile?: boolean
} & Omit<ColumnProps, "children" | "id" | "className">

export type CoinsTableProps<TItem extends object> = {
  ariaLabel: string
  items: TItem[]
  columns: Array<CoinsTableColumn<TItem>>
  getRowId?: (item: TItem, index: number) => string | number
  className?: string
  isLoading?: boolean
  emptyState?: React.ReactNode
  /** Renderizar custom card para mobile (opcional, si no se provee usa el default) */
  renderMobileCard?: (item: TItem, index: number) => React.ReactNode
}

export function CoinsTable<TItem extends object>({
  ariaLabel,
  items,
  columns,
  getRowId,
  className,
  isLoading,
  emptyState,
  renderMobileCard,
}: CoinsTableProps<TItem>) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Vista mobile: cards
  if (isMobile) {
    if (isLoading) {
      return (
        <div className="grid place-content-center p-10 text-muted-fg">
          Cargando…
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="grid place-content-center p-10 text-muted-fg">
          {emptyState ?? "Sin resultados"}
        </div>
      )
    }

    return (
      <div className="space-y-3" role="list" aria-label={ariaLabel}>
        {items.map((item, index) => {
          const id = getRowId?.(item, index) ?? index

          if (renderMobileCard) {
            return (
              <div key={id} role="listitem">
                {renderMobileCard(item, index)}
              </div>
            )
          }

          // Default card: muestra todas las columnas como filas
          const visibleColumns = columns.filter(col => !col.hideOnMobile)

          return (
            <Card key={id} role="listitem" className="transition-shadow hover:shadow-md">
              <CardContent>
                <dl className="space-y-2.5">
                  {visibleColumns.map((column) => {
                    const isHeader = column.isRowHeader
                    return (
                      <div
                        key={column.id}
                        className={isHeader ? "border-b border-muted pb-2.5" : ""}
                      >
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                          {column.header}
                        </dt>
                        <dd
                          className={`mt-1 ${isHeader ? "text-base font-semibold text-fg" : "text-sm text-fg"}`}
                        >
                          {column.cell(item)}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Vista desktop: tabla normal
  return (
    <Table aria-label={ariaLabel} className={className}>
      <TableHeader columns={columns}>
        {(col) => {
          const column = col as CoinsTableColumn<TItem>
          return (
            <TableColumn
              id={column.id}
              isRowHeader={column.isRowHeader}
              allowsSorting={column.allowsSorting}
              isResizable={column.isResizable}
              className={column.className}
              width={column.width}
              minWidth={column.minWidth}
              maxWidth={column.maxWidth}
            >
              {column.header}
            </TableColumn>
          )
        }}
      </TableHeader>

      <TableBody
        items={items}
        renderEmptyState={() => (
          <div className="grid place-content-center p-10 text-muted-fg">
            {isLoading ? "Cargando…" : emptyState ?? "Sin resultados"}
          </div>
        )}
      >
        {(item) => {
          const index = items.indexOf(item)
          const id = getRowId?.(item, index) ?? index

          return (
            <TableRow id={id} columns={columns}>
              {(col) => {
                const column = col as CoinsTableColumn<TItem>
                return <TableCell className="whitespace-nowrap">{column.cell(item)}</TableCell>
              }}
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
}
