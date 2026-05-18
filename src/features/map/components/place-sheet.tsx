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
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { cn } from "@/lib/utils";

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
        {/*
          Padding стратегия:
          - SheetContent сам по себе без padding'а (так в shadcn).
          - Делаем структурную обёртку с p-0 + внутренние блоки управляют отступами:
            * Cover-фото — без padding'а, от края до края (full-bleed).
            * Всё остальное — внутри секций с px-4 (как в ai-chat-sheet).
          - Это убирает рассинхрон -mx-6/-mt-6 (старый отрицательный
            margin был рассчитан на p-6 родителя, а родитель имеет p-4 →
            фото вылазило криво).
        */}
        <SheetContent
          side="bottom"
          className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:side-right sm:max-w-md"
        >
          {/* Cover-фото на всю ширину Sheet'а. Без padding'а вокруг,
              визуально упирается в края — это намеренно (hero-стиль). */}
          {place?.photos[0] ? (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={place.photos[0].feed_url ?? place.photos[0].url}
                alt={place.name}
                fill
                sizes="(max-width: 640px) 100vw, 28rem"
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
              />
            </div>
          ) : null}

          {/*
            Header рендерим всегда (Radix требует SheetTitle на каждом монтировании).
            Когда place ещё не загружен — title в sr-only.
          */}
          <SheetHeader
            className={cn(
              place ? "space-y-3 px-4 pt-4" : "sr-only",
            )}
          >
            {place && place.vibes.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {place.vibes.map((v) => {
                  const c = VIBE_COLORS[v.vibe];
                  return (
                    <span
                      key={v.vibe}
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium text-background"
                      style={{
                        backgroundColor: c.value,
                        opacity: 0.4 + v.weight * 0.6,
                      }}
                    >
                      {c.label}
                    </span>
                  );
                })}
              </div>
            ) : place ? (
              (() => {
                const c = VIBE_COLORS[place.primary_vibe];
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium text-background"
                      style={{ backgroundColor: c.value }}
                    >
                      {c.label}
                    </span>
                  </div>
                );
              })()
            ) : null}

            <SheetTitle className={place ? "text-2xl" : ""}>
              {place?.name ?? "Информация о месте"}
            </SheetTitle>

            {place && (place.category || place.address || place.hours) ? (
              <SheetDescription className="space-y-1 text-sm text-muted-foreground">
                {place.category ? (
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {place.category}
                  </span>
                ) : null}
                {place.address ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {place.address}
                  </span>
                ) : null}
                {place.hours ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {place.hours}
                  </span>
                ) : null}
              </SheetDescription>
            ) : null}
          </SheetHeader>

          {/* Скелетоны/error при загрузке — тоже с px-4 для консистентности */}
          {isLoading ? (
            <div className="space-y-4 px-4 py-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : null}

          {isError ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Не удалось загрузить место. Попробуйте ещё раз.
            </div>
          ) : null}

          {place ? (
            <>
              {/* Основной контент места — общий px-4 для всех секций */}
              <div className="space-y-6 px-4 pb-6 pt-4">
                {place.description ? (
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {place.description}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <div className="text-mono-label text-muted-foreground">
                    {distanceLabel}
                  </div>
                  <Button
                    className="w-full"
                    disabled={!canCheckin}
                    onClick={() => setCheckinOpen(true)}
                    title={canCheckin ? undefined : "Подойдите ближе (≤ 100 м)"}
                  >
                    {canCheckin ? "Чек-ин" : "Подойдите ближе для чек-ина"}
                  </Button>
                </div>

                <ReviewsSection placeId={place.id} />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {place ? (
        <CheckinDialog
          place={place}
          open={checkinOpen}
          onOpenChange={setCheckinOpen}
        />
      ) : null}
    </>
  );
}