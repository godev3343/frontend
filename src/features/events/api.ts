// src/features/events/api.ts
import type { Bbox, Vibe } from "@/features/map/schemas";
import { apiClient } from "@/lib/api/client";
import { env } from "@/lib/env";

import {
  type EventDetail,
  eventDetailSchema,
  type EventsPage,
  eventsPageSchema,
  type RsvpResponse,
  rsvpResponseSchema,
} from "./schemas";

export interface FetchEventsParams {
  bbox?: Bbox;
  vibes?: Vibe[];
  date_from?: string; // ISO
  date_to?: string; // ISO
  cursor?: string | null;
}

function buildQuery(params: FetchEventsParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.bbox) {
    // bbox формат: [lngMin, latMin, lngMax, latMax]
    q.set("bbox", params.bbox.join(","));
  }
  // vibes — бэк events не фильтрует по вайбам в pre-MVP, но шлём для совместимости
  if (params.vibes && params.vibes.length > 0) {
    for (const v of params.vibes) q.append("vibes", v);
  }
  // Бэк ждёт `from` / `to` (apps/events/filters.py::parse_list_query), не date_from/date_to
  if (params.date_from) q.set("from", params.date_from);
  if (params.date_to) q.set("to", params.date_to);
  // cursor → offset для LimitOffsetPagination бэка; в pre-MVP оставляем как было
  if (params.cursor) q.set("offset", params.cursor);
  return q;
}

export async function fetchEvents(
  params: FetchEventsParams,
): Promise<EventsPage> {
  const query = buildQuery(params);
  const j = await apiClient.get("api/events/", { searchParams: query }).json();
  return eventsPageSchema.parse(j);
}

export async function fetchEventDetail(id: string): Promise<EventDetail> {
  const j = await apiClient.get(`api/events/${id}/`).json();
  return eventDetailSchema.parse(j);
}

/**
 * RSVP функции работают ТОЛЬКО когда NEXT_PUBLIC_FEATURE_RSVP=true.
 * В pre-MVP бэк RSVP не реализует (Этап 1 по ТЗ). Если фича-флаг выключен —
 * сразу выбрасываем доменную ошибку, чтобы хук use-rsvp получил её через
 * onError и показал toast.
 */
class RsvpNotAvailable extends Error {
  code = 'rsvp_not_available';
  constructor() {
    super('RSVP пока недоступен — функция готовится');
  }
}

export async function setRsvp(
  eventId: string,
  status: "going" | "interested",
): Promise<RsvpResponse> {
  if (!env.NEXT_PUBLIC_FEATURE_RSVP) throw new RsvpNotAvailable();
  const j = await apiClient
    .post(`api/events/${eventId}/rsvp/`, { json: { status } })
    .json();
  return rsvpResponseSchema.parse(j);
}

export async function clearRsvp(eventId: string): Promise<void> {
  if (!env.NEXT_PUBLIC_FEATURE_RSVP) throw new RsvpNotAvailable();
  await apiClient.delete(`api/events/${eventId}/rsvp/`);
}
