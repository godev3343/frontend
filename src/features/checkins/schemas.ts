// src/features/checkins/schemas.ts
import { z } from "zod/v4";

/**
 * Бэк CheckInSerializer отдаёт:
 *   id, created_at, comment, likes_count, lat, lng,
 *   user{id, public_name, avatar_url},
 *   place{id, name, lat, lng},
 *   photo_url, is_liked
 *
 * Фронт-UI ожидает:
 *   id (string), author{id, display_name, avatar_url},
 *   place{...маркер с location} — но фактически использует только id и name
 *
 * Нормализуем на границе:
 *   user → author
 *   public_name → display_name
 *   place{lat, lng} → place{location: {lat, lng}, primary_vibe: 'calm' fallback}
 *   id: number → string во всех вложениях
 */

const idAsString = z.union([z.number(), z.string()]).transform((v) => String(v));

/**
 * Мини-профиль места внутри чек-ина.
 * Это НЕ полный PlaceMarker — бэк отдаёт только id, name, lat, lng.
 * Чтобы UI checkin-карточки не падал на отсутствующих полях
 * (`primary_vibe`, `category`, `thumb_url`), даём дефолты.
 */
export const checkinPlaceMiniSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .transform((data) => ({
    id: String(data.id),
    name: data.name,
    location: { lat: data.lat ?? 0, lng: data.lng ?? 0 },
    primary_vibe: 'calm' as const,
    category: null as string | null,
    thumb_url: null as string | null,
  }));

/** Урезанный профиль автора чек-ина — приходит от бэка как `user`, фронт ждёт `author`. */
export const checkinAuthorSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    // бэк отдаёт public_name; фронт ждёт display_name — выравниваем
    public_name: z.string().optional(),
    display_name: z.string().optional(),
    avatar_url: z.string().url().nullable().optional().default(null),
  })
  .transform((data) => ({
    id: String(data.id),
    display_name: data.display_name ?? data.public_name ?? '',
    avatar_url: data.avatar_url ?? null,
  }));

/**
 * Сам чек-ин. Преобразуем верхний уровень: user → author.
 * Используем z.preprocess чтобы переименовать поле до парсинга вложенного автора.
 */
export const checkinSchema = z.preprocess(
  (raw: unknown) => {
    if (!raw || typeof raw !== 'object') return raw;
    const r = raw as Record<string, unknown>;
    // Если уже есть author — оставляем; иначе берём user
    if (!('author' in r) && 'user' in r) {
      return { ...r, author: r.user };
    }
    return r;
  },
  z.object({
    id: idAsString,
    place: checkinPlaceMiniSchema,
    author: checkinAuthorSchema,
    comment: z.string().nullable().default(null),
    photo_url: z.string().url().nullable().default(null),
    // photo_feed_url бэк не отдаёт — оставляем optional для совместимости с UI,
    // который может его читать; фронт fallback на photo_url
    photo_feed_url: z.string().url().nullable().default(null),
    created_at: z.string(),
    likes_count: z.number().int().nonnegative().default(0),
    is_liked: z.boolean().nullable().transform((v) => v ?? false),
    // points_delta — бэк сейчас не отдаёт (нет в CheckInSerializer); хук
    // use-create-checkin корректно обрабатывает undefined → не показывает тост
    points_delta: z.number().int().optional(),
  }),
);

export const feedItemSchema = checkinSchema;

/**
 * Тело POST /api/checkins/.
 * ВАЖНО: бэк ждёт `latitude`/`longitude`, не `lat`/`lng`!
 * (apps/checkins/serializers/create.py::CheckInCreateSerializer).
 * place_id — int на бэке, фронт хранит string — конвертируем при сериализации.
 */
export const createCheckinSchema = z
  .object({
    place_id: z.string().min(1),
    // на UI поля называются lat/lng (как в map.location) — оставляем имена,
    // но при отправке мапаем в latitude/longitude через transform
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    photo_key: z.string().nullable().optional(),
    comment: z.string().max(500).nullable().optional(),
  })
  .transform((data) => ({
    place_id: Number(data.place_id),
    latitude: data.lat,
    longitude: data.lng,
    photo_key: data.photo_key ?? null,
    comment: data.comment ?? '',
  }));

/**
 * DRF CursorPagination отдаёт {next: url|null, previous: url|null, results: [...]}.
 * (apps/checkins/pagination.py::CheckInCursorPagination)
 */
export const checkinsPageSchema = z.object({
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(checkinSchema),
});

export type CheckIn = z.infer<typeof checkinSchema>;
export type FeedItem = z.infer<typeof feedItemSchema>;
// Input — то что собирает форма (с lat/lng), Output — то что уйдёт на бэк
export type CreateCheckinInput = z.input<typeof createCheckinSchema>;
export type CreateCheckinPayload = z.output<typeof createCheckinSchema>;
export type CheckinsPage = z.infer<typeof checkinsPageSchema>;
