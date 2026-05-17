// src/features/map/components/vibe-filter-bar.tsx
"use client";

import { ToggleChip } from "@/components/ui/toggle-chip";
import { useAiSheetStore } from "@/features/ai/lib/ai-sheet-store";
import { useVibeFilter } from "@/features/map/hooks/use-vibe-filter";
import { VIBE_COLORS, VIBE_LIST } from "@/features/map/lib/vibe-colors";
import { cn } from "@/lib/utils";

interface Props {
  showEvents: boolean;
  onToggleEvents: () => void;
}

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
            <ToggleChip
              key={vibe}
              active={isActive}
              activeColor={color.value}
              size="sm"
              onClick={() => toggle(vibe)}
            >
              {color.label}
            </ToggleChip>
          );
        })}

        <div className="w-px shrink-0 self-stretch bg-border" />

        <ToggleChip
          active={showEvents}
          size="sm"
          onClick={onToggleEvents}
        >
          События
        </ToggleChip>
      </div>
    </div>
  );
}