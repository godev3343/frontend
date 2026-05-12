// src/features/checkins/hooks/use-like-checkin.ts
"use client";

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { showError } from "@/lib/api/show-error";

import { likeCheckin, unlikeCheckin } from "../api";
import { checkinsKeys } from "../query-keys";
import type { CheckIn, CheckinsPage } from "../schemas";

type Vars = { id: string; isLiked: boolean };

type InfiniteShape = { pages: CheckinsPage[]; pageParams: unknown[] };

function patchCheckin(
  data: InfiniteShape | undefined,
  id: string,
  patch: (c: CheckIn) => CheckIn,
): InfiniteShape | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: page.results.map((c) => (c.id === id ? patch(c) : c)),
    })),
  };
}

export function useLikeCheckin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isLiked }: Vars) =>
      isLiked ? unlikeCheckin(id) : likeCheckin(id),

    onMutate: async ({ id, isLiked }) => {
      const affected: QueryKey[] = [checkinsKeys.feed(), checkinsKeys.me()];

      await Promise.all(
        affected.map((key) => qc.cancelQueries({ queryKey: key })),
      );

      const snapshot = qc.getQueriesData<InfiniteShape>({
        queryKey: checkinsKeys.all,
      });

      const apply = (c: CheckIn): CheckIn => ({
        ...c,
        is_liked: !isLiked,
        likes_count: c.likes_count + (isLiked ? -1 : 1),
      });

      for (const [key, value] of snapshot) {
        qc.setQueryData<InfiniteShape>(key, patchCheckin(value, id, apply));
      }

      return { snapshot };
    },

    onError: (error, _vars, ctx) => {
      if (ctx?.snapshot) {
        for (const [key, value] of ctx.snapshot) {
          qc.setQueryData(key, value);
        }
      }
      showError(error);
    },

    onSettled: (_data, _err, { id }) => {
      void qc.invalidateQueries({ queryKey: checkinsKeys.feed() });
      void qc.invalidateQueries({ queryKey: checkinsKeys.me() });
      // если place-фид открыт — тоже обновим
      void qc.invalidateQueries({ queryKey: checkinsKeys.all });
      void id;
    },
  });
}
