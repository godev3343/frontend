// src/app/providers.tsx
'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'sonner';

import { AuthGate } from '@/features/auth/auth-gate';
import { showError } from '@/lib/api/show-error';
import { env } from '@/lib/env';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30 * 1000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
        // Глобальный fallback для мутаций: если у хука нет своего onError —
        // показываем тост через extractError. Хуки с явным onError (friends,
        // checkins) продолжают работать как раньше — TanStack v5 вызывает
        // cache-level onError всегда, а хук-level onError — после него.
        // Чтобы не было ДВУХ тостов, используем флаг `meta.skipGlobalErrorToast`.
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            const skip = mutation.meta?.skipGlobalErrorToast === true;
            if (skip) return;
            // Если у мутации есть собственный onError — он покажет свой тост,
            // поэтому глобальный мы пропускаем.
            const hasOwnHandler = Boolean(mutation.options.onError);
            if (hasOwnHandler) return;
            void showError(error);
          },
        }),
      }),
  );

  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthGate>{children}</AuthGate>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
