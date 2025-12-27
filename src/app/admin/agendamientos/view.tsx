"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "use-debounce"

import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import CoinsButton from "@/components/coins/coins-button.component"
import CoinsBadge, { type CoinsBadgeIntent } from "@/components/coins/coins-badge.component"
import CoinsDatePicker from "@/components/coins/coins-date-picker.component"
import CoinsCard, { CoinsCardContent, CoinsCardHeader } from "@/components/coins/coins-card.component"
import CoinsSelect from "@/components/coins/coins-select.component"
import { CoinsTable, type CoinsTableColumn } from "@/components/coins/coins-table.component"
import { CoinsPagination } from "@/components/coins/coins-pagination.component"
import GenerateSchedulingDialog from "./components/generate-scheduling-dialog.component"
import { authClient } from "@/lib/auth-client"
import { UseDialogContext } from "@/context/dialog.context"
import { useLoading } from "@/context/loading.context"
import {
  getApartmentsByBuildingId,
  getSchedulingsPage,
  type ApartmentListItem,
  type SchedulingListItem,
} from "@/datasource/coins-control.datasource"
import { PlusIcon } from "lucide-react"

function buildHref(pathname: string, current: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(current)
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k)
    else next.set(k, v)
  }
  const qs = next.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

function parseIntParam(value: string | null, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  const i = Math.floor(n)
  return i > 0 ? i : fallback
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function toDateOnly(value: Date) {
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`
}

function currentMonthDateRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { startDate: toDateOnly(start), endDate: toDateOnly(end) }
}

function stateToIntent(state?: string | null): CoinsBadgeIntent {
  switch ((state ?? "").toLowerCase()) {
    case "active":
      return "success"
    case "pendingtoactivate":
      return "warning"
    case "created":
      return "info"
    case "canceled":
      return "danger"
    default:
      return "muted"
  }
}

function stateToEsLabel(state?: string | null) {
  const key = (state ?? "").toLowerCase()
  switch (key) {
    case "active":
      return "Activo"
    case "pendingtoactivate":
      return "Pendiente"
    case "created":
      return "Creado"
    case "canceled":
    case "cancelled":
      return "Cancelado"
    default:
      return state?.trim() ? state : "—"
  }
}

export default function AgendamientosView() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openDialog } = UseDialogContext()

  const defaultMonthRange = React.useMemo(() => currentMonthDateRange(), [])

  const { useSession } = authClient
  const sessionQuery = useSession()
  const data = (sessionQuery as any)?.data
  const session = (data?.session ?? data) as any
  const isSessionLoading = Boolean((sessionQuery as any)?.isPending ?? (sessionQuery as any)?.isLoading)

  const selectedBuildingId = session?.selectedBuilding?.id
  const externalToken = session?.externalToken as string | undefined
  const createdBy = (session?.userId ?? session?.user?.id) as string | undefined

  const page = parseIntParam(searchParams.get("page"), 1)
  const pageSize = parseIntParam(searchParams.get("pageSize"), 10)

  const apartmentId = searchParams.get("apartmentId") ?? ""
  const startDate = searchParams.get("startDate") ?? defaultMonthRange.startDate
  const endDate = searchParams.get("endDate") ?? defaultMonthRange.endDate
  const state = searchParams.get("state") ?? ""

  const [apartments, setApartments] = React.useState<ApartmentListItem[]>([])
  const [items, setItems] = React.useState<SchedulingListItem[]>([])
  const [total, setTotal] = React.useState(0)

  const [error, setError] = React.useState<string | null>(null)
    const { isLoading: isLoadingContext, setLoading: setLoadingContext } = useLoading()

  const [draftApartmentId, setDraftApartmentId] = React.useState(apartmentId)
  const [draftStartDate, setDraftStartDate] = React.useState(startDate)
  const [draftEndDate, setDraftEndDate] = React.useState(endDate)
  const [draftState, setDraftState] = React.useState(state)

  const [debouncedApartmentId] = useDebounce(draftApartmentId, 400)
  const [debouncedStartDate] = useDebounce(draftStartDate, 400)
  const [debouncedEndDate] = useDebounce(draftEndDate, 400)
  const [debouncedState] = useDebounce(draftState, 400)

  React.useEffect(() => {
    setDraftApartmentId(apartmentId)
    setDraftStartDate(startDate)
    setDraftEndDate(endDate)
    setDraftState(state)
  }, [apartmentId, startDate, endDate, state])

  React.useEffect(() => {
    let cancelled = false

    async function loadApartments() {
      if (!selectedBuildingId) return
      const res = await getApartmentsByBuildingId(selectedBuildingId)
      if (cancelled) return
      setApartments(res.success && res.data ? res.data : [])
    }

    loadApartments()

    return () => {
      cancelled = true
    }
  }, [selectedBuildingId])

  React.useEffect(() => {
    let cancelled = false

    async function loadSchedulings() {
      if (!selectedBuildingId) {
        setItems([])
        setTotal(0)
        return
      }

      setLoadingContext('schedulings-table', true)
      setError(null)

      try {
        const res = await getSchedulingsPage({
          buildingId: selectedBuildingId,
          page,
          pageSize,
          apartmentId: apartmentId || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          state: state || undefined,
        })

        if (cancelled) return

        if (!res.success || !res.data) {
          setItems([])
          setTotal(0)
          setError(res.message || "No se pudieron cargar los agendamientos")
          return
        }

        setItems(res.data.items ?? [])
        setTotal(res.data.total ?? 0)
      } catch {
        if (cancelled) return
        setItems([])
        setTotal(0)
        setError("No se pudieron cargar los agendamientos")
      } finally {
        if (cancelled) return
        setLoadingContext('schedulings-table', false)
      }
    }

    loadSchedulings()

    return () => {
      cancelled = true
    }
  }, [selectedBuildingId, page, pageSize, apartmentId, startDate, endDate, state])

  const columns = React.useMemo<Array<CoinsTableColumn<SchedulingListItem>>>(
    () => [
      {
        id: "start",
        header: "Inicio",
        isRowHeader: true,
        cell: (it) => (it.start ? new Date(it.start).toLocaleString() : "—"),
      },
      {
        id: "end",
        header: "Fin",
        cell: (it) => (it.end ? new Date(it.end).toLocaleString() : "—"),
      },
      {
        id: "apartment",
        header: "Apartamento",
        cell: (it) => it.apartment?.name ?? String(it.apartmentId ?? "—"),
      },
      {
        id: "guest",
        header: "Invitado",
        cell: (it) => `${it.name ?? ""} ${it.lastName ?? ""}`.trim() || "—",
      },
      {
        id: "state",
        header: "Estado",
        cell: (it) => {
          return <CoinsBadge intent={stateToIntent(it.state)}>{stateToEsLabel(it.state)}</CoinsBadge>
        },
      },
    ],
    [],
  )

  React.useEffect(() => {
    const currentApartmentId = searchParams.get("apartmentId") ?? ""
    const currentStartDate = searchParams.get("startDate") ?? ""
    const currentEndDate = searchParams.get("endDate") ?? ""
    const currentState = searchParams.get("state") ?? ""

    const nextApartmentId = debouncedApartmentId ?? ""
    const nextStartDate = debouncedStartDate ?? ""
    const nextEndDate = debouncedEndDate ?? ""
    const nextState = debouncedState ?? ""

    const same =
      currentApartmentId === nextApartmentId &&
      currentStartDate === nextStartDate &&
      currentEndDate === nextEndDate &&
      currentState === nextState

    if (same) return

    const href = buildHref(pathname, new URLSearchParams(searchParams.toString()), {
      page: "1",
      apartmentId: nextApartmentId ? nextApartmentId : null,
      startDate: nextStartDate ? nextStartDate : null,
      endDate: nextEndDate ? nextEndDate : null,
      state: nextState ? nextState : null,
    })

    router.replace(href)
  }, [
    debouncedApartmentId,
    debouncedEndDate,
    debouncedStartDate,
    debouncedState,
    pathname,
    router,
    searchParams,
  ])

  const clearFilters = React.useCallback(() => {
    setDraftApartmentId("")
    setDraftStartDate(defaultMonthRange.startDate)
    setDraftEndDate(defaultMonthRange.endDate)
    setDraftState("")

    const href = buildHref(pathname, new URLSearchParams(searchParams.toString()), {
      page: "1",
      apartmentId: null,
      startDate: defaultMonthRange.startDate,
      endDate: defaultMonthRange.endDate,
      state: null,
    })
    router.push(href)
  }, [defaultMonthRange.endDate, defaultMonthRange.startDate, pathname, router, searchParams])

  const openCreateScheduling = React.useCallback(() => {
    if (!selectedBuildingId) return

    openDialog({
      title: "Generar agendamiento",
      description: "Completa los datos del visitante y el intervalo.",
      content: (
        <GenerateSchedulingDialog
          buildingId={selectedBuildingId}
          apartments={apartments}
          externalToken={externalToken}
          createdBy={createdBy}
        />
      ),
    })
  }, [apartments, createdBy, externalToken, openDialog, selectedBuildingId])

  return (
    <Container className="py-8" constrained>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between px-6">
        <div>
          <Heading level={1}>Agendamientos</Heading>
          <div className="text-muted-fg text-sm/6">
            Listado paginado y ordenado por más reciente
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          <CoinsButton
            variant="primary"
            className={"w-full"}
            onClick={openCreateScheduling}
            isDisabled={!selectedBuildingId || isLoadingContext("schedulings-table")}
            startIcon={PlusIcon}
          >
            Generar agendamiento
          </CoinsButton>
        </div>
      </div>

      <Separator className="my-6" />

      <CoinsCard>
        <CoinsCardHeader title="Filtros" description="Filtra por apartamento, fechas y estado." />
        <CoinsCardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <div className="text-sm/6 text-muted-fg">Apartamento</div>
              <CoinsSelect
                value={draftApartmentId}
                onChange={(e) => setDraftApartmentId(e.target.value)}
                options={[
                  { value: "", label: "Todos" },
                  ...apartments.map((a) => ({
                    value: String(a.id ?? ""),
                    label: a.name ?? String(a.id ?? ""),
                  })),
                ]}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm/6 text-muted-fg">Desde</div>
              <CoinsDatePicker value={draftStartDate} onChange={setDraftStartDate} ariaLabel="Desde" />
            </div>

            <div className="space-y-2">
              <div className="text-sm/6 text-muted-fg">Hasta</div>
              <CoinsDatePicker value={draftEndDate} onChange={setDraftEndDate} ariaLabel="Hasta" />
            </div>

            <div className="space-y-2">
              <div className="text-sm/6 text-muted-fg">Estado</div>
              <CoinsSelect
                value={draftState}
                onChange={(e) => setDraftState(e.target.value)}
                options={[
                  { value: "", label: "Todos" },
                  { value: "created", label: "Creado" },
                  { value: "active", label: "Activo" },
                  { value: "pendingToActivate", label: "Pendiente de activar" },
                  { value: "canceled", label: "Cancelado" },
                ]}
              />
            </div>
          </div>
        </CoinsCardContent>
      </CoinsCard>

      <Separator className="my-6" />

      {error ? (
        <CoinsCard>
          <CoinsCardHeader title="No se pudieron cargar los agendamientos" description={error} />
        </CoinsCard>
      ) : null}

      <CoinsCard>
        <CoinsCardHeader
          title="Resultados"
          description={isLoadingContext("schedulings-table") ? "Cargando…" : `${total} agendamientos`}
        />
        <CoinsCardContent>
          <CoinsTable
            ariaLabel="Agendamientos"
            items={items}
            columns={columns}
            loadingKey="schedulings-table"
            emptyState="No hay agendamientos registrados"
            getRowId={(it) => String(it.id ?? `${it.apartmentId ?? ""}-${it.start ?? ""}`)}
          />

          <div className="mt-6">
            <CoinsPagination totalItems={total} defaultPageSize={10} />
          </div>
        </CoinsCardContent>
      </CoinsCard>

      {!selectedBuildingId && !isSessionLoading ? (
        <div className="mt-6 text-sm/6 text-muted-fg">
          Selecciona un edificio para ver sus agendamientos.
        </div>
      ) : null}
    </Container>
  )
}
