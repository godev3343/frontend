// src/app/(app)/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function AppError({
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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Что-то пошло не так</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Мы получили уведомление об ошибке и уже разбираемся. Попробуй ещё раз — обычно помогает.
        </p>
        <Button onClick={reset} className="mt-6 gap-2">
          <RefreshCw className="size-4" />
          Попробовать снова
        </Button>
      </div>
    </div>
  );
}
