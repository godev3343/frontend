// src/app/providers.tsx
'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'sonner';

import { AuthGate } from '@/features/auth/auth-gate';
import { env } from '@/lib/env';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30 * 1000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
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