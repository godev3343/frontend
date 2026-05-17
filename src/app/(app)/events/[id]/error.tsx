// src/app/(app)/events/[id]/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function EventDetailError({
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
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-white">
        Не удалось загрузить событие
      </h1>
      <p className="text-sm text-muted-foreground">
        Возможно, оно было удалено или у тебя нет доступа.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          Повторить
        </Button>
        <Button asChild>
          <Link href="/events">К афише</Link>
        </Button>
      </div>
    </div>
  );
}
