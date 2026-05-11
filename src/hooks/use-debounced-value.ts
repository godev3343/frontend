// src/hooks/use-debounced-value.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Возвращает значение с задержкой. Полезно для поисковых инпутов:
 * на каждое нажатие НЕ дёргаем сеть, только когда пользователь остановился.
 *
 * @example
 * const [q, setQ] = useState("");
 * const debouncedQ = useDebouncedValue(q, 300);
 * const { data } = useQuery({ queryKey: ["search", debouncedQ], ... });
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}