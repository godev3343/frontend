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

const VIBE_META: Record<VibeTag, { label: string; icon: LucideIcon }> = {
  calm: { label: 'Спокойно', icon: Coffee },
  active: { label: 'Активно', icon: Flame },
  productive: { label: 'Продуктивно', icon: Briefcase },
  romantic: { label: 'Романтично', icon: Heart },
  musical: { label: 'Музыкально', icon: Music },
  gaming: { label: 'Игровое', icon: Gamepad2 },
  networking: { label: 'Нетворкинг', icon: Users },
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
        // Цвет + полупрозрачный фон того же цвета — по design.md Status Badge
        // bg уровень 20%, text — полный
        soft: '',
        // Solid — для активного фильтра
        solid: 'text-white',
        // Outline — для неактивного фильтра
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
  label?: string;
  className?: string;
} & VariantProps<typeof vibeBadgeVariants>;

export function VibeBadge({ vibe, label, size, variant, className }: VibeBadgeProps) {
  const meta = VIBE_META[vibe];
  const Icon = meta.icon;
  const cssVar = `var(--color-vibe-${vibe})`;

  // Используем inline style для динамического цвета — Tailwind не умеет в шаблонные JIT
  const colorStyle =
    variant === 'solid'
      ? { backgroundColor: cssVar }
      : variant === 'outline'
        ? { color: cssVar, boxShadow: `inset 0 0 0 1px ${cssVar}` }
        : { backgroundColor: `color-mix(in oklab, ${cssVar} 20%, transparent)`, color: cssVar };

  return (
    <span
      className={cn(vibeBadgeVariants({ size, variant }), className)}
      style={colorStyle}
      data-vibe={vibe}
    >
      <Icon />
      {label ?? meta.label}
    </span>
  );
}
