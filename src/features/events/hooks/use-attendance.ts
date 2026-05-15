// src/features/events/hooks/use-attendance.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelAttendance, markGoing } from "@/features/events/api";
import { eventsKeys } from "@/features/events/query-keys";
import type {
  AttendanceState,
  EventDetail,
  EventMarker,
  EventsPage,
} from "@/features/events/schemas";
import { showError } from "@/lib/api/show-error";

type Vars = { id: string; going: boolean };

type InfiniteShape = { pages: EventsPage[]; pageParams: unknown[] };
type PlainListShape = { results: EventMarker[] };

/** Оптимистичный патч карточки в кэше: только going-счётчик и is_going. */
function patchDetail(e: EventDetail, going: boolean): EventDetail {
  const delta = going ? 1 : -1;
  return {
    ...e,
    is_going: going,
    attendees_count: {
      ...e.attendees_count,
      going: Math.max(0, e.attendees_count.going + delta),
    },
  };
}

function patchMarker<T extends EventMarker>(e: T, going: boolean): T {
  // В list-API бэк is_going не отдаёт, но кеш может содержать карточки которые
  // мы уже патчили — поэтому смотрим на going-счётчик как на источник правды.
  const delta = going ? 1 : -1;
  return {
    ...e,
    attendees_count: {
      ...e.attendees_count,
      going: Math.max(0, e.attendees_count.going + delta),
    },
  };
}

/**
 * Хук кнопки "Иду".
 * Идемпотентность гарантирует бэк — повторный POST не вернёт 409.
 * Оптимистично обновляем счётчик going и флаг is_going, при ошибке откатываем.
 */
export function useAttendance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, going }: Vars): Promise<AttendanceState> =>
      going ? markGoing(id) : cancelAttendance(id),

    onMutate: async ({ id, going }) => {
      await qc.cancelQueries({ queryKey: eventsKeys.all });

      const infiniteSnap = qc.getQueriesData<InfiniteShape>({
        queryKey: eventsKeys.all,
      });
      const plainSnap = qc.getQueriesData<PlainListShape>({
        queryKey: eventsKeys.all,
      });
      const detailSnap = qc.getQueryData<EventDetail>(eventsKeys.detail(id));

      for (const [key, value] of infiniteSnap) {
        if (value && "pages" in value) {
          qc.setQueryData<InfiniteShape>(key, {
            ...value,
            pages: value.pages.map((page) => ({
              ...page,
              results: page.results.map((e) =>
                e.id === id ? patchMarker(e, going) : e,
              ),
            })),
          });
        }
      }
      for (const [key, value] of plainSnap) {
        if (value && "results" in value && !("pages" in value)) {
          qc.setQueryData<PlainListShape>(key, {
            ...value,
            results: value.results.map((e) =>
              e.id === id ? patchMarker(e, going) : e,
            ),
          });
        }
      }
      if (detailSnap) {
        qc.setQueryData<EventDetail>(
          eventsKeys.detail(id),
          patchDetail(detailSnap, going),
        );
      }

      return { infiniteSnap, plainSnap, detailSnap };
    },

    onError: (error, { id }, ctx) => {
      if (!ctx) return showError(error);
      for (const [key, value] of ctx.infiniteSnap) qc.setQueryData(key, value);
      for (const [key, value] of ctx.plainSnap) qc.setQueryData(key, value);
      if (ctx.detailSnap) {
        qc.setQueryData(eventsKeys.detail(id), ctx.detailSnap);
      }
      void showError(error);
    },

    /** Server returns full state — синхронизируем detail-кэш, без полного invalidate. */
    onSuccess: (data, { id }) => {
      qc.setQueryData<EventDetail>(eventsKeys.detail(id), (old) =>
        old
          ? {
              ...old,
              is_going: data.is_going,
              attendees_count: {
                going: data.attendees_count,
                interested: old.attendees_count.interested,
              },
              friends_attending: data.friends_attending,
            }
          : old,
      );
    },

    onSettled: () => {
      // Лёгкий refresh списков — карта/афиша подберут новый счётчик при следующем рефетче.
      void qc.invalidateQueries({ queryKey: eventsKeys.all });
    },
  });
}