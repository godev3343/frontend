// src/features/events/components/event-card.tsx
"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { EventMarker } from "@/features/events/schemas";
import { getFeaturedGradient, VIBE_COLORS } from "@/features/map/lib/vibe-colors";
import { cn } from "@/lib/utils";

type Props = {
  event: EventMarker;
  /**
   * Featured-стиль: двойной radial-gradient vibe-цветов на контент-блоке.
   * Используется для hero-карточки в списке афиши (первая при total ≥ 3).
   */
  featured?: boolean;
};

export function EventCard({ event, featured = false }: Props) {
  const startDate = new Date(event.starts_at);
  const dateLabel = format(startDate, "d MMM · HH:mm", { locale: ru });
  const placeLabel = event.place?.name ?? "Локация в описании";

  const gradient = featured ? getFeaturedGradient(event.vibes) : null;

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        "group/event flex flex-col overflow-hidden rounded-2xl bg-card transition-colors",
        featured
          ? "rounded-3xl ring-1 ring-border/40 hover:ring-primary/40"
          : "border border-border hover:border-primary/60",
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover transition-transform duration-300 group-hover/event:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Calendar className="size-12" />
          </div>
        )}
        {event.price && (
          <span className="text-mono-label absolute right-2 top-2 rounded-full bg-background/85 px-2.5 py-1 text-foreground backdrop-blur-md">
            {event.price}
          </span>
        )}
      </div>

      {/* Контент-блок: на featured — двойной radial-gradient vibe-цветов поверх
          bg-card. Gradient видно весь, потому что cover-фото осталось над ним. */}
      <div
        className="flex flex-col gap-2 p-4"
        style={gradient ? { backgroundImage: gradient } : undefined}
      >
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          {event.title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {event.vibes.slice(0, 3).map((v) => {
            const c = VIBE_COLORS[v];
            return (
              <span
                key={v}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium text-background"
                style={{ backgroundColor: c.value }}
              >
                {c.label}
              </span>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            <span className="text-mono-label">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{placeLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            <span className="text-mono-label">
              {event.attendees_count.going} идут · {event.attendees_count.interested} интересно
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}