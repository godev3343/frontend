// src/features/auth/hooks.ts
'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMe } from './api';
import { useAuthStore } from './store';

export const ME_QUERY_KEY = ['me'] as const;

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    // ходим только если есть access. При первой загрузке access нет —
    // но AuthGate сам поднимет refresh-флоу и установит accessToken,
    // после чего query станет enabled и сработает.
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}