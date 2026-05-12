// src/features/map/hooks/use-user-location.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Location } from "@/features/map/schemas";

export const ASTANA_CENTER: Location = { lat: 51.169, lng: 71.449 };

export type UserLocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

export type UserLocation = Location & {
  accuracy?: number;
  /** true если координаты — реальный GPS. false если fallback на Астану */
  isReal: boolean;
};

type Options = {
  /**
   * Если true — НЕ применять fallback на Астану. denied/error
   * оставляют coords = null. Использовать для критичных по
   * геопозиции операций (чек-ин).
   */
  strict?: boolean;
  /** Запрашивать геолокацию автоматически на маунте (default true). */
  auto?: boolean;
};

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 30_000,
};

export function useUserLocation(options: Options = {}) {
  const { strict = false, auto = true } = options;

  const [status, setStatus] = useState<UserLocationStatus>("idle");
  const [coords, setCoords] = useState<UserLocation | null>(null);
  const requestedRef = useRef(false);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      if (!strict) {
        setCoords({ ...ASTANA_CENTER, isReal: false });
      } else {
        setCoords(null);
      }
      return;
    }

    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isReal: true,
        });
        setStatus("granted");
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setStatus(denied ? "denied" : "error");
        if (!strict) {
          setCoords({ ...ASTANA_CENTER, isReal: false });
        } else {
          setCoords(null);
        }
      },
      GEO_OPTIONS,
    );
  }, [strict]);

  useEffect(() => {
    if (!auto || requestedRef.current) return;
    requestedRef.current = true;
    request();
  }, [auto, request]);

  return { status, coords, request } as const;
}
