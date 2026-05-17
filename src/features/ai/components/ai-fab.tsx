// src/features/ai/components/ai-fab.tsx
'use client';

import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useAiSheetStore } from '../lib/ai-sheet-store';

interface Props {
  className?: string;
}

/**
 * AI-FAB — кнопка-триггер AI-помощника поверх карты.
 *
 * Сам Sheet НЕ рендерит — только пишет в zustand-стор. Sheet рендерится
 * глобально в BottomNav (ai-nav-button.tsx), это единственный инстанс
 * AiChatSheet в приложении. Иначе при одновременном open=true от двух
 * триггеров получится два наложенных Sheet.
 */
export function AiFab({ className }: Props) {
  const setOpen = useAiSheetStore((s) => s.setOpen);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Открыть AI-помощник"
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-full border',
        'bg-primary text-primary-foreground border-primary/40 shadow-glow-accent-center',
        'transition-all hover:brightness-105 active:opacity-90',
        'pointer-events-auto',
        className,
      )}
    >
      <Sparkles className="size-5" aria-hidden />
    </button>
  );
}