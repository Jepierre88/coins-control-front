import type { Metadata } from "next"
import { Suspense } from "react"
import AgendamientosView from "./view"
import CoinsLoader from "@/components/coins/coins-loader.component"

export const metadata: Metadata = {
  title: "Agendamientos",
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><CoinsLoader/></div>}>
      <AgendamientosView key={Date.now()}/>
    </Suspense>
  )
}
