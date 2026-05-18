// src/components/brand/vibe-selector.tsx
"use client";

import { Check } from "lucide-react";

import { VIBE_TAGS, type VibeTag } from "@/components/brand/vibe-badge";
import { VIBE_COLORS } from "@/features/map/lib/vibe-colors";
import { cn } from "@/lib/utils";

type Props = {
  value: readonly VibeTag[];
  onChange: (next: VibeTag[]) => void;
  /**
   * Максимум вайбов. Бэк жёстко ограничивает 5 в validate_preferred_vibes
   * (apps/social/serializers/preferences_validation.py).
   */
  max?: number;
  /** "md" — для онбординга (крупнее, легче тыкать), "sm" — для редактора профиля. */
  size?: "sm" | "md";
  disabled?: boolean;
};

/**
 * Сетка из 7 кликабельных vibe-чипов с мульти-выбором (toggle).
 *
 * Источник данных:
 *   - VIBE_TAGS (vibe-badge.tsx) — список и тип
 *   - VIBE_COLORS (map/lib) — цвета и лейблы (синхронны с маркерами на карте)
 *
 * Активный чип: подкрашен своим vibe-цветом + чек-иконка.
 * Неактивный: surface + border, текст --text-dim.
 *
 * При достижении max — неактивные чипы disabled (визуальный фидбек
 * "больше нельзя"). Активные остаются кликабельными для снятия.
 */
export function VibeSelector({
  value,
  onChange,
  max = 5,
  size = "md",
  disabled = false,
}: Props) {
  const selected = new Set(value);
  const atLimit = selected.size >= max;

  function toggle(v: VibeTag) {
    if (disabled) return;
    if (selected.has(v)) {
      onChange(value.filter((x) => x !== v));
    } else if (!atLimit) {
      onChange([...value, v]);
    }
  }

  return (
    <div
      role="group"
      aria-label="Вайбы"
      className={cn(
        "grid gap-2",
        // 2 колонки на мобиле, 3 на десктопе — 7 элементов укладываются
        // в 4 ряда (2+2+2+1) на мобиле и 3 ряда (3+3+1) на десктопе.
        size === "md" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {VIBE_TAGS.map((v) => {
        const meta = VIBE_COLORS[v];
        const isActive = selected.has(v);
        const isDisabled = disabled || (!isActive && atLimit);

        return (
          <button
            key={v}
            type="button"
            aria-pressed={isActive}
            disabled={isDisabled}
            onClick={() => toggle(v)}
            className={cn(
              "group relative flex items-center gap-2 rounded-full border transition-all",
              size === "md" ? "px-4 py-3 text-sm" : "px-3 py-2 text-xs",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isDisabled && !isActive && "cursor-not-allowed opacity-40",
              !isDisabled && "hover:brightness-110",
            )}
            style={{
              backgroundColor: isActive
                ? `color-mix(in oklab, ${meta.value} 22%, transparent)`
                : "var(--surface)",
              borderColor: isActive
                ? `color-mix(in oklab, ${meta.value} 60%, transparent)`
                : "var(--border)",
              color: isActive ? meta.value : "var(--text-dim)",
            }}
          >
            {/* Цветная точка слева — vibe полной насыщенности. Помогает
                идентифицировать вайб даже когда чип неактивный (приглушённый). */}
            <span
              className={cn(
                "shrink-0 rounded-full",
                size === "md" ? "h-2.5 w-2.5" : "h-2 w-2",
              )}
              style={{ backgroundColor: meta.value }}
              aria-hidden
            />
            <span className="font-medium">{meta.label}</span>
            {isActive && (
              <Check
                className={cn(
                  "ml-auto shrink-0",
                  size === "md" ? "size-4" : "size-3",
                )}
                strokeWidth={3}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}