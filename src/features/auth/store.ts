// src/features/auth/store.ts
'use client';

import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

/**
 * Access-токен живёт ТОЛЬКО в памяти. После reload — пусто,
 * восстанавливается через POST /api/auth/refresh (refresh лежит в httpOnly cookie).
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: null }),
}));