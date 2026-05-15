// src/features/reviews/hooks/use-update-review.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { showError } from "@/lib/api/show-error";

import { updateReview } from "../api";
import { reviewsKeys } from "../query-keys";
import type { UpdateReviewInput } from "../schemas";

export function useUpdateReview(placeId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReviewInput }) =>
      updateReview(id, input),
    onSuccess: () => {
      toast.success("Отзыв обновлён");
      void qc.invalidateQueries({ queryKey: reviewsKeys.place(placeId) });
    },
    onError: (error) => showError(error),
  });
}