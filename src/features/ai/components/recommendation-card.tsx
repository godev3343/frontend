// src/features/ai/components/recommendation-card.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceDetail } from "@/features/map/hooks/use-place-detail";
import { VIBE_COLORS } from "@/features/map/lib/vibe-colors";
import { cn } from "@/lib/utils";

import type { AiRecommendation } from "../schemas";

interface Props {
  recommendation: AiRecommendation;
  onOpenOnMap: (placeId: string) => void;
}

export function RecommendationCard({ recommendation, onOpenOnMap }: Props) {
  const { data: place, isLoading, isError } = usePlaceDetail(
    recommendation.place_id,
  );

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-gray-700 bg-gray-800/40 p-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (isError || !place) {
    // Place not found — drop silently and log. Per EPIC 8.6 pitfall.
    Sentry.captureMessage("ai_recommendation_missing_place", {
      level: "warning",
      extra: { place_id: recommendation.place_id },
    });
    return null;
  }

  const photo = place.photos[0];
  const vibeKey = recommendation.vibe_match ?? place.primary_vibe;
  const vibeColor = VIBE_COLORS[vibeKey].hex;

  return (
    <article
      className={cn(
        "space-y-3 overflow-hidden rounded-2xl border border-gray-700",
        "bg-gray-800/60 backdrop-blur-sm",
      )}
    >
      {photo && (
        <div className="relative h-32 w-full">
          <Image
            src={photo.feed_url ?? photo.url}
            alt={place.name}
            fill
            sizes="(max-width: 640px) 100vw, 28rem"
            className="object-cover"
          />
        </div>
      )}

      <div className="space-y-3 px-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-white">{place.name}</h3>
          <span
            className="mt-1 size-3 shrink-0 rounded-full"
            style={{ backgroundColor: vibeColor }}
            aria-label={`Вайб: ${vibeKey}`}
          />
        </div>

        <div
          className={cn(
            "flex gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3",
            "flex gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3",
          )}
        >
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="leading-relaxed">{recommendation.reasoning}</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => onOpenOnMap(place.id)}
        >
          <MapPin className="mr-2 size-4" />
          Открыть на карте
        </Button>
      </div>
    </article>
  );
}
