// src/features/ai/components/ai-nav-button.tsx
'use client';

import { Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';

import { useAiSheetStore } from '../lib/ai-sheet-store';

// см. ai-fab.tsx — lazy для уменьшения initial bundle на главной/ленте.
const AiChatSheet = dynamic(
  () => import('./ai-chat-sheet').then((m) => m.AiChatSheet),
  { ssr: false },
);

/**
 * Tab-bar entry that opens the same AiChatSheet.
 * Doesn't change route — opens an overlay on the current page.
 *
 * Состояние open живёт в общем zustand-сторе — VibeFilterBar и другие
 * элементы поверх карты могут на него подписываться.
 */
export function AiNavButton() {
  const open = useAiSheetStore((s) => s.open);
  const setOpen = useAiSheetStore((s) => s.setOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="AI-помощник"
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1',
          'min-h-11 transition-colors duration-200',
          'text-[color:var(--text-mute)] hover:text-primary',
        )}
      >
        <Sparkles className="size-6" strokeWidth={2} aria-hidden />
        <span className="text-xs font-medium">AI</span>
      </button>
      {open && <AiChatSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}