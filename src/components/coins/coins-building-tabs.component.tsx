"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import { Avatar } from "@/components/ui/avatar"
import { authClient } from "@/lib/auth-client"
import type { ActionResponseEntity } from "@/types/action-response.entity"
import type { Building } from "@/types/auth-types.entity"

import { CoinsTab, CoinsTabs, CoinsTabsList } from "./coins-tabs.component"

const STORAGE_KEY = "coins.selectedBuildingId"

type SessionShape = {
  data?: {
    session?: {
      buildings?: Building[]
      selectedBuilding?: Building | null
    } | null
  } | null
}

function getInitials(name?: string | null) {
  if (!name) return ""
  const parts = name.trim().split(/\s+/g).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return (first + second).toUpperCase()
}

export default function CoinsBuildingTabs({
  onSelectedIdChange,
}: {
  onSelectedIdChange?: (buildingId: string) => void
}) {
  const router = useRouter()
  const { useSession } = authClient

  const sessionResult = useSession() as unknown as SessionShape
  const buildings = sessionResult?.data?.session?.buildings ?? []
  const sessionSelectedId = sessionResult?.data?.session?.selectedBuilding?.id

  const [selectedId, setSelectedId] = React.useState<string>("")

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && buildings.some((b) => String(b.id) === stored)) {
      setSelectedId(stored)
      onSelectedIdChange?.(stored)
      return
    }

    if (typeof sessionSelectedId === "number") {
      const id = String(sessionSelectedId)
      setSelectedId(id)
      onSelectedIdChange?.(id)
      return
    }

    if (buildings.length > 0) {
      const id = String(buildings[0].id)
      setSelectedId(id)
      onSelectedIdChange?.(id)
    }
  }, [buildings, sessionSelectedId, onSelectedIdChange])

  if (!buildings || buildings.length === 0) return null

  return (
    <CoinsTabs
      selectedKey={selectedId}
      onSelectionChange={async (key) => {
        const nextId = String(key)
        setSelectedId(nextId)
        onSelectedIdChange?.(nextId)

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, nextId)
        }

        try {
          const res = await authClient.$fetch<ActionResponseEntity<null>>(
            "/session/set-selected-building",
            {
              method: "POST",
              body: { buildingId: nextId },
            },
          )

          if (!res.data?.success) {
            console.error(res.data?.message ?? "No se pudo actualizar selectedBuilding")
          } else {
            authClient.$store?.notify?.("$sessionSignal")
          }
        } catch (err) {
          console.error(err)
        }

        router.refresh()
      }}
    >
      <CoinsTabsList aria-label="Buildings" items={buildings}>
        {(b) => (
          <CoinsTab id={String(b.id)}>
            <span className="flex items-center gap-2">
              <Avatar
                size="sm"
                src={b.urlImage ?? null}
                alt={b.name}
                initials={getInitials(b.name)}
                isSquare
              />
              <span className="max-w-48 truncate sm:max-w-56">{b.name}</span>
            </span>
          </CoinsTab>
        )}
      </CoinsTabsList>
    </CoinsTabs>
  )
}
