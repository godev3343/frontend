// src/features/ai/lib/ai-sheet-store.ts
import { create } from 'zustand';

/**
 * AI-Sheet — глобальный флаг открытости.
 *
 * Зачем стор для одного boolean'а:
 *   Sheet триггерится из двух мест — FAB на карте (city-map.tsx) и
 *   BottomNav (ai-nav-button.tsx). Они в разных ветках дерева, общий
 *   родитель — корневой layout. Через стор оба триггера читают/пишут
 *   один и тот же флаг, и любой третий компонент (VibeFilterBar)
 *   может на него подписаться чтобы скрыться.
 *
 * Alternatively could be React Context на (app)/layout.tsx, но у нас
 * уже подключён zustand — нет смысла плодить второй паттерн глобального
 * стейта в одном проекте.
 */
interface AiSheetState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useAiSheetStore = create<AiSheetState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));