// src/features/auth/auth-gate.tsx
'use client';

import { useEffect, useState } from 'react';

import { identify } from '@/lib/analytics';

import { useMe } from './hooks';
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

  return (
    <>
      <IdentifyOnMe />
      {children}
    </>
  );
}

/**
 * Сайд-эффект-компонент: как только `useMe()` отдал юзера — дёргаем
 * PostHog identify. Вынесен отдельно, чтобы не делать AuthGate
 * зависимым от useMe.
 *
 * NB: бэк отдаёт `is_onboarded` (boolean), а не `consent_at` (datetime).
 * has_consent = is_onboarded — потому что онбординг невозможен без consent
 * (apps/users/serializers/onboarding.py делает consent обязательным).
 */
function IdentifyOnMe() {
  const { data: me } = useMe();

  useEffect(() => {
    if (me?.id) {
      identify(String(me.id), {
        has_consent: me.is_onboarded,
      });
    }
  }, [me?.id, me?.is_onboarded]);

  return null;
}
