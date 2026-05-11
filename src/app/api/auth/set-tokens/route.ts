// src/app/api/auth/set-tokens/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
});

// httpOnly refresh-cookie на 30 дней — синхронизируй с SIMPLE_JWT REFRESH_TOKEN_LIFETIME на бэке
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ detail: 'Invalid payload' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('refresh_token', parsed.data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  });

  return NextResponse.json({ access: parsed.data.access });
}