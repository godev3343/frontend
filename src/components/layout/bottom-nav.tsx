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

/**
 * BottomNav — floating-glass pill для mobile.
 *
 * v2 (прототип go-app.jsx::TabBar):
 *   - inset-x-0 bottom-0 → bottom-6 left-3 right-3 (floating, с отступами)
 *   - h-20 → h-16 (64px, как в прототипе)
 *   - border-top → утилита .glass (полупрозрачный + blur)
 *   - rounded-xl (24px — pill-форма)
 *   - shadow-float (мягкая тень для floating-элементов)
 *   - Активный таб — пилюля bg-secondary вокруг иконки+лейбла, не просто цвет иконки
 */
export function BottomNav() {
  const pathname = usePathname();
  // Тихо: если useMe не готов (не залогинен / refresh идёт) — points = 0,
  // не показываем бейдж.
  // ВАЖНО: useMe ДО early-return — иначе нарушаем Rules of Hooks
  // (хук должен вызываться при каждом рендере в одном и том же порядке).
  const { data: me } = useMe();
  const points = me?.points ?? 0;

  // На /onboarding юзер ещё не прошёл первый шаг — навигация бессмысленна
  // и создаёт ощущение что онбординг опционален. AI без preferred_vibes
  // даёт деградированные рекомендации — пускать туда некорректно.
  if (pathname === '/onboarding') return null;

  return (
    <nav
      className={cn(
        // floating positioning
        'fixed bottom-6 left-3 right-3 z-40 h-16 md:hidden',
        // safe area (для iPhone X+ с домашней зоной)
        'mb-[env(safe-area-inset-bottom)]',
        // glass-эффект + pill-форма + тень
        'glass rounded-xl shadow-float',
        // внутренний padding для пилюль табов
        'px-1.5',
      )}
      aria-label="Основная навигация"
    >
      <ul className="grid h-full grid-cols-6 gap-1">
        {NAV_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={Icon}
            pathname={pathname}
          />
        ))}

        <li className="flex">
          <AiNavButton />
        </li>

        {NAV_ITEMS.slice(2).map(({ href, label, icon: Icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={Icon}
            pathname={pathname}
            showPointsBubble={href === '/profile' && points > 0}
            points={points}
          />
        ))}
      </ul>
    </nav>
  );
}

/**
 * Пункт навигации с активным состоянием как пилюля.
 * Вынесен в отдельный компонент чтобы не дублировать разметку
 * между ".slice(0, 2)" и ".slice(2)".
 */
function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
  showPointsBubble = false,
  points = 0,
}: {
  href: string;
  label: string;
  icon: typeof Map;
  pathname: string;
  showPointsBubble?: boolean;
  points?: number;
}) {
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <li className="flex">
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group/nav-item flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg',
          'min-h-11 transition-all duration-200',
          // активный — пилюля surface-hi (как в прототипе TabBar строки 1037-1049)
          isActive
            ? 'bg-secondary text-foreground'
            : 'text-[color:var(--text-mute)] hover:text-foreground hover:bg-secondary/40',
        )}
      >
        <span className="relative">
          <Icon
            className="size-5"
            strokeWidth={isActive ? 2.5 : 1.6}
          />
          {showPointsBubble && <ProfilePointsBubble points={points} />}
        </span>
        <span className={cn('text-[10px]', isActive ? 'font-semibold' : 'font-medium')}>
          {label}
        </span>
      </Link>
    </li>
  );
}

/**
 * Маленький бейдж-пузырёк с числом поинтов поверх иконки профиля.
 *
 * v2: обводка через ring-2 ring-background — резолвится из токена,
 * автоматически работает на любом фоне (glass, surface, что угодно).
 * Раньше был hardcoded rgb(31,41,55) — мог разъехаться при смене темы.
 */
function ProfilePointsBubble({ points }: { points: number }) {
  const display =
    points >= 1000 ? `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(points);

  return (
    <span
      className={cn(
        'absolute -right-2 -top-1.5',
        'inline-flex h-4 min-w-[1rem] items-center justify-center',
        'rounded-full bg-primary text-primary-foreground px-1',
        'text-[10px] font-bold leading-none',
        'ring-2 ring-background',
      )}
      aria-label={`${points} поинтов`}
    >
      {display}
    </span>
  );
}