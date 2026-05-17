// src/components/brand/status-badge.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { Compass, Crown, Footprints, MapPinned, Sparkle } from "lucide-react";

import type { StatusCode, UserStatus } from "@/features/points/status-schema";
import { cn } from "@/lib/utils";

type Visual = {
  icon: LucideIcon;
  /**
   * Tailwind-классы цвета/фона. Используем существующую палитру из design.md
   * (purple/pink/orange/cyan/gray) — не добавляем новых токенов.
   */
  className: string;
};

const STATUS_VISUALS: Record<StatusCode, Visual> = {
  guest:     { icon: Footprints, className: "bg-gray-500/15 text-gray-300 ring-1 ring-inset ring-gray-500/30" },
  explorer:  { icon: Compass,    className: "bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-500/30" },
  navigator: { icon: MapPinned, className: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30" },
  insider:   { icon: Sparkle,    className: "bg-pink-500/20 text-pink-300 ring-1 ring-inset ring-pink-500/30" },
  legend: { icon: Crown, className: "bg-primary text-primary-foreground shadow-glow-accent" },
};

type StatusBadgeProps = {
  status: UserStatus;
  size?: "sm" | "md";
  /** Скрыть label, оставить только иконку (компактные места). */
  iconOnly?: boolean;
  className?: string;
};

export function StatusBadge({
  status,
  size = "md",
  iconOnly = false,
  className,
}: StatusBadgeProps) {
  const visual = STATUS_VISUALS[status.code];
  const Icon = visual.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        size === "sm"
          ? "h-6 px-2 text-xs [&_svg]:size-3"
          : "h-7 px-3 text-sm [&_svg]:size-3.5",
        iconOnly && (size === "sm" ? "w-6 justify-center px-0" : "w-7 justify-center px-0"),
        visual.className,
        className,
      )}
      aria-label={`Статус: ${status.name}`}
      title={status.name}
    >
      <Icon strokeWidth={2.5} />
      {!iconOnly && <span>{status.name}</span>}
    </span>
  );
}