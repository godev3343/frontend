// src/features/events/schemas.ts
import { z } from "zod/v4";

import {
  locationSchema,
  placeMarkerSchema,
  vibeSchema,
} from "@/features/map/schemas";

export const eventCategorySchema = z.enum([
  "concert",
  "meetup",
  "party",
  "sport",
  "culture",
  "workshop",
  "other",
]);
export type EventCategory = z.infer<typeof eventCategorySchema>;

export const rsvpStatusSchema = z.enum(["going", "interested", "none"]);
export type RsvpStatus = z.infer<typeof rsvpStatusSchema>;

export const userRsvpSchema = z.enum(["going", "interested"]).nullable();
export type UserRsvp = z.infer<typeof userRsvpSchema>;

export const organizerSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  avatar_url: z.string().nullable(),
});
export type Organizer = z.infer<typeof organizerSchema>;

export const attendeesCountSchema = z.object({
  going: z.number().int().nonnegative(),
  interested: z.number().int().nonnegative(),
});
export type AttendeesCount = z.infer<typeof attendeesCountSchema>;

/**
 * Lightweight event for lists and map-markers.
 * The event can sit at an explicit `location` OR at a known `place`.
 * At least one of them will be present - but we do not enforce that
 * at the schema level (backend contract is still fluid).
 */
export const eventMarkerSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: eventCategorySchema,
  vibes: z.array(vibeSchema),
  cover_url: z.string().nullable(),
  starts_at: z.string(), // ISO
  ends_at: z.string().nullable(),
  location: locationSchema.nullable(),
  place: placeMarkerSchema.nullable(),
  price: z.string().nullable(),
  attendees_count: attendeesCountSchema,
  user_rsvp: userRsvpSchema,
});
export type EventMarker = z.infer<typeof eventMarkerSchema>;

export const eventDetailSchema = eventMarkerSchema.extend({
  description: z.string().nullable(),
  organizer: organizerSchema,
  url: z.string().nullable(),
});
export type EventDetail = z.infer<typeof eventDetailSchema>;

export const eventsPageSchema = z.object({
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(eventMarkerSchema),
});
export type EventsPage = z.infer<typeof eventsPageSchema>;

export const rsvpResponseSchema = z.object({
  status: rsvpStatusSchema,
});
export type RsvpResponse = z.infer<typeof rsvpResponseSchema>;
