// src/features/events/components/rsvp-buttons-gated.tsx
"use client";

import { env } from "@/lib/env";

import { RsvpButtons } from "./rsvp-buttons";

/**
 * Обёртка над RsvpButtons — рендерит кнопки RSVP ТОЛЬКО если бэк
 * Этап-1 готов (NEXT_PUBLIC_FEATURE_RSVP=true).
 *
 * В pre-MVP RSVP не планируется по ТЗ — флаг false навсегда на этом этапе.
 *
 * Использование: в event-detail-view.tsx импортировать RsvpButtonsGated.
 */
type Props = {
  eventId: string;
  current: "going" | "interested" | null;
};

export function RsvpButtonsGated(props: Props) {
  if (!env.NEXT_PUBLIC_FEATURE_RSVP) return null;
  return <RsvpButtons {...props} />;
}
