"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationFirst,
  PaginationGap,
  PaginationItem,
  PaginationLast,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationSection,
} from "@/components/ui/pagination"

type CoinsPaginationProps = {
  pageParam?: string
  pageSizeParam?: string
  totalItems: number
  defaultPageSize?: number
  className?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function parsePositiveInt(value: string | null | undefined, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  const i = Math.floor(n)
  return i > 0 ? i : fallback
}

function buildHref(pathname: string, current: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(current)
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k)
    else next.set(k, v)
  }
  const qs = next.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

export function CoinsPagination({
  pageParam = "page",
  pageSizeParam = "pageSize",
  totalItems,
  defaultPageSize = 20,
  className,
}: CoinsPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageSize = parsePositiveInt(searchParams.get(pageSizeParam), defaultPageSize)
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = clamp(parsePositiveInt(searchParams.get(pageParam), 1), 1, totalPages)

  const goToPage = React.useCallback(
    (page: number) => {
      const href = buildHref(pathname, new URLSearchParams(searchParams.toString()), {
        [pageParam]: String(page),
      })
      router.push(href)
    },
    [pathname, router, searchParams, pageParam],
  )

  if (totalItems <= 0) return null

  const pagesToShow = (() => {
    const pages = new Set<number>()
    pages.add(1)
    pages.add(totalPages)
    pages.add(currentPage)
    pages.add(currentPage - 1)
    pages.add(currentPage + 1)
    return Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b)
  })()

  return (
    <Pagination className={className}>
      <PaginationSection>
        <PaginationList>
          <PaginationFirst
            href={buildHref(pathname, new URLSearchParams(searchParams.toString()), { [pageParam]: "1" })}
            onPress={() => goToPage(1)}
            isDisabled={currentPage === 1}
          />
          <PaginationPrevious
            href={buildHref(pathname, new URLSearchParams(searchParams.toString()), {
              [pageParam]: String(Math.max(1, currentPage - 1)),
            })}
            onPress={() => goToPage(Math.max(1, currentPage - 1))}
            isDisabled={currentPage === 1}
          />

          {pagesToShow.map((p, idx) => {
            const prev = pagesToShow[idx - 1]
            const gap = prev && p - prev > 1

            return (
              <React.Fragment key={p}>
                {gap && <PaginationGap />}
                <PaginationItem
                  href={buildHref(pathname, new URLSearchParams(searchParams.toString()), { [pageParam]: String(p) })}
                  isCurrent={p === currentPage}
                  onPress={() => goToPage(p)}
                >
                  {p}
                </PaginationItem>
              </React.Fragment>
            )
          })}

          <PaginationNext
            href={buildHref(pathname, new URLSearchParams(searchParams.toString()), {
              [pageParam]: String(Math.min(totalPages, currentPage + 1)),
            })}
            onPress={() => goToPage(Math.min(totalPages, currentPage + 1))}
            isDisabled={currentPage === totalPages}
          />
          <PaginationLast
            href={buildHref(pathname, new URLSearchParams(searchParams.toString()), {
              [pageParam]: String(totalPages),
            })}
            onPress={() => goToPage(totalPages)}
            isDisabled={currentPage === totalPages}
          />
        </PaginationList>
      </PaginationSection>
    </Pagination>
  )
}
