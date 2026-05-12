// src/features/events/components/event-map-marker.tsx
"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Marker } from "react-map-gl/maplibre";

import type { EventMarker as EventMarkerType } from "@/features/events/schemas";

interface Props {
  event: EventMarkerType;
}

/**
 * Маркер события на карте. Визуально отличается от PlaceMarker
 * (иконка Calendar в фиолетовом кружке), чтобы пользователь
 * не путал «место» и «событие».
 * Берёт координаты из place.location или собственного location.
 */
export function EventMapMarker({ event }: Props) {
  const router = useRouter();

  const coords = event.place?.location ?? event.location;
  if (!coords) return null;

  return (
    <Marker
      longitude={coords.lng}
      latitude={coords.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        router.push(`/events/${event.id}`);
      }}
    >
      <div
        className="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-purple-500 shadow-lg transition-transform hover:scale-110"
        title={event.title}
      >
        <Calendar className="size-4 text-white" />
      </div>
    </Marker>
  );
}
