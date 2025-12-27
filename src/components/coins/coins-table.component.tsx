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

export type CoinsTableColumn<TItem extends object> = {
  id: string
  header: React.ReactNode
  cell: (item: TItem) => React.ReactNode
  isRowHeader?: boolean
  allowsSorting?: boolean
  isResizable?: boolean
  className?: string
} & Omit<ColumnProps, "children" | "id" | "className">

export type CoinsTableProps<TItem extends object> = {
  ariaLabel: string
  items: TItem[]
  columns: Array<CoinsTableColumn<TItem>>
  getRowId?: (item: TItem, index: number) => string | number
  className?: string
  isLoading?: boolean
  emptyState?: React.ReactNode
}

export function CoinsTable<TItem extends object>({
  ariaLabel,
  items,
  columns,
  getRowId,
  className,
  isLoading,
  emptyState,
}: CoinsTableProps<TItem>) {
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
