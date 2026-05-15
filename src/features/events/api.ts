// src/features/events/api.ts
import type { Bbox, Vibe } from "@/features/map/schemas";
import { apiClient } from "@/lib/api/client";

import {
  type AttendanceState,
  attendanceStateSchema,
  type EventDetail,
  eventDetailSchema,
  type EventsPage,
  eventsPageSchema,
} from "./schemas";

export interface FetchEventsParams {
  bbox?: Bbox;
  vibes?: Vibe[];
  date_from?: string;
  date_to?: string;
  cursor?: string | null;
}

function buildQuery(params: FetchEventsParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.bbox) q.set("bbox", params.bbox.join(","));
  if (params.vibes && params.vibes.length > 0) {
    for (const v of params.vibes) q.append("vibes", v);
  }
  if (params.date_from) q.set("from", params.date_from);
  if (params.date_to) q.set("to", params.date_to);
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

/** GET /api/events/{id}/attendance/ — текущее состояние для авторизованного юзера. */
export async function fetchAttendance(
  eventId: string,
): Promise<AttendanceState> {
  const j = await apiClient.get(`api/events/${eventId}/attendance/`).json();
  return attendanceStateSchema.parse(j);
}

/** POST — отметить "иду". Идемпотентно. */
export async function markGoing(eventId: string): Promise<AttendanceState> {
  const j = await apiClient.post(`api/events/${eventId}/attendance/`).json();
  return attendanceStateSchema.parse(j);
}

/** DELETE — отменить. Идемпотентно. */
export async function cancelAttendance(
  eventId: string,
): Promise<AttendanceState> {
  const j = await apiClient
    .delete(`api/events/${eventId}/attendance/`)
    .json();
  return attendanceStateSchema.parse(j);
}