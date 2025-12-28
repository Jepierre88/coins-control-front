import React, { useRef, useState } from "react";

interface CoinsRadialHoldButtonProps {
  duration?: number; // ms to complete the progress
  size?: number; // px
  strokeWidth?: number; // px
  onComplete: () => void;
  children?: React.ReactNode;
  className?: string;
  color?: string;
  bgColor?: string;
  label?: string;
}

export const CoinsRadialHoldButton: React.FC<CoinsRadialHoldButtonProps> = ({
  duration = 1200,
  size = 64,
  strokeWidth = 6,
  onComplete,
  children,
  className = "",
  color = "#22c55e",
  bgColor = "#f3f4f6",
  label = "Abrir puerta",
}) => {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const startHold = () => {
    setHolding(true);
    startTimeRef.current = Date.now();
    setProgress(0);
    animateProgress();
  };

  const animateProgress = () => {
    const tick = () => {
      if (!holding) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);
      if (pct < 1) {
        timeoutRef.current = setTimeout(tick, 16);
      } else {
        setHolding(false);
        setProgress(1);
        onComplete();
      }
    };
    tick();
  };

  const cancelHold = () => {
    setHolding(false);
    setProgress(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <button
      type="button"
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size, background: "none", border: "none", padding: 0 }}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      aria-label={label}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: holding ? undefined : "stroke-dashoffset 0.2s" }}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {children ?? (
          <span className="text-xs font-semibold text-gray-700" style={{ userSelect: "none" }}>{label}</span>
        )}
      </span>
    </button>
  );
};

export default CoinsRadialHoldButton;
