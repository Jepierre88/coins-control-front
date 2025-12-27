"use client"

import * as React from "react"

import CoinsBuildingTabs from "@/components/coins/coins-building-tabs.component"
import CoinsBadge from "@/components/coins/coins-badge.component"
import CoinsButton from "@/components/coins/coins-button.component"
import CoinsCard, {
  CoinsCardContent,
  CoinsCardDescription,
  CoinsCardFooter,
  CoinsCardHeader,
  CoinsCardTitle,
} from "@/components/coins/coins-card.component"
import { Avatar } from "@/components/ui/avatar"
import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import type { Building } from "@/types/auth-types.entity"

function getInitials(name?: string | null) {
  if (!name) return ""
  const parts = name.trim().split(/\s+/g).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return (first + second).toUpperCase()
}

function mask(value?: string | null) {
  if (!value) return ""
  if (value.length <= 4) return "••••"
  return `${value.slice(0, 2)}••••${value.slice(-2)}`
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1">
      <div className="text-muted-fg text-sm/6">{label}</div>
      <div className="text-sm/6">{value ?? <span className="text-muted-fg">—</span>}</div>
    </div>
  )
}

function SelectedBuildingHero({ building }: { building: Building }) {
  return (
    <CoinsCard>
      <CoinsCardHeader>
        <div className="flex items-center gap-4">
          <Avatar
            size="3xl"
            src={building.urlImage ?? null}
            alt={building.name}
            initials={getInitials(building.name)}
            isSquare
          />
          <div className="min-w-0">
            <CoinsCardTitle className="truncate">{building.name}</CoinsCardTitle>
            <CoinsCardDescription className="mt-1">
              {building.address || building.description ? (
                <span className="line-clamp-2">{building.address || building.description}</span>
              ) : (
                "Sin dirección/descrición"
              )}
            </CoinsCardDescription>
          </div>
        </div>
      </CoinsCardHeader>
    </CoinsCard>
  )
}

export default function AdminDashboard() {
  const { useSession } = authClient
  const sessionQuery = useSession()

  const data = (sessionQuery as any)?.data
  const session = (data?.session ?? data) as any
  const isLoading = Boolean((sessionQuery as any)?.isPending ?? (sessionQuery as any)?.isLoading)
  const error = (sessionQuery as any)?.error

  const buildings: Building[] = session?.buildings ?? []
  const sessionSelectedBuilding: Building | null = session?.selectedBuilding ?? null

  const [activeBuildingId, setActiveBuildingId] = React.useState<string>("")

  const activeBuildingFromList = React.useMemo(() => {
    if (!activeBuildingId) return null
    return buildings.find((b) => String(b.id) === activeBuildingId) ?? null
  }, [activeBuildingId, buildings])

  const selectedBuilding =
    sessionSelectedBuilding &&
    (!activeBuildingId || String(sessionSelectedBuilding.id) === activeBuildingId)
      ? sessionSelectedBuilding
      : activeBuildingFromList

  return (
    <Container className="py-8" constrained>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading level={1}>Admin</Heading>
          <div className="text-muted-fg text-sm/6">
            {isLoading
              ? "Cargando sesión…"
              : selectedBuilding
                ? "Dashboard del building seleccionado"
                : "Selecciona un building para ver su dashboard"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CoinsBuildingTabs onSelectedIdChange={setActiveBuildingId} />
        </div>
      </div>

      <Separator className="my-6" />

      {error ? (
        <CoinsCard>
          <CoinsCardHeader
            title="No se pudo cargar la sesión"
            description="Revisa tu conexión o vuelve a iniciar sesión."
          />
          <CoinsCardContent>
            <pre className="overflow-auto rounded-md bg-muted/40 p-4 text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          </CoinsCardContent>
        </CoinsCard>
      ) : null}

      {!error && !isLoading && !selectedBuilding ? (
        <CoinsCard>
          <CoinsCardHeader title="Sin building seleccionado" description="Elige uno para ver información y estado." />
          <CoinsCardContent className="space-y-4">
            <div className="text-sm/6">
              Buildings disponibles: <span className="font-medium">{buildings.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {buildings.map((b) => (
                <div key={b.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="lg"
                      src={b.urlImage ?? null}
                      alt={b.name}
                      initials={getInitials(b.name)}
                      isSquare
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-sm/6">{b.name}</div>
                      <div className="truncate text-muted-fg text-xs/5">{b.address ?? "—"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CoinsCardContent>
        </CoinsCard>
      ) : null}

      {!error && selectedBuilding ? (
        <div className="space-y-6">
          <SelectedBuildingHero building={selectedBuilding} />

          <div className="grid gap-6 lg:grid-cols-3">
            <CoinsCard className="lg:col-span-2">
              <CoinsCardHeader title="Detalles" description="Información general del building" />
              <CoinsCardContent className="space-y-3">
                <InfoRow
                  label="Estado"
                  value={
                    <CoinsBadge intent={selectedBuilding.state ? "success" : "danger"}>
                      {selectedBuilding.state ? "Activo" : "Inactivo"}
                    </CoinsBadge>
                  }
                />
                <InfoRow label="Dirección" value={selectedBuilding.address || "—"} />
                <InfoRow label="Descripción" value={selectedBuilding.description || "—"} />
                <InfoRow label="Holding" value={selectedBuilding.holdingId || "—"} />
                <InfoRow label="Stays" value={selectedBuilding.staysId || "—"} />
              </CoinsCardContent>
              <CoinsCardFooter>
                <div className="text-muted-fg text-xs/5">
                  Tip: si cambias el building arriba, se actualiza la sesión.
                </div>
              </CoinsCardFooter>
            </CoinsCard>

            <CoinsCard>
              <CoinsCardHeader title="Conexión" description="Datos no sensibles" />
              <CoinsCardContent className="space-y-3">
                <InfoRow label="Client ID" value={selectedBuilding.clientId || "—"} />
                <InfoRow label="Usuario" value={selectedBuilding.username ? mask(selectedBuilding.username) : "—"} />
                <InfoRow label="Client Secret" value={selectedBuilding.clientSecret ? mask(selectedBuilding.clientSecret) : "—"} />
              </CoinsCardContent>
              <CoinsCardFooter>
                <CoinsButton variant="outline" type="button" onClick={() => (window.location.href = "/")}
                  >Ir al inicio</CoinsButton
                >
              </CoinsCardFooter>
            </CoinsCard>
          </div>
        </div>
      ) : null}
    </Container>
  )
}
