// src/features/checkins/api.ts
import { apiClient } from "@/lib/api/client";

import {
  type CheckIn,
  checkinSchema,
  type CheckinsPage,
  checkinsPageSchema,
  type CreateCheckinInput,
  createCheckinSchema,
} from "./schemas";

/**
 * POST /api/checkins/
 *
 * Бэк ждёт {place_id (int), latitude, longitude, comment?, photo_key?}.
 * Конверсия из {lat, lng, place_id (str)} делается через createCheckinSchema.transform.
 */
export async function createCheckin(input: CreateCheckinInput): Promise<CheckIn> {
  const body = createCheckinSchema.parse(input);
  const data = await apiClient.post("api/checkins/", { json: body }).json();
  return checkinSchema.parse(data);
}

/**
 * GET /api/feed/ — лента чек-инов друзей. Cursor pagination через DRF.
 * cursor — это значение query-param 'cursor' из URL next/previous, извлекается
 * через extractCursor() в use-feed.ts.
 */
export async function fetchFeed(cursor?: string | null): Promise<CheckinsPage> {
  const searchParams = cursor ? { cursor } : undefined;
  const data = await apiClient.get("api/feed/", { searchParams }).json();
  return checkinsPageSchema.parse(data);
}

export async function fetchMyCheckins(cursor?: string | null): Promise<CheckinsPage> {
  const searchParams = cursor ? { cursor } : undefined;
  const data = await apiClient.get("api/checkins/me/", { searchParams }).json();
  return checkinsPageSchema.parse(data);
}

/**
 * Лайк/анлайк чек-ина.
 * Бэк (apps/checkins/views/likes.py) возвращает {checkin_id, is_liked, likes_count},
 * но фронту достаточно знать что мутация прошла — оптимистичный апдейт в хуке
 * use-like-checkin делает всё нужное в кэше.
 */
export async function likeCheckin(id: string): Promise<void> {
  await apiClient.post(`api/checkins/${id}/like/`);
}

export async function unlikeCheckin(id: string): Promise<void> {
  await apiClient.delete(`api/checkins/${id}/like/`);
}

// NB: fetchPlaceCheckins удалён — эндпоинт `/api/places/{id}/checkins/` на бэке
// не реализован (карточка места отдаёт recent_checkins inline через PlaceDetailSerializer).
// Если UI нужны чек-ины конкретного места — фильтруй из общей ленты или используй
// fetchPlaceDetail() → place.recent_checkins (когда добавим в схему).
