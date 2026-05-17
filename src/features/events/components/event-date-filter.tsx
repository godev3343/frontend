// src/features/events/components/event-date-filter.tsx
"use client";

import { endOfDay, endOfMonth, endOfWeek, startOfDay } from "date-fns";
import { useMemo } from "react";

import { type DateRange } from "@/features/events/query-keys";
import { cn } from "@/lib/utils";

type Preset = "today" | "week" | "month" | "all";

interface Props {
  value: Preset;
  onChange: (preset: Preset, range: DateRange) => void;
}

export function presetToRange(preset: Preset, now: Date = new Date()): DateRange {
  switch (preset) {
    case "today":
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    case "week":
      return {
        from: startOfDay(now).toISOString(),
        to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    case "month":
      return {
        from: startOfDay(now).toISOString(),
        to: endOfMonth(now).toISOString(),
      };
    case "all":
      return null;
  }
}

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "Сегодня" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "all", label: "Все" },
];

export function EventDateFilter({ value, onChange }: Props) {
  const buttons = useMemo(() => PRESETS, []);

  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {buttons.map((p) => {
        const isActive = p.value === value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value, presetToRange(p.value))}
            // Стиль идентичен vibe-filter-bar'у: pill, активный = bg-primary,
            // неактивный = bg-secondary/60. Единый паттерн toggle-чипа.
            // (См. долг A5 в TODO — выносить в общий ToggleChip; пока inline.)
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/60 text-foreground border-border hover:bg-secondary",
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

export type { Preset as DateFilterPreset };