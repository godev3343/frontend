// src/components/shared/empty-state.tsx
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Унифицированный empty state. Использовать когда:
 *  - данные загружены, но массив пустой
 *  - поиск не нашёл ничего
 *  - нет доступа (например, denied геолокация — тогда action = «Разрешить»)
 *
 * Skeleton/loading — НЕ сюда, это loading.tsx. Ошибка — error.tsx.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
      role="status"
    >
      {Icon && (
        <div className="mb-1 rounded-2xl bg-secondary p-3">
          <Icon className="size-7 text-muted-foreground" aria-hidden />
        </div>
      )}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}