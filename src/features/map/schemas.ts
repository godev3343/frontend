// src/features/map/schemas.ts
import { z } from "zod/v4";

/**
 * Бэк отдаёт `id: number` (Django IntegerField), а UI везде ожидает `string`
 * (использует в URL params, query keys и т.д.). Нормализуем на границе: int → string.
 *
 * Также бэк отдаёт координаты ПЛОСКО (lat, lng как отдельные поля),
 * фронту удобнее `{location: {lat, lng}}`. Преобразование в preprocess
 * самих сериализаторов — UI код в `place-marker.tsx` / `city-map.tsx`
 * остаётся без изменений.
 */

export const vibeSchema = z.enum([
  "calm",
  "active",
  "productive",
  "romantic",
  "musical",
  "gaming",
  "networking",
]);
export type Vibe = z.infer<typeof vibeSchema>;

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Location = z.infer<typeof locationSchema>;

/** Bbox: [lngMin, latMin, lngMax, latMax] */
export const bboxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);
export type Bbox = z.infer<typeof bboxSchema>;

/**
 * Маркер места на карте.
 *
 * Бэк PlaceListItemSerializer:
 *   {id: int, name, lat, lng, category_slug, primary_vibe, thumb_url}
 *
 * Нормализуем:
 *   id: int → string
 *   {lat, lng} → {location: {lat, lng}}
 *   category_slug → category
 *
 * primary_vibe бэк отдаёт через `source="primary_vibe_tag"` с default=None —
 * у мест без вайбов будет null. Делаем nullable, а в UI fallback на 'calm'
 * через `.default('calm')` для совместимости.
 */
export const placeMarkerSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    location: locationSchema.optional(),
    primary_vibe: vibeSchema.nullable().default('calm'),
    category_slug: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    thumb_url: z.string().nullable().optional(),
  })
  .transform((data) => ({
    id: String(data.id),
    name: data.name,
    // если бэк прислал плоско — собираем; если уже как объект — используем
    location: data.location ?? {
      lat: data.lat ?? 0,
      lng: data.lng ?? 0,
    },
    primary_vibe: (data.primary_vibe ?? 'calm') as Vibe,
    category: data.category ?? data.category_slug ?? null,
    thumb_url: data.thumb_url ?? null,
  }));

export type PlaceMarker = z.infer<typeof placeMarkerSchema>;

export const placeVibeSchema = z
  .object({
    // Бэк отдаёт {tag, weight}. Фронту удобнее {vibe, weight} — выравниваем.
    tag: vibeSchema.optional(),
    vibe: vibeSchema.optional(),
    weight: z.number().min(0).max(1),
  })
  .transform((data) => ({
    vibe: (data.vibe ?? data.tag) as Vibe,
    weight: data.weight,
  }));

/**
 * Бэк PlacePhotoSerializer: {id, feed_url, thumb_url, width, height, created_at}.
 * Фронту нужно {url, feed_url}. Маппим: thumb_url → url (большая), feed_url → feed_url.
 */
export const placePhotoSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    url: z.string().url().optional(),
    feed_url: z.string().url().nullable().optional(),
    thumb_url: z.string().url().nullable().optional(),
  })
  .transform((data) => ({
    url: data.url ?? data.feed_url ?? data.thumb_url ?? '',
    feed_url: data.feed_url ?? null,
  }));

/**
 * Детальная карточка места.
 *
 * Бэк PlaceDetailSerializer:
 *   id, name, lat, lng, address, phone, hours_json, description, is_verified,
 *   category{slug, name_ru, name_kk}, vibes[{tag, weight}],
 *   photos[{id, feed_url, thumb_url, width, height, created_at}],
 *   recent_checkins[...]
 *
 * primary_vibe вычисляем сами — берём тег с максимальным весом.
 */
export const placeDetailSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    location: locationSchema.optional(),
    address: z.string().nullable().optional().default(null),
    phone: z.string().nullable().optional(),
    hours_json: z.unknown().nullable().optional(),
    hours: z.string().nullable().optional(),
    description: z.string().nullable().optional().default(null),
    is_verified: z.boolean().optional(),
    // category на бэке — объект {slug, name_ru, name_kk}; нам хватает slug
    category: z
      .union([
        z.string(),
        z.object({ slug: z.string(), name_ru: z.string().optional() }),
        z.null(),
      ])
      .optional()
      .default(null),
    vibes: z.array(placeVibeSchema).default([]),
    photos: z.array(placePhotoSchema).default([]),
  })
  .transform((data) => {
    const location = data.location ?? { lat: data.lat ?? 0, lng: data.lng ?? 0 };

    // primary_vibe = vibe с максимальным weight
    const primary =
      data.vibes.length > 0
        ? data.vibes.reduce((max, v) => (v.weight > max.weight ? v : max), data.vibes[0]!)
        : null;

    const categoryStr =
      typeof data.category === 'string'
        ? data.category
        : data.category && typeof data.category === 'object'
          ? data.category.slug
          : null;

    // hours — берём из hours (если бэк когда-то даст) или сериализуем hours_json
    const hours =
      data.hours ??
      (data.hours_json
        ? typeof data.hours_json === 'string'
          ? data.hours_json
          : JSON.stringify(data.hours_json)
        : null);

    return {
      id: String(data.id),
      name: data.name,
      location,
      primary_vibe: (primary?.vibe ?? 'calm') as Vibe,
      vibes: data.vibes,
      category: categoryStr,
      address: data.address ?? null,
      hours,
      description: data.description ?? null,
      photos: data.photos,
    };
  });
export type PlaceDetail = z.infer<typeof placeDetailSchema>;

/**
 * Бэк `/api/places/` отдаёт МАССИВ напрямую (без пагинации, см. EPIC 5,
 * apps/places/views/list.py: `pagination_class = None`).
 *
 * Чтобы фронт-код в use-places.ts не переписывать (он ждёт {results, next, previous}),
 * оборачиваем массив в paginated-shape.
 */
export const placesPageSchema = z
  .union([
    // если вдруг бэк начнёт пагинировать — поддерживаем оба shape
    z.object({
      results: z.array(placeMarkerSchema),
      next: z.string().nullable().default(null),
      previous: z.string().nullable().default(null),
    }),
    z.array(placeMarkerSchema).transform((arr) => ({
      results: arr,
      next: null as string | null,
      previous: null as string | null,
    })),
  ]);

export type PlacesPage = z.infer<typeof placesPageSchema>;
