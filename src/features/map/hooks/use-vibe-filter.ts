// src/features/map/hooks/use-vibe-filter.ts
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { type Vibe,vibeSchema } from "@/features/map/schemas";

/**
 * Фильтр вайбов синхронится с URL (?vibes=calm,active),
 * чтобы share-by-link и back/forward работали.
 */
export function useVibeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selected = useMemo<Vibe[]>(() => {
    const raw = searchParams.get("vibes");
    if (!raw) return [];
    return raw
      .split(",")
      .map((v) => v.trim())
      .filter((v): v is Vibe => vibeSchema.safeParse(v).success);
  }, [searchParams]);

  const toggle = useCallback(
    (vibe: Vibe) => {
      const next = selected.includes(vibe)
        ? selected.filter((v) => v !== vibe)
        : [...selected, vibe];
      const params = new URLSearchParams(searchParams.toString());
      if (next.length === 0) {
        params.delete("vibes");
      } else {
        params.set("vibes", next.join(","));
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams, selected],
  );

  const clear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("vibes");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [router, searchParams]);

  return { selected, toggle, clear };
}
