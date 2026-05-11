// src/components/brand/logo.tsx
import { MapPin, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
};

const SIZE_MAP = {
  sm: { box: 'size-12 rounded-2xl', icon: 'size-6', badge: 'size-4 [&_svg]:size-2.5' },
  md: { box: 'size-16 rounded-2xl', icon: 'size-8', badge: 'size-5 [&_svg]:size-3' },
  lg: { box: 'size-24 rounded-3xl', icon: 'size-12', badge: 'size-7 [&_svg]:size-4' },
  xl: { box: 'size-32 rounded-3xl', icon: 'size-16', badge: 'size-9 [&_svg]:size-5' },
} as const;

export function Logo({ size = 'lg', showBadge = true, className }: LogoProps) {
  const s = SIZE_MAP[size];

  return (
    <div className={cn('relative inline-block', className)} aria-label="Go">
      <div
        className={cn(
          'bg-brand-gradient shadow-glow-purple-lg flex items-center justify-center',
          s.box,
        )}
      >
        <MapPin className={cn('text-white', s.icon)} strokeWidth={2.5} />
      </div>
      {showBadge && (
        <div
          className={cn(
            'absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-green-400 ring-2 ring-gray-900',
            s.badge,
          )}
        >
          <Zap className="text-gray-900" strokeWidth={3} fill="currentColor" />
        </div>
      )}
    </div>
  );
}
