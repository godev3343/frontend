// src/components/brand/vibe-badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Briefcase,
  Coffee,
  Flame,
  Gamepad2,
  Heart,
  type LucideIcon,
  Music,
  Users,
} from 'lucide-react';

import { VIBE_COLORS } from '@/features/map/lib/vibe-colors';
import { cn } from '@/lib/utils';

export const VIBE_TAGS = [
  'calm',
  'active',
  'productive',
  'romantic',
  'musical',
  'gaming',
  'networking',
] as const;

export type VibeTag = (typeof VIBE_TAGS)[number];

/**
 * Иконки — отдельный маппинг, потому что VIBE_COLORS живёт в map-фичe
 * и не должна знать о Lucide. Лейблы наоборот берём из VIBE_COLORS —
 * чтобы маркер на карте, фильтр и бейдж показывали ОДНУ И ТУ ЖЕ подпись.
 */
const VIBE_ICONS: Record<VibeTag, LucideIcon> = {
  calm: Coffee,
  active: Flame,
  productive: Briefcase,
  romantic: Heart,
  musical: Music,
  gaming: Gamepad2,
  networking: Users,
};

const vibeBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  {
    variants: {
      size: {
        sm: 'h-6 px-2 text-xs [&_svg]:size-3',
        md: 'h-7 px-3 text-xs [&_svg]:size-3.5',
        lg: 'h-8 px-3.5 text-sm [&_svg]:size-4',
      },
      variant: {
        soft: '',
        solid: 'text-white',
        outline: 'bg-transparent ring-1 ring-inset',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'soft',
    },
  },
);

type VibeBadgeProps = {
  vibe: VibeTag;
  /** Кастомный лейбл; по умолчанию — VIBE_COLORS[vibe].label */
  label?: string;
  className?: string;
} & VariantProps<typeof vibeBadgeVariants>;

export function VibeBadge({ vibe, label, size, variant, className }: VibeBadgeProps) {
  const Icon = VIBE_ICONS[vibe];
  const defaultLabel = VIBE_COLORS[vibe].label;
  const color = VIBE_COLORS[vibe].value;

  const colorStyle =
    variant === 'solid'
      ? { backgroundColor: color }
      : variant === 'outline'
        ? { color, boxShadow: `inset 0 0 0 1px ${color}` }
        : {
            backgroundColor: `color-mix(in oklab, ${color} 20%, transparent)`,
            color,
          };

  return (
    <span
      className={cn(vibeBadgeVariants({ size, variant }), className)}
      style={colorStyle}
      data-vibe={vibe}
    >
      <Icon />
      {label ?? defaultLabel}
    </span>
  );
}