// src/features/map/components/place-marker.tsx
"use client";

import { createElement } from "react";
import { Marker } from "react-map-gl/maplibre";

import { getCategoryIcon } from "@/features/map/lib/category-icons";
import { VIBE_COLORS } from "@/features/map/lib/vibe-colors";
import type { PlaceMarker as PlaceMarkerData } from "@/features/map/schemas";

interface Props {
  place: PlaceMarkerData;
  active: boolean;
  onClick: (id: string) => void;
}

export function PlaceMarker({ place, active, onClick }: Props) {
  const color = VIBE_COLORS[place.primary_vibe];
  const size = active ? 36 : 30;

  // getCategoryIcon возвращает стабильную иконку из модульного маппинга,
  // но eslint (react-hooks/static-components) не может это доказать и ругается
  // на <Icon/> из локальной переменной. createElement обходит правило, не
  // создавая «компонент в рендере».
  const categoryIcon = createElement(getCategoryIcon(place.category), {
    size: active ? 18 : 16,
    strokeWidth: active ? 2.25 : 2,
    // Тёмная иконка: vibe-цвета светлые (L~0.78), тёмный контур читается.
    color: "oklch(0.20 0.02 270)",
    "aria-hidden": true,
  });

  return (
    <Marker
      longitude={place.location.lng}
      latitude={place.location.lat}
      anchor="center"
      // z-стек: 1 — place, 5 — event, 10 — active place, 20 — user.
      // Иначе MapLibre сортирует по latitude и event'ы прячутся под places.
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
        {/* Vibe-glow позади пина — мягкий радиальный блик */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        >
          <span
            className="block h-full w-full transition-all duration-200"
            style={{
              background: `radial-gradient(circle, ${color.value} 0%, transparent ${active ? 65 : 55}%)`,
              opacity: active ? 0.9 : 0.4,
              transform: active ? "scale(1.15)" : "scale(1)",
            }}
          />
        </span>

        {/* Пин: vibe-цвет заливкой + иконка категории по центру */}
        <span
          className="relative flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: size,
            height: size,
            backgroundColor: color.value,
            border: "2px solid #ffffff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.45)",
          }}
        >
          {categoryIcon}
        </span>
      </button>
    </Marker>
  );
}