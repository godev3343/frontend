// src/features/events/schemas.ts
import { z } from "zod/v4";

import {
  locationSchema,
  vibeSchema,
} from "@/features/map/schemas";

/**
 * Бэк EventListItemSerializer / EventDetailSerializer отдаёт МИНИМУМ:
 *   list: {id, title, starts_at, ends_at, cover_url, place{id,name}|null, location{lat,lng}|null}
 *   detail: + {description, created_at}
 *
 * Фронт-UI исторически ждёт МНОГО:
 *   category, vibes[], cover_url, price, attendees_count, user_rsvp, organizer, url
 *
 * На pre-MVP мы решаем расхождение через optional+default — UI рендерит то что
 * пришло, а недостающие поля либо скрыты (RSVP за фича-флагом), либо обнуляются
 * в дефолтных значениях (organizer показывает "Без организатора", vibes []).
 *
 * Когда бэк начнёт отдавать эти поля — z.infer типа не поменяется, просто
 * данных станет больше.
 */

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
 * Бэк сейчас отдаёт `attendees_count: <number>` (только going-счётчик).
 * Когда добавят interested — начнёт отдавать объект. Принимаем оба варианта,
 * нормализуем в {going, interested} чтобы UI не знал о расхождении.
 */
const attendeesCountFlexible = z.preprocess(
  (v) => {
    if (typeof v === "number") return { going: v, interested: 0 };
    return v;
  },
  attendeesCountSchema,
);

export const attendingUserSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((v) => String(v)),
  display_name: z.string(),
  avatar_url: z.string().nullable(),
});
export type AttendingUser = z.infer<typeof attendingUserSchema>;

export const friendAttendanceSchema = z.object({
  user: attendingUserSchema,
  created_at: z.string(),
});
export type FriendAttendance = z.infer<typeof friendAttendanceSchema>;

/** Ответ GET/POST/DELETE /api/events/{id}/attendance/ */
export const attendanceStateSchema = z.object({
  is_going: z.boolean(),
  attendees_count: z.number().int().nonnegative(),
  friends_attending: z.array(friendAttendanceSchema),
});
export type AttendanceState = z.infer<typeof attendanceStateSchema>;

/** Мини-место внутри события — бэк отдаёт {id, name} без location/vibes. */
const eventPlaceMiniSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
  })
  .transform((d) => ({
    id: String(d.id),
    name: d.name,
    // дефолты чтобы UI код, ожидающий PlaceMarker shape, не падал
    location: null as { lat: number; lng: number } | null,
    primary_vibe: 'calm' as const,
    category: null as string | null,
    thumb_url: null as string | null,
  }));

const DEFAULT_ATTENDEES = { going: 0, interested: 0 };
const DEFAULT_ORGANIZER: Organizer = {
  id: '0',
  display_name: 'Без организатора',
  avatar_url: null,
};

/**
 * Карточка события для списка/маркера.
 * cover_url у бэка — обычный CharField, может быть пустой строкой ('') —
 * нормализуем в null если пусто.
 */
export const eventMarkerSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    title: z.string(),
    starts_at: z.string(),
    ends_at: z.string().nullable().default(null),
    cover_url: z.string().nullable().default(null),
    place: eventPlaceMiniSchema.nullable().default(null),
    location: locationSchema.nullable().default(null),
    // следующие поля бэк не отдаёт — все optional с дефолтами
    category: eventCategorySchema.optional().default('other'),
    vibes: z.array(vibeSchema).optional().default([]),
    price: z.string().nullable().optional().default(null),
    attendees_count: attendeesCountFlexible.optional().default(DEFAULT_ATTENDEES),
    user_rsvp: userRsvpSchema.optional().default(null),
  })
  .transform((d) => ({
    ...d,
    id: String(d.id),
    cover_url: d.cover_url && d.cover_url.length > 0 ? d.cover_url : null,
  }));
export type EventMarker = z.infer<typeof eventMarkerSchema>;

export const eventDetailSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    title: z.string(),
    starts_at: z.string(),
    ends_at: z.string().nullable().default(null),
    cover_url: z.string().nullable().default(null),
    place: eventPlaceMiniSchema.nullable().default(null),
    location: locationSchema.nullable().default(null),
    description: z.string().nullable().default(null),
    created_at: z.string().optional(),
    // дефолты:
    category: eventCategorySchema.optional().default('other'),
    vibes: z.array(vibeSchema).optional().default([]),
    price: z.string().nullable().optional().default(null),
    attendees_count: attendeesCountFlexible.optional().default(DEFAULT_ATTENDEES),
    user_rsvp: userRsvpSchema.optional().default(null),
    organizer: organizerSchema.optional().default(DEFAULT_ORGANIZER),
    url: z.string().nullable().optional().default(null),
    is_going: z.boolean().optional().default(false),
    friends_attending: z.array(friendAttendanceSchema).optional().default([]),
  })
  .transform((d) => ({
    ...d,
    id: String(d.id),
    cover_url: d.cover_url && d.cover_url.length > 0 ? d.cover_url : null,
  }));
export type EventDetail = z.infer<typeof eventDetailSchema>;

/**
 * Бэк events использует `LimitOffsetPagination` (apps/events/views/list.py),
 * shape: {count, next, previous, results}. Делаем гибко — поддерживаем и cursor.
 */
export const eventsPageSchema = z.object({
  count: z.number().optional(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(eventMarkerSchema),
});
export type EventsPage = z.infer<typeof eventsPageSchema>;

export const rsvpResponseSchema = z.object({
  status: rsvpStatusSchema,
});
export type RsvpResponse = z.infer<typeof rsvpResponseSchema>;
