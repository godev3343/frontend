// src/features/map/components/place-sheet.tsx
"use client";

import { Clock, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckinDialog } from "@/features/checkins/components/checkin-dialog";
import { usePlaceDetail } from "@/features/map/hooks/use-place-detail";
import {
  CHECKIN_RADIUS_METERS,
  haversineMeters,
} from "@/features/map/lib/distance";
import { VIBE_COLORS } from "@/features/map/lib/vibe-colors";
import type { Location } from "@/features/map/schemas";

interface Props {
  placeId: string | null;
  userLocation: Location | null;
  onClose: () => void;
}

export function PlaceSheet({ placeId, userLocation, onClose }: Props) {
  const open = placeId !== null;
  const [checkinOpen, setCheckinOpen] = useState(false);
  const { data: place, isLoading, isError } = usePlaceDetail(placeId);

  const distance =
    place && userLocation ? haversineMeters(userLocation, place.location) : null;
  const canCheckin = distance !== null && distance <= CHECKIN_RADIUS_METERS;
  const distanceLabel =
    distance === null
      ? "Локация не определена"
      : distance < 1000
        ? `${Math.round(distance)} м`
        : `${(distance / 1000).toFixed(1)} км`;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto sm:side-right sm:max-w-md"
        >
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {isError && (
            <div className="py-8 text-center text-sm text-gray-400">
              Не удалось загрузить место. Попробуйте ещё раз.
            </div>
          )}

          {place && (
            <>
              <SheetHeader className="space-y-3">
                {place.photos[0] && (
                  <div className="relative -mx-6 -mt-6 h-48 overflow-hidden">
                    <Image
                      src={place.photos[0].feed_url ?? place.photos[0].url}
                      alt={place.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 28rem"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {place.vibes.length > 0
                    ? place.vibes.map((v) => {
                        const c = VIBE_COLORS[v.vibe];
                        return (
                          <span
                            key={v.vibe}
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-900"
                            style={{
                              backgroundColor: c.hex,
                              opacity: 0.4 + v.weight * 0.6,
                            }}
                          >
                            {c.label}
                          </span>
                        );
                      })
                    : (() => {
                        const c = VIBE_COLORS[place.primary_vibe];
                        return (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-900"
                            style={{ backgroundColor: c.hex }}
                          >
                            {c.label}
                          </span>
                        );
                      })()}
                </div>
                <SheetTitle className="text-2xl">{place.name}</SheetTitle>
                {(place.category || place.address) && (
                  <SheetDescription className="space-y-1 text-sm text-gray-400">
                    {place.category && (
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        {place.category}
                      </span>
                    )}
                    {place.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {place.address}
                      </span>
                    )}
                    {place.hours && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {place.hours}
                      </span>
                    )}
                  </SheetDescription>
                )}
              </SheetHeader>

              {place.description && (
                <p className="mt-4 text-sm leading-relaxed text-gray-300">
                  {place.description}
                </p>
              )}

              <div className="mt-6 space-y-2">
                <div className="text-xs text-gray-500">{distanceLabel}</div>
                <Button
                  className="w-full"
                  disabled={!canCheckin}
                  onClick={() => setCheckinOpen(true)}
                  title={canCheckin ? undefined : "Подойдите ближе (≤ 100 м)"}
                >
                  {canCheckin ? "Чек-ин" : "Подойдите ближе для чек-ина"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {place && (
        <CheckinDialog
          place={place}
          open={checkinOpen}
          onOpenChange={setCheckinOpen}
        />
      )}
    </>
  );
}
