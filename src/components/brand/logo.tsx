// src/components/brand/logo.tsx
import { MapPin, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
};

/**
 * Logo — лаймовый квадрат с MapPin внутри.
 * Бейдж-молния: тёмный круг с лаймовой Zap (инверсия).
 *
 * v2 — глоу пропорциональный размеру:
 *   - sm/md: shadow-glow-accent-center (40px blur)
 *   - lg: shadow-glow-accent-lg (60px blur)
 *   - xl: shadow-glow-accent-xl (80px blur)
 * Это убирает оптическую иллюзию «глоу провисает вниз» на крупных размерах.
 */
const SIZE_MAP = {
  sm: {
    box: 'size-12 rounded-2xl',
    icon: 'size-6',
    badge: 'size-4 [&_svg]:size-2.5',
    glow: 'shadow-glow-accent-center',
  },
  md: {
    box: 'size-16 rounded-2xl',
    icon: 'size-8',
    badge: 'size-5 [&_svg]:size-3',
    glow: 'shadow-glow-accent-center',
  },
  lg: {
    box: 'size-24 rounded-3xl',
    icon: 'size-12',
    badge: 'size-7 [&_svg]:size-4',
    glow: 'shadow-glow-accent-lg',
  },
  xl: {
    box: 'size-32 rounded-3xl',
    icon: 'size-16',
    badge: 'size-9 [&_svg]:size-5',
    glow: 'shadow-glow-accent-xl',
  },
} as const;

export function Logo({ size = 'lg', showBadge = true, className }: LogoProps) {
  const s = SIZE_MAP[size];

  return (
    <div className={cn('relative inline-block', className)} aria-label="Go">
      <div
        className={cn(
          'bg-primary flex items-center justify-center',
          s.box,
          s.glow,
        )}
      >
        <MapPin className={cn('text-primary-foreground', s.icon)} strokeWidth={2.5} />
      </div>
      {showBadge && (
        <div
          className={cn(
            'absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-background ring-2 ring-background',
            s.badge,
          )}
        >
          <Zap className="text-primary" strokeWidth={3} fill="currentColor" />
        </div>
      )}
    </div>
  );
}