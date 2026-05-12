// src/features/events/components/event-card.tsx
"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { EventMarker } from "@/features/events/schemas";
import { VIBE_COLORS } from "@/features/map/lib/vibe-colors";

type Props = { event: EventMarker };

export function EventCard({ event }: Props) {
  const startDate = new Date(event.starts_at);
  const dateLabel = format(startDate, "d MMMM, HH:mm", { locale: ru });
  const placeLabel = event.place?.name ?? "Локация в описании";
  const attending = event.attendees_count.going;

  return (
    <Link
      href={`/events/${event.id}`}
      className="border-border bg-card group/event flex flex-col overflow-hidden rounded-2xl border transition-colors hover:border-purple-500/60"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-800">
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover transition-transform duration-300 group-hover/event:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-600">
            <Calendar className="size-12" />
          </div>
        )}
        {event.price && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
            {event.price}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          {event.title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {event.vibes.slice(0, 3).map((v) => {
            const c = VIBE_COLORS[v];
            return (
              <span
                key={v}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-900"
                style={{ backgroundColor: c.hex }}
              >
                {c.label}
              </span>
            );
          })}
        </div>

        <div className="text-muted-foreground flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{placeLabel}</span>
          </div>
          {attending > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 shrink-0" />
              <span>{attending} идут</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
