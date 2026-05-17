// src/features/map/components/city-map-loader.tsx
"use client";

import dynamic from "next/dynamic";

/**
 * Клиентская обёртка над динамическим импортом CityMap.
 * Нужна потому что в Next 15+ `dynamic({ ssr: false })`
 * нельзя вызывать в Server Components — только в Client.
 *
 * maplibre-gl лезет в window, поэтому ssr: false обязателен.
 */
export const CityMap = dynamic(
  () => import("@/features/map/components/city-map").then((m) => m.CityMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background text-sm text-muted-foreground">
        Карта загружается…
      </div>
    ),
  },
);