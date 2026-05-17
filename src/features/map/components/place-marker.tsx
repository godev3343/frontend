// src/features/map/components/place-marker.tsx
"use client";

import { Marker } from "react-map-gl/maplibre";

import { VIBE_COLORS } from "@/features/map/lib/vibe-colors";
import type { PlaceMarker as PlaceMarkerData } from "@/features/map/schemas";

interface Props {
  place: PlaceMarkerData;
  active: boolean;
  onClick: (id: string) => void;
}

export function PlaceMarker({ place, active, onClick }: Props) {
  const color = VIBE_COLORS[place.primary_vibe];

  return (
    <Marker
      longitude={place.location.lng}
      latitude={place.location.lat}
      anchor="center"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(place.id);
        }}
        aria-label={`Открыть ${place.name}`}
        className="relative flex h-8 w-8 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="block rounded-full transition-all duration-200"
          style={{
            width: active ? 18 : 14,
            height: active ? 18 : 14,
            backgroundColor: color.hex,
            border: "2px solid #ffffff",
            boxShadow: `0 0 0 2px rgba(0,0,0,0.35), 0 0 16px ${color.glow}`,
          }}
        />
      </button>
    </Marker>
  );
}
