// src/features/auth/hooks.ts
'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMe } from './api';
import { useAuthStore } from './store';

export const ME_QUERY_KEY = ['me'] as const;

/**
 * useMe — текущий юзер из /api/users/me.
 *
 * enabled: Boolean(accessToken) — пока токена нет, запрос НЕ делается.
 * Это значит, что в момент первого рендера сразу после login:
 *   - isPending === false (запрос не в полёте)
 *   - isLoading === false (то же самое, синоним)
 *   - data === undefined
 *   - status === 'pending' (но именно "ожидает условия", не "загружается")
 *   - fetchStatus === 'idle' (НЕ 'fetching')
 *
 * Поэтому компоненты, которые редиректят при !me, ОБЯЗАНЫ проверять не
 * только !isPending && !me, а ещё и наличие токена. Иначе словят false-positive
 * редирект в окне "токен есть, но запрос ещё не успел отработать".
 *
 * Самый чистый паттерн — отдавать вспомогательный флаг `isUnauthenticated`:
 * это true ТОЛЬКО если мы знаем что юзер реально не залогинен (нет токена
 * вообще, или запрос упал с ошибкой). Компоненты редиректят только на него.
 */
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Реально "юзер не залогинен" = (нет токена) ИЛИ (запрос упал).
  // Промежуточное состояние "токен только что появился, запрос в полёте"
  // НЕ считается unauthenticated.
  const isUnauthenticated = !accessToken || query.isError;

  return {
    ...query,
    /** True только если точно нет сессии. Для редиректов на /login. */
    isUnauthenticated,
  };
}
