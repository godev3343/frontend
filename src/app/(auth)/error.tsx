// src/app/(auth)/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

/**
 * Ошибки в auth-группе обычно сетевые (бэк недоступен / 500).
 * Не пугаем "Что-то пошло не так" — даём конкретику и кнопку retry.
 */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="bg-background flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-xl font-semibold text-white">Не удалось загрузить</h1>
        <p className="text-sm text-muted-foreground">
          Похоже, проблема с подключением. Проверь интернет и попробуй ещё раз.
        </p>
        <Button onClick={reset} className="mt-2">
          Попробовать снова
        </Button>
      </div>
    </main>
  );
}
