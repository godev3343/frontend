// src/components/ui/toggle-chip.tsx
"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";

import { cn } from "@/lib/utils";

type Size = "sm" | "md";

interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  active: boolean;
  /**
   * Опциональный цвет для active-состояния (vibe-фильтр на карте использует
   * vibe-цвет вместо primary-лайма). Если не передан — active = bg-primary.
   * Принимает любой валидный CSS-цвет, в т.ч. `oklch(...)`.
   */
  activeColor?: string;
  size?: Size;
}

/**
 * Унифицированный pill-чип для toggle-фильтров.
 *
 * До PR5-A5 этот стиль дублировался в трёх местах:
 *   - vibe-filter-bar (вайбы + кнопка "События")
 *   - event-date-filter (today/week/month/all)
 * Теперь все три должны использовать ToggleChip.
 *
 * Особенность: vibe-фильтр НЕ использует primary-цвет для active — он подсвечивается
 * vibe-color того фильтра, который активен. Поэтому `activeColor` опциональный.
 */
export function ToggleChip({
  active,
  activeColor,
  size = "md",
  className,
  children,
  ...rest
}: ToggleChipProps) {
  const inlineStyle: CSSProperties | undefined =
    active && activeColor
      ? { backgroundColor: activeColor, borderColor: activeColor, color: "var(--background)" }
      : undefined;

  return (
    <button
      type="button"
      className={cn(
        "shrink-0 rounded-full border font-medium transition-all duration-200",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-1.5 text-sm",
        active
          ? activeColor
            ? "border-transparent"
            : "bg-primary text-primary-foreground border-primary"
          : "bg-secondary/60 text-foreground border-border hover:bg-secondary",
        className,
      )}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </button>
  );
}