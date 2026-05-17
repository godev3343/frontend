// src/components/ui/input.tsx
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Input — поле ввода по дизайн-системе v2.
 *
 * v2 (OKLCH):
 *   - h-8 (32px) → h-11 (44px) — touch-target по a11y, ощущается «реальным»
 *   - rounded-lg радиус (16px по design.md)
 *   - bg-transparent на light, bg-input/30 на dark — фон мягче чем pure surface
 *   - text-base сразу (убрал md:text-sm, чтобы на desktop не уменьшался)
 *   - focus-visible:ring через токен --ring (лайм)
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 w-full min-w-0 rounded-lg border bg-transparent px-3.5 py-2 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2',
        className,
      )}
      {...props}
    />
  );
}

export { Input };