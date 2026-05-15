// src/features/reviews/api.ts
import { apiClient } from "@/lib/api/client";

import {
  type CreateReviewInput,
  createReviewSchema,
  type LikeResponse,
  likeResponseSchema,
  type Review,
  reviewSchema,
  type ReviewsPage,
  reviewsPageSchema,
  type UpdateReviewInput,
  updateReviewSchema,
} from "./schemas";

/**
 * Соответствие путей бэку (apps/reviews/urls.py):
 *   GET    /api/places/{id}/reviews            paginated(Review)
 *   POST   /api/places/{id}/reviews            Review (201)
 *   PATCH  /api/reviews/{id}                   Review
 *   DELETE /api/reviews/{id}                   204
 *   POST   /api/reviews/{id}/like              {likes_count, is_liked, result}
 *   DELETE /api/reviews/{id}/like              {likes_count, is_liked}
 *
 * NB: пути БЕЗ trailing slash (как в reviews/urls.py).
 */

const REVIEWS_PAGE_LIMIT = 20;

/**
 * GET список отзывов места. LimitOffsetPagination, не cursor.
 * offset — числовая строка из URL.searchParams next-а.
 */
export async function fetchPlaceReviews(
  placeId: string,
  offset?: string | null,
): Promise<ReviewsPage> {
  const params = new URLSearchParams({ limit: String(REVIEWS_PAGE_LIMIT) });
  if (offset) params.set("offset", offset);

  const data = await apiClient
    .get(`api/places/${placeId}/reviews?${params}`)
    .json();
  return reviewsPageSchema.parse(data);
}

export async function createReview(
  placeId: string,
  input: CreateReviewInput,
): Promise<Review> {
  const body = createReviewSchema.parse(input);
  const data = await apiClient
    .post(`api/places/${placeId}/reviews`, { json: body })
    .json();
  return reviewSchema.parse(data);
}

export async function updateReview(
  reviewId: string,
  input: UpdateReviewInput,
): Promise<Review> {
  const body = updateReviewSchema.parse(input);
  const data = await apiClient
    .patch(`api/reviews/${reviewId}`, { json: body })
    .json();
  return reviewSchema.parse(data);
}

export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`api/reviews/${reviewId}`);
}

export async function likeReview(reviewId: string): Promise<LikeResponse> {
  const data = await apiClient.post(`api/reviews/${reviewId}/like`).json();
  return likeResponseSchema.parse(data);
}

export async function unlikeReview(reviewId: string): Promise<LikeResponse> {
  const data = await apiClient.delete(`api/reviews/${reviewId}/like`).json();
  return likeResponseSchema.parse(data);
}