// src/components/layout/sidebar.tsx
'use client';

import { Calendar, Map, Sparkles, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Карта', icon: Map },
  { href: '/feed', label: 'Лента', icon: Calendar },
  { href: '/friends', label: 'Друзья', icon: Users },
  { href: '/profile', label: 'Профиль', icon: User },
] as const;

/**
 * Sidebar — desktop-навигация (md+).
 *
 * v2 (OKLCH):
 *   - bg-gray-900/95 → bg-card (наш surface)
 *   - border-gray-700 → border-border
 *   - gray-* текст → muted-foreground / foreground
 *   - Логотип через общий <Logo size="sm"> вместо ручного квадрата
 *   - Активный пункт: bg-primary/15 text-primary (лайм pill)
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-64 flex-col md:flex',
        'bg-card border-r border-border',
      )}
      aria-label="Основная навигация"
    >
      {/* Brand block */}
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <Logo size="sm" showBadge={false} />
        <div className="flex flex-col">
          <span className="text-foreground font-bold">Go</span>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Sparkles className="size-3" />
            оживи город
          </span>
        </div>
      </div>

      {/* Nav links */}
      <ul className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  'transition-colors duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}