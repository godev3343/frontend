// src/features/reviews/hooks/use-like-review.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { showError } from "@/lib/api/show-error";

import { likeReview, unlikeReview } from "../api";
import { reviewsKeys } from "../query-keys";
import type { Review, ReviewsPage } from "../schemas";

type Vars = { id: string; placeId: string; isLiked: boolean };
type InfiniteShape = { pages: ReviewsPage[]; pageParams: unknown[] };

function patchReview(
  data: InfiniteShape | undefined,
  id: string,
  patch: (r: Review) => Review,
): InfiniteShape | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: page.results.map((r) => (r.id === id ? patch(r) : r)),
    })),
  };
}

/**
 * Оптимистичный лайк/анлайк — по образцу use-like-checkin.
 * На rollback возвращаем снапшот. После settle инвалидируем — бэк является
 * source of truth для likes_count (могут быть параллельные лайки от других).
 */
export function useLikeReview() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isLiked }: Vars) =>
      isLiked ? unlikeReview(id) : likeReview(id),

    onMutate: async ({ id, placeId, isLiked }) => {
      const key = reviewsKeys.place(placeId);
      await qc.cancelQueries({ queryKey: key });

      const snapshot = qc.getQueryData<InfiniteShape>(key);

      qc.setQueryData<InfiniteShape>(
        key,
        patchReview(snapshot, id, (r) => ({
          ...r,
          is_liked: !isLiked,
          likes_count: r.likes_count + (isLiked ? -1 : 1),
        })),
      );

      return { snapshot, key };
    },

    onError: (error, _vars, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.snapshot);
      showError(error);
    },

    onSettled: (_data, _err, vars) => {
      void qc.invalidateQueries({ queryKey: reviewsKeys.place(vars.placeId) });
    },
  });
}