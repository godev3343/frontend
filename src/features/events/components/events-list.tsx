// src/features/events/components/events-list.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { useEventsList } from "@/features/events/hooks/use-events-list";
import { type DateRange } from "@/features/events/query-keys";
import type { Vibe } from "@/features/map/schemas";

import { EventCard } from "./event-card";

interface Props {
  vibes: Vibe[];
  date: DateRange;
}

export function EventsList({ vibes, date }: Props) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEventsList(vibes, date);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Не удалось загрузить события
      </p>
    );
  }

  const events = data?.pages.flatMap((p) => p.results) ?? [];

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Событий не найдено. Попробуйте сменить фильтры.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      )}
    </>
  );
}
