"use client"

import { useLoading } from "@/context/loading.context"
import * as React from "react"
import CoinsLoader from "./coins-loader.component"

interface CoinsRadialHoldButtonProps {
  duration?: number // ms
  strokeWidth?: number // px
  onComplete: () => void
  children?: React.ReactNode
  className?: string
  label?: string
  disabled?: boolean
  cancelOnLeave?: boolean
  anchorStrength?: "soft" | "medium" | "strong"
  trackOnlyOnHold?: boolean
  color?: string
  bgColor?: string
    loadingKey?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

type AnchorPreset = {
  ring: string
  shadow: string
  haloOpacityIdle: number
  haloOpacityHold: number
  haloBlur: number
  haloSpread: number
}

function getAnchorPreset(strength: CoinsRadialHoldButtonProps["anchorStrength"]): AnchorPreset {
  switch (strength) {
    case "soft":
      return {
        ring: "ring-1 ring-border/70",
        shadow: "shadow-sm",
        haloOpacityIdle: 0.25,
        haloOpacityHold: 0.45,
        haloBlur: 12,
        haloSpread: 10,
      }
    case "medium":
      return {
        ring: "ring-1 ring-border",
        shadow: "shadow-md",
        haloOpacityIdle: 0.35,
        haloOpacityHold: 0.65,
        haloBlur: 14,
        haloSpread: 14,
      }
    case "strong":
    default:
      return {
        ring: "ring-1 ring-border",
        shadow: "shadow-lg",
        haloOpacityIdle: 0.45,
        haloOpacityHold: 0.9,
        haloBlur: 16,
        haloSpread: 18,
      }
  }
}

/**
 * Hook: contador animado tipo “counter”.
 * - target: number 0..100
 * - devuelve display: number (float), tú lo redondeas
 * - anima con un spring simple (suave, con inercia)
 */
function useAnimatedCounter(target: number, opts?: { stiffness?: number; damping?: number }) {
  const stiffness = opts?.stiffness ?? 0.16
  const damping = opts?.damping ?? 0.78

  const [display, setDisplay] = React.useState(0)

  const rafRef = React.useRef<number | null>(null)
  const valueRef = React.useRef(0)
  const velRef = React.useRef(0)
  const targetRef = React.useRef(target)

  React.useEffect(() => {
    targetRef.current = target
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const step = () => {
      const t = targetRef.current
      const x = valueRef.current
      let v = velRef.current

      // spring: acelera hacia el target
      const force = (t - x) * stiffness
      v = v * damping + force

      const next = x + v

      valueRef.current = next
      velRef.current = v
      setDisplay(next)

      // stop condition (snap)
      if (Math.abs(t - next) < 0.05 && Math.abs(v) < 0.05) {
        valueRef.current = t
        velRef.current = 0
        setDisplay(t)
        rafRef.current = null
        return
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [target, stiffness, damping])

  // Si el target baja de golpe (ej: cancel), resetea rápido sin “rebote” feo
  const hardReset = React.useCallback((v: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    valueRef.current = v
    velRef.current = 0
    setDisplay(v)
    targetRef.current = v
  }, [])

  return { display, hardReset }
}

export default function CoinsRadialHoldButton({
  duration = 1200,
  strokeWidth = 6,
  onComplete,
  children,
  className = "",
  label = "Abrir puerta",
  disabled = false,
  cancelOnLeave = true,
  anchorStrength = "strong",
  trackOnlyOnHold = true,
  loadingKey,
  color,
  bgColor,
}: CoinsRadialHoldButtonProps) {
  const [progress, setProgress] = React.useState(0) // 0..1
  const [holding, setHolding] = React.useState(false)
  const [size, setSize] = React.useState(0)

  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const startRef = React.useRef<number>(0)
  const completedRef = React.useRef(false)

    const { isLoading } = useLoading();

  const fg = color ?? "hsl(var(--primary))"
  const track = bgColor ?? "hsl(var(--border))"

  const anchor = React.useMemo(() => getAnchorPreset(anchorStrength), [anchorStrength])

  // ✅ target del contador = progreso * 100
  const targetPct = Math.round(progress * 100)
  const { display: displayPct, hardReset } = useAnimatedCounter(targetPct)

  // ResizeObserver para ocupar max del parent
  React.useEffect(() => {
    if (!buttonRef.current) return
    const el = buttonRef.current
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect
      setSize(Math.min(rect.width, rect.height))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const safeStroke = Math.max(1, strokeWidth)
  const radius = Math.max(0, (size - safeStroke) / 2)
  const circumference = 2 * Math.PI * radius

  const cleanupRaf = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  React.useEffect(() => {
    return () => cleanupRaf()
  }, [cleanupRaf])

  const stop = React.useCallback(() => {
    cleanupRaf()
    setHolding(false)
    setProgress(0)
    completedRef.current = false
    // ✅ resetea el contador de una (sin rebote)
    hardReset(0)
  }, [cleanupRaf, hardReset])

  const tick = React.useCallback(() => {
    const elapsed = performance.now() - startRef.current
    const pct = Math.min(elapsed / duration, 1)
    setProgress(pct)

    if (pct >= 1) {
      if (!completedRef.current) {
        completedRef.current = true
        setHolding(false)
        setProgress(1)
        onComplete()
      }
      return
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [duration, onComplete])

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)

    completedRef.current = false
    startRef.current = performance.now()

    setHolding(true)
    setProgress(0)
    hardReset(0)

    cleanupRaf()
    rafRef.current = requestAnimationFrame(tick)
  }

  const handlePointerUp = () => {
    if (disabled || progress >= 1) return
    stop()
  }

  const handlePointerLeave = () => {
    if (cancelOnLeave && holding && progress < 1) stop()
  }

  const pctText = `${Math.round(clamp(displayPct, 0, 100))}%`
  const showTrack = !trackOnlyOnHold || holding || progress > 0
  const trackOpacity = holding ? 0.22 : 0.14
  
  const showLoader = loadingKey ? isLoading(loadingKey) : false

const renderCenterContent = () => {
  if (children) {
    if (showLoader) return <CoinsLoader />
    return children
  }

  return (
    <>
      <div
        className="font-semibold tabular-nums leading-none"
        style={{
          fontSize: clamp(size * 0.28, 18, 44),
          transform: holding ? "translateY(-1px)" : "translateY(0px)",
          transition: "transform 180ms ease",
        }}
      >
        {pctText}
      </div>

      <div
        className="mt-2 font-medium text-muted-fg"
        style={{ fontSize: clamp(size * 0.085, 10, 14) }}
      >
        {holding ? "Mantén presionado" : label}
      </div>
    </>
  )
}


  return (
    <div className={["w-full h-full", className].join(" ")}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-label={label}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={stop}
        onPointerLeave={handlePointerLeave}
        className={[
          "relative w-full h-full aspect-square",
          "grid place-items-center rounded-full",
          "bg-card text-fg",
          anchor.ring,
          anchor.shadow,
          "transition",
          "hover:bg-muted/40",
          "active:scale-[0.985]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ].join(" ")}
      >
        {/* Halo / anchor (primary) */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 ${anchor.haloBlur}px ${anchor.haloSpread}px hsl(var(--primary) / ${
              holding ? anchor.haloOpacityHold : anchor.haloOpacityIdle
            })`,
            opacity: disabled ? 0 : 1,
            transition: "box-shadow 220ms ease",
          }}
        />

        {/* SVG rings */}
        <svg width={size} height={size} className="absolute inset-0" aria-hidden>
          {/* Track sutil (para que no parezca “otro donut”) */}
          {showTrack && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={track}
              strokeWidth={safeStroke}
              fill="none"
              opacity={trackOpacity}
            />
          )}

          {/* Progress (primary) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={fg}
            strokeWidth={safeStroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{
              transformOrigin: "50% 50%",
              transform: "rotate(-90deg)",
              transition: holding ? "none" : "stroke-dashoffset 220ms ease",
              filter: holding
                ? "drop-shadow(0 8px 16px rgba(0,0,0,0.18)) drop-shadow(0 0 12px hsl(var(--primary) / 0.35))"
                : "drop-shadow(0 6px 12px rgba(0,0,0,0.14))",
            }}
          />
        </svg>

        {/* Center */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none">
          {renderCenterContent()}
        </div>
      </button>
    </div>
  )
}