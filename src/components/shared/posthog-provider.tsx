// src/components/shared/posthog-provider.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { useEffect } from 'react';

import { env } from '@/lib/env';

if (typeof window !== 'undefined' && env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // вручную при навигации
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (env.NEXT_PUBLIC_POSTHOG_KEY) posthog.capture('$pageview');
  }, []);

  return <Provider client={posthog}>{children}</Provider>;
}
