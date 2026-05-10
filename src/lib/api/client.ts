// src/lib/api/client.ts
import ky from 'ky';

import { env } from '@/lib/env';

export const apiClient = ky.create({
  prefix: env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  retry: { limit: 1, methods: ['get'] },
  hooks: {
    beforeRequest: [
      (_request) => {
        // Тут будет access-token из zustand — добавим в EPIC 2
        // const token = useAuthStore.getState().accessToken;
        // if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    afterResponse: [
      // Тут будет 401 → refresh single-flight — добавим в EPIC 2
    ],
  },
});