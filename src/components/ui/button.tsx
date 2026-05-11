// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary CTA — gradient из design.md (purple → pink → orange)
        brand:
          'bg-brand-gradient text-white shadow-lg hover:scale-[1.02] hover:brightness-110 active:scale-[0.99]',
        // Solid primary — purple-500
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Secondary — gray-800 + border gray-700, по design.md
        secondary:
          'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700',
        // Outline — для второстепенных действий
        outline:
          'border-gray-700 bg-transparent text-white hover:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800',
        // Ghost — purple-300 текст, по design.md
        ghost: 'text-purple-300 hover:bg-purple-900/30',
        // Destructive
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
        // Link
        link: 'text-purple-400 underline-offset-4 hover:underline',
      },
      size: {
        // По design.md Primary Button: py-3 px-6 ≈ h-12
        default: 'h-12 gap-2 px-6',
        sm: 'h-9 gap-1.5 px-4 text-sm',
        lg: 'h-14 gap-2 px-8 text-base',
        icon: 'size-12',
        'icon-sm': 'size-9',
        'icon-lg': 'size-14',
      },
    },
    defaultVariants: {
      variant: 'brand',
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
      data-variant={variant ?? 'brand'}
      data-size={size ?? 'default'}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
