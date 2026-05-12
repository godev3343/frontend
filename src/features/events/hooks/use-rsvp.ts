// src/features/events/hooks/use-rsvp.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clearRsvp, setRsvp } from "@/features/events/api";
import { eventsKeys } from "@/features/events/query-keys";
import type {
  AttendeesCount,
  EventDetail,
  EventMarker,
  EventsPage,
  UserRsvp,
} from "@/features/events/schemas";
import { showError } from "@/lib/api/show-error";

type Vars = {
  id: string;
  /** Куда хотим прийти. null = снять RSVP. */
  next: UserRsvp;
};

type InfiniteShape = { pages: EventsPage[]; pageParams: unknown[] };
type PlainListShape = { results: EventMarker[] };

/**
 * Меняет attendees_count исходя из перехода `prev -> next`.
 * Без знания prev корректно посчитать нельзя — потому что
 * человек мог быть в `interested` и нажал `going`, тогда
 * interested--, going++.
 */
function patchCounts(
  counts: AttendeesCount,
  prev: UserRsvp,
  next: UserRsvp,
): AttendeesCount {
  let { going, interested } = counts;
  if (prev === "going") going = Math.max(0, going - 1);
  if (prev === "interested") interested = Math.max(0, interested - 1);
  if (next === "going") going += 1;
  if (next === "interested") interested += 1;
  return { going, interested };
}

function patchEvent<T extends EventMarker>(e: T, next: UserRsvp): T {
  return {
    ...e,
    user_rsvp: next,
    attendees_count: patchCounts(e.attendees_count, e.user_rsvp, next),
  };
}

function patchInfinite(
  data: InfiniteShape | undefined,
  id: string,
  next: UserRsvp,
): InfiniteShape | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: page.results.map((e) => (e.id === id ? patchEvent(e, next) : e)),
    })),
  };
}

function patchPlainList(
  data: PlainListShape | undefined,
  id: string,
  next: UserRsvp,
): PlainListShape | undefined {
  if (!data) return data;
  return {
    ...data,
    results: data.results.map((e) => (e.id === id ? patchEvent(e, next) : e)),
  };
}

export function useRsvp() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, next }: Vars) =>
      next === null
        ? clearRsvp(id).then(() => undefined)
        : setRsvp(id, next).then(() => undefined),

    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey: eventsKeys.all });

      const infiniteSnap = qc.getQueriesData<InfiniteShape>({
        queryKey: eventsKeys.all,
      });
      const plainSnap = qc.getQueriesData<PlainListShape>({
        queryKey: eventsKeys.all,
      });
      const detailSnap = qc.getQueryData<EventDetail>(eventsKeys.detail(id));

      // Patch lists (infinite + plain — обе формы возможны).
      for (const [key, value] of infiniteSnap) {
        if (value && "pages" in value) {
          qc.setQueryData<InfiniteShape>(key, patchInfinite(value, id, next));
        }
      }
      for (const [key, value] of plainSnap) {
        if (value && "results" in value && !("pages" in value)) {
          qc.setQueryData<PlainListShape>(key, patchPlainList(value, id, next));
        }
      }
      if (detailSnap) {
        qc.setQueryData<EventDetail>(
          eventsKeys.detail(id),
          patchEvent(detailSnap, next),
        );
      }

      return { infiniteSnap, plainSnap, detailSnap };
    },

    onError: (error, { id }, ctx) => {
      if (!ctx) return showError(error);
      for (const [key, value] of ctx.infiniteSnap) {
        qc.setQueryData(key, value);
      }
      for (const [key, value] of ctx.plainSnap) {
        qc.setQueryData(key, value);
      }
      if (ctx.detailSnap) {
        qc.setQueryData(eventsKeys.detail(id), ctx.detailSnap);
      }
      void showError(error);
    },

    onSettled: (_data, _err, { id }) => {
      void qc.invalidateQueries({ queryKey: eventsKeys.all });
      void id;
    },
  });
}

export type { Vars as RsvpVars };
