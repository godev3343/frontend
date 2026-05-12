// src/features/checkins/hooks/use-create-checkin.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ME_QUERY_KEY } from "@/features/auth/hooks";
import { mapKeys } from "@/features/map/query-keys";
import { pointsKeys } from "@/features/points/query-keys";
import { track } from "@/lib/analytics";
import { showError } from "@/lib/api/show-error";

import { createCheckin } from "../api";
import { checkinsKeys } from "../query-keys";
import type { CreateCheckinInput } from "../schemas";

export function useCreateCheckin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCheckinInput) => createCheckin(input),
    onSuccess: (checkin) => {
      // points_delta опционален в схеме. undefined трактуем как «бэк не сказал» —
      // молчаливо проглатываем (не выдумываем +5). 0 — идемпотентность бэка
      // (повторный чек-ин в то же место за тот же день), toast тоже не нужен.
      const delta = checkin.points_delta;
      if (typeof delta === "number" && delta > 0) {
        // 15+ — это first_checkin-бонус (5 + 10) или с фото (+5). Маркируем
        // отдельно, чтобы пользователь понял что это не обычный чек-ин.
        if (delta >= 15) {
          toast.success(`+${delta} поинтов — бонус!`, {
            description: "Первый в этом месте или с фото",
          });
        } else {
          toast.success(`+${delta} поинтов`);
        }
      }

      // Analytics: шлём всегда (даже при delta=0/undefined), чтобы видеть
      // общую частоту чек-инов. PII не шлём — только id места и points_delta.
      track("checkin_created", {
        place_id: checkin.place.id,
        points_delta: typeof delta === "number" ? delta : 0,
      });

      void qc.invalidateQueries({ queryKey: checkinsKeys.feed() });
      void qc.invalidateQueries({ queryKey: checkinsKeys.me() });
      void qc.invalidateQueries({
        queryKey: checkinsKeys.place(checkin.place.id),
      });
      void qc.invalidateQueries({ queryKey: mapKeys.place(checkin.place.id) });
      void qc.invalidateQueries({ queryKey: ME_QUERY_KEY });
      // история транзакций теперь устарела — баланс useMe и так инвалидирован
      void qc.invalidateQueries({ queryKey: pointsKeys.history() });
    },
    onError: (error) => showError(error),
  });
}
