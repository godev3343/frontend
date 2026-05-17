// src/features/ai/components/recommendation-card.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceDetail } from "@/features/map/hooks/use-place-detail";
import { getFeaturedGradient,VIBE_COLORS } from "@/features/map/lib/vibe-colors";

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
      <div className="space-y-3 rounded-2xl border border-border bg-card/60 p-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (isError || !place) {
    Sentry.captureMessage("ai_recommendation_missing_place", {
      level: "warning",
      extra: { place_id: recommendation.place_id },
    });
    return null;
  }

  const photo = place.photos[0];
  const vibeKey = recommendation.vibe_match ?? place.primary_vibe;
  const vibeColor = VIBE_COLORS[vibeKey].value;

  // Для featured-gradient'а используем все вайбы места, а не один primary.
  // Если бэк нам отдал vibe_match (AI-выбранный) — он становится первым,
  // остальные допихиваются для второго градиента.
  // Гарантируем что vibeKey всегда первый (он же отображается дотом).
  const placeVibeTags = place.vibes.map((v) => v.vibe);
  const vibesForGradient = recommendation.vibe_match
  ? [
      recommendation.vibe_match,
      ...placeVibeTags.filter((v) => v !== recommendation.vibe_match),
    ]
  : placeVibeTags;
  const gradient = getFeaturedGradient(vibesForGradient);

  return (
    <article className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/40">
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

      <div className="space-y-3 px-4 pb-4 pt-4"
          style={gradient ? { backgroundImage: gradient } : undefined}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">{place.name}</h3>
          <span
            className="mt-1 size-3 shrink-0 rounded-full"
            style={{ backgroundColor: vibeColor }}
            aria-label={`Вайб: ${vibeKey}`}
          />
        </div>

        <div className="flex gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 backdrop-blur-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-foreground/90">
            {recommendation.reasoning}
          </p>
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