"use client"

import * as React from "react"

export type CoinsLoaderProps = {
  message?: React.ReactNode
  className?: string
}

export default function CoinsLoader({ message, className }: CoinsLoaderProps) {
  return (
    <div className={className ?? "flex flex-col items-center justify-center p-16 text-center"}>
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <p className="text-sm text-muted-fg">
        {message ?? "Cargando datos..."}
      </p>
    </div>
  )
}
