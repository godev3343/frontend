// src/middleware.ts
import { type NextRequest,NextResponse } from 'next/server';

const AUTH_COOKIE = 'refresh_token';

// Маршруты, для которых требуется авторизация.
// Всё, что не в auth-группе и не статика — приватное.
const PUBLIC_PATHS = new Set<string>(['/login', '/onboarding']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пускаем статику, API-роуты Next, и публичные пути.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/monitoring') || // Sentry tunnel
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  // EPIC 2: реальная установка refresh_token (httpOnly cookie) появится тут.
  // Пока — наличие cookie = авторизован. Бэк ставит её через /api/auth/* роуты.
  const hasRefresh = request.cookies.has(AUTH_COOKIE);

  if (!hasRefresh) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
