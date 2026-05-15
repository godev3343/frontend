// src/features/reviews/schemas.ts
import { z } from "zod/v4";

// Бэк отдаёт всё с int id; UI хранит string (как в checkins/places).
const idAsString = z.union([z.number(), z.string()]).transform((v) => String(v));

/** Мини-профиль автора отзыва. apps/reviews/serializers/output.py::_ReviewUserMiniSerializer */
export const reviewUserSchema = z.object({
  id: idAsString,
  public_name: z.string(),
  avatar_url: z.string().url().nullable(),
});
export type ReviewUser = z.infer<typeof reviewUserSchema>;

/**
 * Сам отзыв. apps/reviews/serializers/output.py::ReviewSerializer
 *
 * is_liked: bool | null — null когда юзер не залогинен (бэк это явно делает,
 * см. get_is_liked: возвращает null если context['liked_review_ids'] is None).
 * Нормализуем в bool: null → false (UI всё равно лайк не показывает анониму).
 */
export const reviewSchema = z.object({
  id: idAsString,
  rating: z.number().int().min(1).max(5),
  text: z.string(),
  user: reviewUserSchema,
  photo_url: z.string().url().nullable(),
  likes_count: z.number().int().nonnegative(),
  is_liked: z.boolean().nullable().transform((v) => v ?? false),
  is_mine: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Review = z.infer<typeof reviewSchema>;

/**
 * GET /api/places/{id}/reviews — DRF LimitOffsetPagination.
 * Формат: {count, next, previous, results} — НЕ cursor как в checkins/feed.
 */
export const reviewsPageSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(reviewSchema),
});
export type ReviewsPage = z.infer<typeof reviewsPageSchema>;

/** POST body. text допускает blank, photo_key опциональный. */
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).default(""),
  photo_key: z.string().nullable().optional(),
});
export type CreateReviewInput = z.input<typeof createReviewSchema>;

/**
 * PATCH body. Все поля optional, но at least one required (бэк отбьёт 400).
 * photo_key === null = удалить фото (бэк различает "не передан" vs "передан null").
 */
export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    text: z.string().max(2000).optional(),
    photo_key: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateReviewInput = z.input<typeof updateReviewSchema>;

/** POST/DELETE /api/reviews/{id}/like ответ. */
export const likeResponseSchema = z.object({
  likes_count: z.number().int().nonnegative(),
  is_liked: z.boolean(),
  // result присутствует только в POST (created | exists), в DELETE его нет
  result: z.enum(["created", "exists"]).optional(),
});
export type LikeResponse = z.infer<typeof likeResponseSchema>;