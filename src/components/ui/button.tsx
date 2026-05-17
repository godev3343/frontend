// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Button variants — переписаны под OKLCH-палитру (design.md v2).
 *
 * Изменения относительно v1:
 *   - Удалён variant="brand" (gradient purple→pink→orange) — gradient-кнопки
 *     больше не используются по дизайн-системе.
 *   - default — теперь лаймовый primary (был purple), это основная CTA.
 *   - secondary — surface-hi (был gray-800), читается через токены.
 *   - ghost — text-dim (был purple-300).
 *   - link — accent (был purple-400).
 *   - destructive — оставлен, перенесён на токены.
 *   - radius — увеличен дефолт до rounded-lg (16px) для default-size.
 *
 * Внимание: variant="brand" больше нет. Если в коде встречается
 * <Button variant="brand"> — заменить на default или на новый
 * accent-CTA (это и есть default).
 */
const buttonVariants = cva(
  // Базовые классы — общие для всех variants
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[background,box-shadow,filter,opacity] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary CTA — лайм. Это дефолт.
        // hover через brightness, а не scale — на тёмном scale выглядит дёшево
        default:
          'bg-primary text-primary-foreground shadow-glow-accent hover:brightness-105 active:opacity-85',
        // Secondary — поверхность повышенного уровня
        secondary:
          'bg-secondary text-secondary-foreground border border-border hover:brightness-110',
        // Outline — без фона, для второстепенных действий внутри карточек
        outline:
          'border border-border bg-transparent text-foreground hover:bg-surface',
        // Ghost — без фона и без бордера, для иконок в шапках/тулбарах
        ghost:
          'text-[color:var(--text-dim)] hover:bg-surface hover:text-foreground',
        // Destructive — красный, для delete/leave/unfriend
        destructive:
          'bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25',
        // Link — текстовая ссылка, лайм
        link:
          'text-primary underline-offset-4 hover:underline h-auto px-0',
      },
      size: {
        // Default — соответствует "h-12 px-6" из v1, остался
        default: 'h-12 gap-2 px-6',
        sm: 'h-9 gap-1.5 px-4 text-sm',
        lg: 'h-14 gap-2 px-8 text-base rounded-xl', // крупные кнопки — больший радиус
        icon: 'size-12 rounded-full', // round по дизайн-системе
        'icon-sm': 'size-9 rounded-full',
        'icon-lg': 'size-14 rounded-full',
        pill: 'h-11 gap-2 px-5 rounded-full', // pill-CTA как в прототипе ActionBtn primary
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };