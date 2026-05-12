// src/app/(app)/events/page.tsx
"use client";

import { useState } from "react";

import {
  type DateFilterPreset,
  EventDateFilter,
  presetToRange,
} from "@/features/events/components/event-date-filter";
import { EventsList } from "@/features/events/components/events-list";
import type { DateRange } from "@/features/events/query-keys";
import { useVibeFilter } from "@/features/map/hooks/use-vibe-filter";

/**
 * Афиша. Vibe-фильтр шарится с картой через URL `?vibes=`.
 * Date-фильтр локальный — не пушим в URL, чтобы не плодить
 * шесть query-параметров; пресет дешёвый, переключение мгновенное.
 */
export default function EventsPage() {
  const { selected: vibes } = useVibeFilter();
  const [preset, setPreset] = useState<DateFilterPreset>("week");
  const [date, setDate] = useState<DateRange>(() => presetToRange("week"));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 pb-24">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Афиша</h1>
        <EventDateFilter
          value={preset}
          onChange={(p, range) => {
            setPreset(p);
            setDate(range);
          }}
        />
      </header>
      <EventsList vibes={vibes} date={date} />
    </div>
  );
}
