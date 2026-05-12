// src/features/events/api.ts
import type { Bbox,Vibe } from "@/features/map/schemas";
import { apiClient } from "@/lib/api/client";

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
  date_to?: string;   // ISO
  cursor?: string | null;
}

function buildQuery(params: FetchEventsParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.bbox) {
    // bboxSchema = [minLng, minLat, maxLng, maxLat]
    q.set("bbox", params.bbox.join(","));
  }
  if (params.vibes && params.vibes.length > 0) {
    for (const v of params.vibes) q.append("vibes", v);
  }
  if (params.date_from) q.set("date_from", params.date_from);
  if (params.date_to) q.set("date_to", params.date_to);
  if (params.cursor) q.set("cursor", params.cursor);
  return q;
}

export async function fetchEvents(
  params: FetchEventsParams,
): Promise<EventsPage> {
  const query = buildQuery(params);
  const j = await apiClient.get("api/events", { searchParams: query }).json();
  return eventsPageSchema.parse(j);
}

export async function fetchEventDetail(id: string): Promise<EventDetail> {
  const j = await apiClient.get(`api/events/${id}`).json();
  return eventDetailSchema.parse(j);
}

export async function setRsvp(
  eventId: string,
  status: "going" | "interested",
): Promise<RsvpResponse> {
  const j = await apiClient
    .post(`api/events/${eventId}/rsvp`, { json: { status } })
    .json();
  return rsvpResponseSchema.parse(j);
}

export async function clearRsvp(eventId: string): Promise<void> {
  await apiClient.delete(`api/events/${eventId}/rsvp`);
}
