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

export function CityMap() {
  const mapRef = useRef<MapRef | null>(null);
  const [bbox, setBbox] = useState<Bbox | null>(null);

  const [showEvents, setShowEvents] = useState(false);

  const { coords: userLocation, status: geoStatus, request: requestGeo } =
    useUserLocation();
  const { selected: vibes } = useVibeFilter();

  // Single source of truth for the selected place — URL.
  // - Marker click writes placeId to URL via router.replace
  // - AI chat navigates to /?placeId=... via router.push
  // - Both surfaces converge here through useSearchParams
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("placeId");

  const setSelectedId = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (id) next.set("placeId", id);
      else next.delete("placeId");
      const qs = next.toString();
      // replace, чтобы не плодить history при тыке на маркеры
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
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {geoStatus === "granted" && userLocation && <UserLocationMarker location={userLocation} />}

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

      <div className="pointer-events-none absolute bottom-24 right-3 z-10 flex flex-col gap-2">
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
          className="pointer-events-auto rounded-full bg-gray-900/90 p-3 text-white shadow-lg backdrop-blur-md border border-gray-700/50 hover:bg-gray-800"
          aria-label="Моя локация"
        >
          <Crosshair className="h-5 w-5" />
        </button>
      </div>

      {isFetching && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gray-900/85 px-3 py-1 text-xs text-gray-300 backdrop-blur-md">
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
