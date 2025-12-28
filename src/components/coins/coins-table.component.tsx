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
import { useLoading } from "@/context/loading.context"
import CoinsLoader from "./coins-loader.component"

// Componentes fuera del render para evitar problemas de hidratación
function EmptyStateComponent({ message }: { message?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg
        className="mb-4 h-12 w-12 md:h-16 md:w-16 text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p className="text-sm md:text-base font-medium text-fg">
        {message ?? "No hay datos disponibles"}
      </p>
      <p className="mt-1 text-xs md:text-sm text-muted-fg max-w-xs">
        Los resultados aparecerán aquí cuando estén disponibles
      </p>
    </div>
  )
}

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
  /** @deprecated Use loadingKey instead */
  isLoading?: boolean
  /** Loading key para usar con el LoadingContext */
  loadingKey?: string
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
  /** Renderizar custom card para mobile (opcional, si no se provee usa el default) */
  renderMobileCard?: (item: TItem, index: number) => React.ReactNode
}

export function CoinsTable<TItem extends object>({
  ariaLabel,
  items,
  columns,
  getRowId,
  className,
  isLoading: isLoadingProp,
  loadingKey,
  emptyState,
  loadingState,
  renderMobileCard,
}: CoinsTableProps<TItem>) {
  const [isMobile, setIsMobile] = React.useState(false)
  const { isLoading: isLoadingContext } = useLoading()

  const isLoading = loadingKey ? isLoadingContext(loadingKey) : (isLoadingProp ?? false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Vista mobile: cards
  if (isMobile) {
    if (isLoading) {
      return <CoinsLoader message={loadingState} />
    }

    if (items.length === 0) {
      return <EmptyStateComponent message={emptyState} />
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

          // Default card: muestra todas las columnas en grid de 2 columnas
          const visibleColumns = columns.filter(col => !col.hideOnMobile)

          return (
            <Card key={id} role="listitem" className="transition-shadow hover:shadow-md">
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {visibleColumns.map((column) => {
                    const isHeader = column.isRowHeader
                    return (
                      <div
                        key={column.id}
                        className={isHeader ? "col-span-2 border-b border-muted pb-2.5" : ""}
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
          isLoading ? <CoinsLoader message={loadingState} /> : <EmptyStateComponent message={emptyState} />
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
