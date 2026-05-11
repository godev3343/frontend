// src/components/layout/sidebar.tsx
'use client';

import { Calendar, Map, MapPin, Sparkles, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Карта', icon: Map },
  { href: '/feed', label: 'Лента', icon: Calendar },
  { href: '/friends', label: 'Друзья', icon: Users },
  { href: '/profile', label: 'Профиль', icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-64 flex-col md:flex',
        'border-r border-gray-700 bg-gray-900/95 backdrop-blur-lg',
      )}
      aria-label="Основная навигация"
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-700 px-6">
        <div className="bg-brand-gradient shadow-glow-purple flex size-10 items-center justify-center rounded-2xl">
          <MapPin className="size-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white">Go</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Sparkles className="size-3" />
            оживи город
          </span>
        </div>
      </div>

      {/* Nav */}
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
                  'transition-all duration-200',
                  isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
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
