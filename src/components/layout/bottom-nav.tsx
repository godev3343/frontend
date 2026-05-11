// src/components/layout/bottom-nav.tsx
'use client';

import { Calendar, Map, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Карта', icon: Map },
  { href: '/feed', label: 'Лента', icon: Calendar },
  { href: '/friends', label: 'Друзья', icon: Users },
  { href: '/profile', label: 'Профиль', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 h-20 md:hidden',
        'border-t border-gray-700 bg-gray-800/95 backdrop-blur-lg',
        'pb-[env(safe-area-inset-bottom)]',
      )}
      aria-label="Основная навигация"
    >
      <ul className="grid h-full grid-cols-4 px-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
      </ul>
    </nav>
  );
}
