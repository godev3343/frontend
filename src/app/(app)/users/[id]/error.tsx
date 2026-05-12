// src/app/(app)/users/[id]/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function UserProfileError({
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
    <main className="container mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-white">
        Не удалось загрузить профиль
      </h1>
      <p className="text-sm text-gray-400">
        Пользователь не найден или у тебя нет к нему доступа.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          Повторить
        </Button>
        <Button asChild>
          <Link href="/friends">К друзьям</Link>
        </Button>
      </div>
    </main>
  );
}
