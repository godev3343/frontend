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
      // z-стек на маркерах карты:
      //   1  — обычный place (glow + точка)
      //   5  — event marker (определён в event-map-marker.tsx)
      //   10 — active place (selected)
      //   20 — user location
      // Иначе MapLibre сортирует по latitude (3D-перспектива) и
      // event'ы прячутся под places, glow перекрывает соседей.
      style={{ zIndex: active ? 10 : 1 }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(place.id);
        }}
        aria-label={`Открыть ${place.name}`}
        className="relative flex h-12 w-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Heat blob — радиальный gradient vibe-цвета.
            На active крупнее и насыщеннее, на обычном — тише,
            чтобы не «выжигать» соседние маркеры.
            overflow-hidden на родителе через rounded-full обрезает glow
            ровно по кругу — нет «утечки» blur'а за пределы. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full transition-all duration-200"
        >
          <span
            className="block h-full w-full transition-all duration-200"
            style={{
              background: active
                ? `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`
                : `radial-gradient(circle, ${color.value} 0%, transparent 55%)`,
              opacity: active ? 1 : 0.35,
              transform: active ? "scale(1.2)" : "scale(1)",
            }}
          />
        </span>
        {/* Сама точка — поверх blob */}
        <span
          className="relative block rounded-full transition-all duration-200"
          style={{
            width: active ? 18 : 14,
            height: active ? 18 : 14,
            backgroundColor: color.value,
            border: "2px solid #ffffff",
            boxShadow: "0 0 0 2px rgba(0,0,0,0.35)",
          }}
        />
      </button>
    </Marker>
  );
}