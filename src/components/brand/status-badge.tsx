// src/components/brand/status-badge.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { Compass, Crown, Footprints, MapPinned, Sparkle } from "lucide-react";

import type { StatusCode, UserStatus } from "@/features/points/status-schema";
import { cn } from "@/lib/utils";

/**
 * Статусы — пять уровней по карме. Цвета:
 *   - guest → muted (приглушённый, новичок)
 *   - explorer → cyan (свежий, исследует, hue=195, см. globals.css)
 *   - navigator → primary lime (середняк, знает город)
 *   - insider → amber-gold (узнаёт инсайдерские места, hue=50)
 *   - legend → solid primary с glow (топ, как CTA)
 *
 * Раньше explorer/insider были tailwind-hex (cyan-500/pink-500) —
 * выпадали из OKLCH-палитры. Заменены на токены в PR5-A7.
 */
type Visual = {
  icon: LucideIcon;
  className: string;
  /** Inline-цвета, если не покрывается tailwind-токенами. */
  style?: React.CSSProperties;
};

const STATUS_VISUALS: Record<StatusCode, Visual> = {
  guest: {
    icon: Footprints,
    className: "bg-muted/40 text-muted-foreground ring-1 ring-inset ring-border",
  },
  explorer: {
    icon: Compass,
    className: "ring-1 ring-inset",
    style: {
      backgroundColor: "color-mix(in oklab, var(--color-status-explorer) 18%, transparent)",
      color: "var(--color-status-explorer)",
      // Через CSS-переменную задаём цвет рамки — tailwind-класс `ring` берёт его из `--tw-ring-color`,
      // но мы используем box-shadow напрямую через ring-inset, поэтому проще через style.
      boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--color-status-explorer) 30%, transparent)",
    },
  },
  navigator: {
    icon: MapPinned,
    className: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30",
  },
  insider: {
    icon: Sparkle,
    className: "ring-1 ring-inset",
    style: {
      backgroundColor: "color-mix(in oklab, var(--color-status-insider) 20%, transparent)",
      color: "var(--color-status-insider)",
      boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--color-status-insider) 30%, transparent)",
    },
  },
  legend: {
    icon: Crown,
    className: "bg-primary text-primary-foreground shadow-glow-accent",
  },
};

type StatusBadgeProps = {
  status: UserStatus;
  size?: "sm" | "md";
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
      style={visual.style}
      aria-label={`Статус: ${status.name}`}
      title={status.name}
    >
      <Icon strokeWidth={2.5} />
      {!iconOnly && <span>{status.name}</span>}
    </span>
  );
}