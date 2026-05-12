// src/components/layout/bottom-nav.tsx
'use client';

import { Calendar, Map, Newspaper, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AiNavButton } from '@/features/ai/components/ai-nav-button';
import { useMe } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Карта', icon: Map },
  { href: '/feed', label: 'Лента', icon: Newspaper },
  // AI lives in the middle as an overlay button (no route).
  { href: '/events', label: 'Афиша', icon: Calendar },
  { href: '/friends', label: 'Друзья', icon: Users },
  { href: '/profile', label: 'Профиль', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  // Тихо: если useMe не готов (не залогинен / refresh идёт) — points = 0,
  // не показываем бейдж.
  const { data: me } = useMe();
  const points = me?.points ?? 0;

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 h-20 md:hidden',
        'border-t border-gray-700 bg-gray-800/95 backdrop-blur-lg',
        'pb-[env(safe-area-inset-bottom)]',
      )}
      aria-label="Основная навигация"
    >
      <ul className="grid h-full grid-cols-6 px-2">
        {NAV_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group/nav-item flex flex-1 flex-col items-center justify-center gap-1',
                  'min-h-11 transition-colors duration-200',
                  isActive ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200',
                )}
              >
                <Icon
                  className={cn(
                    'size-6 transition-transform duration-200',
                    isActive && 'scale-110',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            </li>
          );
        })}

        <li className="flex">
          <AiNavButton />
        </li>

        {NAV_ITEMS.slice(2).map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const isProfile = href === '/profile';

          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group/nav-item flex flex-1 flex-col items-center justify-center gap-1',
                  'min-h-11 transition-colors duration-200',
                  isActive ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200',
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      'size-6 transition-transform duration-200',
                      isActive && 'scale-110',
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isProfile && points > 0 && (
                    <ProfilePointsBubble points={points} />
                  )}
                </span>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Маленький бейдж-пузырёк с числом поинтов поверх иконки профиля.
 * Не используем `PointsBadge` напрямую — нам нужен очень компактный вариант
 * (≤8px текста), а PointsBadge даёт минимум h-6 с иконкой.
 * Pulse-анимацию делаем тем же keyframe, что и в PointsBadge — ленивая
 * инжекция через useEffect, чтобы не дублировать <style>.
 */
function ProfilePointsBubble({ points }: { points: number }) {
  const display = points >= 1000
    ? `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K`
    : String(points);

  return (
    <span
      className={cn(
        'absolute -right-2 -top-1.5',
        'inline-flex h-4 min-w-[1rem] items-center justify-center',
        'rounded-full bg-purple-500 px-1',
        'text-[10px] font-bold leading-none text-white',
        'shadow-[0_0_0_2px_rgb(31,41,55)]', // обводка в цвет фона nav (gray-800)
      )}
      aria-label={`${points} поинтов`}
    >
      {display}
    </span>
  );
}
