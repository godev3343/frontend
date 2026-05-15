// src/features/events/components/event-detail-view.tsx
"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, ExternalLink, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { UserAvatar } from "@/components/brand/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventDetail } from "@/features/events/hooks/use-event-detail";
import { VIBE_COLORS } from "@/features/map/lib/vibe-colors";

import { AttendanceButton } from "./attendance-button";

interface Props {
  eventId: string;
}

/**
 * Содержимое страницы детали события. Используется в /events/[id].
 * Sheet-вариант делать не стали: страница даёт нативный back-стек,
 * рабочий share-by-link и понятный URL.
 */
export function EventDetailView({ eventId }: Props) {
  const { data: event, isLoading, isError } = useEventDetail(eventId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Не удалось загрузить событие
      </p>
    );
  }

  const startDate = new Date(event.starts_at);
  const dateLabel = format(startDate, "EEEE, d MMMM, HH:mm", { locale: ru });
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const endLabel = endDate ? format(endDate, "HH:mm", { locale: ru }) : null;

  return (
    <article className="flex flex-col gap-5">
      {event.cover_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-800">
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold leading-tight">{event.title}</h1>

        <div className="flex flex-wrap gap-1.5">
          {event.vibes.map((v) => {
            const c = VIBE_COLORS[v];
            return (
              <span
                key={v}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-900"
                style={{ backgroundColor: c.hex }}
              >
                {c.label}
              </span>
            );
          })}
        </div>

        <div className="text-muted-foreground flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            <span>
              {dateLabel}
              {endLabel && ` – ${endLabel}`}
            </span>
          </div>
          {event.place && (
            <Link
              href={`/?placeId=${event.place.id}`}
              className="flex items-center gap-2 hover:underline"
            >
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{event.place.name}</span>
            </Link>
          )}
          <div className="flex items-center gap-2">
  <Users className="size-4 shrink-0" />
  <span>
    {event.attendees_count.going} идут
    {event.attendees_count.interested > 0 &&
      ` · ${event.attendees_count.interested} интересно`}
    {event.friends_attending.length > 0 &&
      ` · из друзей: ${event.friends_attending
        .slice(0, 3)
        .map((f) => f.user.display_name)
        .join(", ")}${event.friends_attending.length > 3 ? ` и ещё ${event.friends_attending.length - 3}` : ""}`}
  </span>
</div>
          {event.price && (
            <p className="font-medium text-foreground">{event.price}</p>
          )}
        </div>
      </div>

      <AttendanceButton eventId={event.id} isGoing={event.is_going} />

      <section className="flex items-center gap-3 border-y border-border py-3">
        <UserAvatar
          src={event.organizer.avatar_url}
          name={event.organizer.display_name}
          size="sm"
        />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Организатор</span>
          <Link
            href={`/users/${event.organizer.id}`}
            className="text-sm font-medium hover:underline"
          >
            {event.organizer.display_name}
          </Link>
        </div>
      </section>

      {event.description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {event.description}
        </p>
      )}

      {event.url && (
        <Button asChild variant="outline" className="w-full gap-2">
          <a href={event.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Открыть на сайте
          </a>
        </Button>
      )}
    </article>
  );
}
