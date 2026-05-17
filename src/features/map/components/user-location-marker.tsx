// src/features/map/components/user-location-marker.tsx
"use client";

import { Marker } from "react-map-gl/maplibre";

import type { Location } from "@/features/map/schemas";

interface Props {
  location: Location;
}

export function UserLocationMarker({ location }: Props) {
  return (
    <Marker
      longitude={location.lng}
      latitude={location.lat}
      anchor="center"
      // Над всеми остальными маркерами — пользователь должен видеть
      // где он, даже если на той же точке есть place/event.
      style={{ zIndex: 20 }}
    >
      <div className="relative h-4 w-4">
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/40" />
        <span className="absolute inset-0 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
      </div>
    </Marker>
  );
}