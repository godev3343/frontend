// src/features/map/components/city-map.tsx
"use client";

import { Crosshair } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  type MapRef,
  NavigationControl,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";

import { AiFabGated as AiFab } from "@/features/ai/components/ai-fab-gated";
import { EventMapMarker } from "@/features/events/components/event-map-marker";
import { useEvents } from "@/features/events/hooks/use-events";
import { usePlaces } from "@/features/map/hooks/use-places";
import { ASTANA_CENTER, useUserLocation } from "@/features/map/hooks/use-user-location";
import { useVibeFilter } from "@/features/map/hooks/use-vibe-filter";
import type { Bbox } from "@/features/map/schemas";
import { env } from "@/lib/env";

import { PlaceMarker } from "./place-marker";
import { PlaceSheet } from "./place-sheet";
import { UserLocationMarker } from "./user-location-marker";
import { VibeFilterBar } from "./vibe-filter-bar";

const INITIAL_ZOOM = 13;

/**
 * CityMap — главный экран с MapLibre-картой.
 *
 * Layout правого нижнего угла (stack сверху → вниз):
 *   1. AiFab — z-30, top
 *   2. Кастомная геокнопка — z-20, middle
 *   3. NavigationControl от MapLibre (zoom +/-) — z-10, bottom (через CSS-override в globals.css)
 *
 * На mobile padding-bottom учитывает floating BottomNav (bottom-24 = 6rem).
 * На desktop floating BottomNav нет → отступ можно меньше, но оставляем
 * единый bottom-24 для консистентности (Sidebar не в нижней зоне).
 *
 * Все три блока в правом нижнем углу — `right-3` (12px от края), у них
 * одинаковая ось X. По вертикали стэк через flex-col с gap-2.
 */
export function CityMap() {
  const mapRef = useRef<MapRef | null>(null);
  const [bbox, setBbox] = useState<Bbox | null>(null);

  const [showEvents, setShowEvents] = useState(false);

  const { coords: userLocation, status: geoStatus, request: requestGeo } =
    useUserLocation();
  const { selected: vibes } = useVibeFilter();

  // Single source of truth for the selected place — URL.
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("placeId");

  const setSelectedId = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (id) next.set("placeId", id);
      else next.delete("placeId");
      const qs = next.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  const { data, isFetching } = usePlaces(bbox, vibes);
  const { data: eventsData } = useEvents(bbox, vibes, null, showEvents);

  const places = data?.results ?? [];
  const events = eventsData?.results ?? [];

  const handleMoveEnd = useCallback((e: ViewStateChangeEvent) => {
    const map = e.target;
    const bounds = map.getBounds();
    setBbox([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]);
  }, []);

  const handleLoad = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    setBbox([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]);
  }, []);

  const initialViewState = useMemo(
    () => ({
      longitude: ASTANA_CENTER.lng,
      latitude: ASTANA_CENTER.lat,
      zoom: INITIAL_ZOOM,
    }),
    [],
  );

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={env.NEXT_PUBLIC_MAP_STYLE_URL}
        onLoad={handleLoad}
        onMoveEnd={handleMoveEnd}
        // Attribution существует (юр. требование OSM/OpenMapTiles), но
        // скрыта через CSS-override в globals.css (.maplibregl-ctrl-attrib
        // { display: none }) — для dev/MVP. ВЕРНУТЬ перед prod-релизом.
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {geoStatus === "granted" && userLocation && (
          <UserLocationMarker location={userLocation} />
        )}

        {places.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            active={place.id === selectedId}
            onClick={setSelectedId}
          />
        ))}
        {showEvents &&
          events.map((event) => (
            <EventMapMarker key={event.id} event={event} />
          ))}
      </Map>

      <VibeFilterBar
        showEvents={showEvents}
        onToggleEvents={() => setShowEvents((v) => !v)}
      />

      {/*
        Правый нижний стэк: AI-FAB сверху, гео-кнопка под ним.
        NavigationControl от MapLibre (zoom +/-) живёт ПОД ними в том же
        углу — позиционирование делает сам MapLibre, мы только подгоняем
        spacing через CSS-override (.maplibregl-ctrl-bottom-right) в globals.css.

        bottom-32 = под зум-контролы MapLibre (которые ~bottom-3 + высота 80px).
        Точное значение подобрано визуально, держим единый offset для всего стека.
      */}
        <div className="pointer-events-none absolute bottom-[13.5rem] right-3 z-20 flex flex-col items-end gap-2">
  <AiFab />
  <button
    type="button"
    onClick={() => {
      if (geoStatus !== "granted" || !userLocation) {
        requestGeo();
        return;
      }
      mapRef.current?.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 600,
      });
    }}
    className={
      // Тот же стиль что у MapLibre-zoom (см. globals.css):
      // 48x48 круг, тёмный glass, лайм-hover, белая иконка.
      "pointer-events-auto inline-flex h-12 w-12 items-center justify-center " +
      "rounded-full transition-colors " +
      "bg-card/90 text-foreground border border-border backdrop-blur-md " +
      "hover:bg-primary/15"
    }
    aria-label="Моя локация"
  >
    <Crosshair className="h-5 w-5" />
  </button>
</div>

      {isFetching && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-card/90 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
          Загрузка…
        </div>
      )}

      <PlaceSheet
        placeId={selectedId}
        userLocation={geoStatus === "granted" ? userLocation : null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}