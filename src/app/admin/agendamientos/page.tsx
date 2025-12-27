import type { Metadata } from "next"
import AgendamientosView from "./view"

export const metadata: Metadata = {
  title: "Agendamientos",
}

export default function Page() {
  return <AgendamientosView />
}
