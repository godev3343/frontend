// src/features/map/components/user-location-marker.tsx
"use client";

import { Marker } from "react-map-gl/maplibre";

import type { Location } from "@/features/map/schemas";

interface Props {
  location: Location;
}

/**
 * Синий пульсирующий кружок «вы здесь». Не показываем при fallback на центр города.
 */
export function UserLocationMarker({ location }: Props) {
  return (
    <Marker longitude={location.lng} latitude={location.lat} anchor="center">
      <div className="relative h-4 w-4">
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/40" />
        <span className="absolute inset-0 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
      </div>
    </Marker>
  );
}
