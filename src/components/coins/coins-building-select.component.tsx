"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import CoinsSelect from "@/components/coins/coins-select.component"
import { authClient } from "@/lib/auth-client"
import type { ActionResponseEntity } from "@/types/action-response.entity"
import type { Building } from "@/types/auth-types.entity"

const STORAGE_KEY = "coins.selectedBuildingId"

type SessionShape = {
  data?: {
    session?: {
      buildings?: Building[]
      selectedBuilding?: Building | null
    } | null
  } | null
}

function toOptions(buildings: Building[]) {
  return buildings.map((b) => ({ value: String(b.id), label: b.name }))
}

export default function CoinsBuildingSelect() {
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
      return
    }

    if (typeof sessionSelectedId === "number") {
      setSelectedId(String(sessionSelectedId))
      return
    }

    if (buildings.length > 0) {
      setSelectedId(String(buildings[0].id))
    }
  }, [buildings, sessionSelectedId])

  if (!buildings || buildings.length === 0) return null

  return (
    <div className="min-w-44">
      <CoinsSelect
        aria-label="Seleccionar edificio"
        value={selectedId}
        onChange={async (e) => {
          const nextId = e.target.value
          setSelectedId(nextId)

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
        options={toOptions(buildings)}
      />
    </div>
  )
}
