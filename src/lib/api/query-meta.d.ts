// src/lib/api/query-meta.d.ts
/**
 * Augmentation для TanStack Query: разрешаем `meta.skipGlobalErrorToast`
 * на мутациях. Если хук не хочет глобальный тост (например, обрабатывает
 * ошибку inline в форме) — ставит этот флаг.
 *
 * Свойство опциональное — существующие мутации без `meta` остаются валидны.
 */
import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      skipGlobalErrorToast?: boolean;
    };
  }
}
