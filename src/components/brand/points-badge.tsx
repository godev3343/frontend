// src/components/brand/points-badge.tsx
"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type PointsBadgeProps = {
  points: number;
  variant?: "soft" | "gradient";
  size?: "sm" | "md";
  /**
   * Если true — на увеличение `points` запускается короткая pulse-анимация.
   * Используем где компонент персистентный (bottom-nav, profile header),
   * чтобы дать визуальный фидбек на начисление.
   */
  animateChange?: boolean;
  className?: string;
};

function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}

const KEYFRAMES_ID = "points-badge-keyframes";
const KEYFRAMES_CSS = `
@keyframes points-badge-pulse {
  0%   { transform: scale(1);    }
  40%  { transform: scale(1.18); }
  100% { transform: scale(1);    }
}
`;

/**
 * Инжектим @keyframes один раз на страницу. Не хотим лезть в globals.css
 * или tailwind config ради одного эффекта; framer-motion — оверкилл
 * на 30KB ради 600мс scale-анимации.
 * SSR-safe: гард по typeof document.
 */
function ensureKeyframes(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const el = document.createElement("style");
  el.id = KEYFRAMES_ID;
  el.textContent = KEYFRAMES_CSS;
  document.head.appendChild(el);
}

export function PointsBadge({
  points,
  variant = "soft",
  size = "md",
  animateChange = false,
  className,
}: PointsBadgeProps) {
  const isGradient = variant === "gradient";
  const [pulse, setPulse] = useState(false);
  const prev = useRef(points);

  useEffect(() => {
    if (animateChange) ensureKeyframes();
  }, [animateChange]);

  useEffect(() => {
    if (!animateChange) {
      prev.current = points;
      return;
    }
    if (points > prev.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      prev.current = points;
      return () => clearTimeout(t);
    }
    prev.current = points;
  }, [points, animateChange]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        size === "sm"
          ? "h-6 px-2 text-xs [&_svg]:size-3"
          : "h-7 px-3 text-sm [&_svg]:size-3.5",
        isGradient
          ? "bg-brand-gradient shadow-glow-purple text-white"
          : "bg-purple-500/20 text-purple-300",
        className,
      )}
      style={
        pulse ? { animation: "points-badge-pulse 600ms ease-out" } : undefined
      }
      aria-label={`${points} поинтов`}
    >
      <Sparkles strokeWidth={2.5} />
      {formatPoints(points)}
    </span>
  );
}
