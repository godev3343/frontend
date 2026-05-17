// src/features/events/components/event-map-marker.tsx
"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Marker } from "react-map-gl/maplibre";

import type { EventMarker as EventMarkerType } from "@/features/events/schemas";

interface Props {
  event: EventMarkerType;
}

export function EventMapMarker({ event }: Props) {
  const router = useRouter();

  const coords = event.place?.location ?? event.location;
  if (!coords || (coords.lat === 0 && coords.lng === 0)) return null;

  return (
    <Marker
      longitude={coords.lng}
      latitude={coords.lat}
      anchor="center"
      // Event marker всегда выше обычных place'ов — иначе при совпадении
      // координат с place его не кликнуть. См. комментарий в place-marker.tsx.
      style={{ zIndex: 5 }}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        router.push(`/events/${event.id}`);
      }}
    >
      <div
        className="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
        title={event.title}
      >
        <Calendar className="size-4 text-white" />
      </div>
    </Marker>
  );
}