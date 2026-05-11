// src/app/api/auth/refresh/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { env } from '@/lib/env';

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get('refresh_token')?.value;

  if (!refresh) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
      cache: 'no-store',
    });
  } catch (err) {
    // бэк лежит / сеть упала — отдадим 503, фронт это поймёт как "нет сессии"
    console.warn('[refresh] upstream unreachable:', (err as Error).message);
    return NextResponse.json(
      { detail: 'Auth service unavailable' },
      { status: 503 },
    );
  }

  if (!upstream.ok) {
    // refresh протух — чистим cookie, чтобы proxy не зациклился
    cookieStore.delete('refresh_token');
    return NextResponse.json({ detail: 'Refresh failed' }, { status: 401 });
  }

  const data = (await upstream.json()) as { access: string; refresh?: string };

  if (data.refresh) {
    cookieStore.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_MAX_AGE,
    });
  }

  return NextResponse.json({ access: data.access });
}