// src/features/auth/auth-gate.tsx
'use client';

import { useEffect, useState } from 'react';

import { useAuthStore } from './store';

/**
 * Запускается один раз при монтировании дерева — пытается восстановить
 * сессию через refresh-cookie. Пока крутится — не показываем контент,
 * чтобы не было flash-of-unauthenticated.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'same-origin',
        });
        if (!cancelled && res.ok) {
          const data = (await res.json()) as { access: string };
          setAccessToken(data.access);
        }
      } catch {
        // нет cookie или refresh протух — норм, юзер просто не залогинен
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setAccessToken]);

  if (!ready) {
    return (
      <div className="bg-background fixed inset-0 z-50 flex items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}