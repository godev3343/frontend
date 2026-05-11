// src/components/brand/points-badge.tsx
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

type PointsBadgeProps = {
  points: number;
  variant?: 'soft' | 'gradient';
  size?: 'sm' | 'md';
  className?: string;
};

function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toString();
}

export function PointsBadge({
  points,
  variant = 'soft',
  size = 'md',
  className,
}: PointsBadgeProps) {
  const isGradient = variant === 'gradient';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'h-6 px-2 text-xs [&_svg]:size-3' : 'h-7 px-3 text-sm [&_svg]:size-3.5',
        isGradient
          ? 'bg-brand-gradient shadow-glow-purple text-white'
          : 'bg-purple-500/20 text-purple-300',
        className,
      )}
      aria-label={`${points} поинтов`}
    >
      <Sparkles strokeWidth={2.5} />
      {formatPoints(points)}
    </span>
  );
}
