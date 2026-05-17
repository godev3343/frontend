// src/features/events/components/event-date-filter.tsx
"use client";

import { endOfDay, endOfMonth, endOfWeek, startOfDay } from "date-fns";
import { useMemo } from "react";

import { ToggleChip } from "@/components/ui/toggle-chip";
import { type DateRange } from "@/features/events/query-keys";

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
      {buttons.map((p) => (
        <ToggleChip
          key={p.value}
          active={p.value === value}
          onClick={() => onChange(p.value, presetToRange(p.value))}
        >
          {p.label}
        </ToggleChip>
      ))}
    </div>
  );
}

export type { Preset as DateFilterPreset };