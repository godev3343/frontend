// src/features/reviews/hooks/use-create-review.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { mapKeys } from "@/features/map/query-keys";
import { showError } from "@/lib/api/show-error";

import { createReview } from "../api";
import { reviewsKeys } from "../query-keys";
import type { CreateReviewInput } from "../schemas";

export function useCreateReview(placeId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(placeId, input),
    onSuccess: () => {
      toast.success("Отзыв опубликован");
      void qc.invalidateQueries({ queryKey: reviewsKeys.place(placeId) });
      // Карточка места может содержать сводный рейтинг — обновим
      void qc.invalidateQueries({ queryKey: mapKeys.place(placeId) });
    },
    onError: (error) => showError(error),
  });
}