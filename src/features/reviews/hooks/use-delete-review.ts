// src/features/reviews/hooks/use-delete-review.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { mapKeys } from "@/features/map/query-keys";
import { showError } from "@/lib/api/show-error";

import { deleteReview } from "../api";
import { reviewsKeys } from "../query-keys";

export function useDeleteReview(placeId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      toast.success("Отзыв удалён");
      void qc.invalidateQueries({ queryKey: reviewsKeys.place(placeId) });
      void qc.invalidateQueries({ queryKey: mapKeys.place(placeId) });
    },
    onError: (error) => showError(error),
  });
}