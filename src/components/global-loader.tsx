"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

export function GlobalLoader() {
  const { useSession } = authClient
  const sessionQuery = useSession()
  const [isVisible, setIsVisible] = useState(true)

  const isLoading = Boolean(
    (sessionQuery as any)?.isPending ?? (sessionQuery as any)?.isLoading
  )

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
      <div
        className="fixed top-16 left-0 right-0 z-50 h-1 overflow-hidden"
        style={{
          opacity: isLoading ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <div
          className={`h-full w-full bg-primary ${isLoading ? "loading-bar-animate" : ""}`}
        />
      </div>
    </>
  )
}
