"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useLoading } from "@/context/loading.context"

export function GlobalLoader() {
  const { useSession } = authClient
  const sessionQuery = useSession()
  const { setLoading, isAnyLoading } = useLoading()
  const [isVisible, setIsVisible] = useState(true)

  const isSessionLoading = Boolean(
    (sessionQuery as any)?.isPending ?? (sessionQuery as any)?.isLoading
  )

  // Sincronizar el estado de la sesión con el contexto de loading
  useEffect(() => {
    setLoading("global", isSessionLoading)
  }, [isSessionLoading, setLoading])

  const isLoading = isAnyLoading()

  useEffect(() => {
    if (!isLoading) {
      // Dar un pequeño delay antes de ocultar para una transición suave
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [isLoading])

  if (!isVisible && !isLoading) return null

  return (
    <>
      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .loading-bar-animate {
          animation: loading-bar 1.2s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute inset-x-0 -bottom-1 h-1 overflow-hidden z-50">
        <div
          className={`h-full w-full bg-primary ${isLoading ? "loading-bar-animate" : ""}`}
          style={{
            opacity: isLoading ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </div>
    </>
  )
}
