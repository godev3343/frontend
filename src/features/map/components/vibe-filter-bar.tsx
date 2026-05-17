// src/features/map/components/vibe-filter-bar.tsx
"use client";

import { useAiSheetStore } from "@/features/ai/lib/ai-sheet-store";
import { useVibeFilter } from "@/features/map/hooks/use-vibe-filter";
import { VIBE_COLORS, VIBE_LIST } from "@/features/map/lib/vibe-colors";
import { cn } from "@/lib/utils";

interface Props {
  showEvents: boolean;
  onToggleEvents: () => void;
}

/**
 * VibeFilterBar — горизонтальный скролл-стрип с фильтрами по вайбам + переключатель событий.
 *
 * Скрывается с fade-out когда открыт AI-Sheet (читает useAiSheetStore).
 * Иначе фильтры торчат на фоне AI-чата и сбивают фокус — юзер в AI
 * формулирует запрос, фильтры карты в этот момент смысловой шум.
 */
export function VibeFilterBar({ showEvents, onToggleEvents }: Props) {
  const { selected, toggle } = useVibeFilter();
  const aiOpen = useAiSheetStore((s) => s.open);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3",
        "transition-all duration-200 ease-out",
        aiOpen && "-translate-y-2 opacity-0",
      )}
      aria-hidden={aiOpen}
    >
      <div
        className={cn(
          "pointer-events-auto flex gap-2 overflow-x-auto rounded-full p-1.5 shadow-lg",
          "bg-card/85 border border-border backdrop-blur-md",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "[mask-image:linear-gradient(to_right,black_85%,transparent_100%)]",
          "[-webkit-mask-image:linear-gradient(to_right,black_85%,transparent_100%)]",
          aiOpen && "pointer-events-none",
        )}
      >
        {VIBE_LIST.map((vibe) => {
          const isActive = selected.includes(vibe);
          const color = VIBE_COLORS[vibe];
          return (
            <button
              key={vibe}
              type="button"
              onClick={() => toggle(vibe)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                "border",
                isActive
                  ? "text-background border-transparent"
                  : "bg-secondary/60 text-foreground border-border hover:bg-secondary",
              )}
              style={
                isActive
                  ? { backgroundColor: color.hex, borderColor: color.hex }
                  : undefined
              }
            >
              {color.label}
            </button>
          );
        })}

        <div className="w-px shrink-0 self-stretch bg-border" />

        <button
          type="button"
          onClick={onToggleEvents}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
            "border",
            showEvents
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary/60 text-foreground border-border hover:bg-secondary",
          )}
        >
          События
        </button>
      </div>
    </div>
  );
}