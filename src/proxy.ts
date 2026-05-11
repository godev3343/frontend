// src/proxy.ts
import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefresh = Boolean(request.cookies.get('refresh_token'));

  // публичные роуты — пропускаем
  // (страница reset-password нужна и залогиненному, если он пришёл по ссылке)
  if (isPublic(pathname)) return NextResponse.next();

  if (!hasRefresh) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// важно: НЕ матчим Route Handlers (/api/*), статику и Next-внутреннее
export const config = {
  matcher: ['/((?!api|_next|icons|manifest.json|favicon.ico).*)'],
};