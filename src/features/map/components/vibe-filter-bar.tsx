// src/features/map/components/vibe-filter-bar.tsx
"use client";

import { useVibeFilter } from "@/features/map/hooks/use-vibe-filter";
import { VIBE_COLORS, VIBE_LIST } from "@/features/map/lib/vibe-colors";
import { cn } from "@/lib/utils";

interface Props {
  showEvents: boolean;
  onToggleEvents: () => void;
}

export function VibeFilterBar({ showEvents, onToggleEvents }: Props) {
  const { selected, toggle } = useVibeFilter();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3">
      <div className="pointer-events-auto flex gap-2 overflow-x-auto rounded-full bg-gray-900/85 p-1.5 backdrop-blur-md border border-gray-700/50 shadow-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                "border border-gray-700/50",
                isActive
                  ? "text-gray-900"
                  : "bg-gray-800/60 text-gray-200 hover:bg-gray-700/70",
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
        <div className="w-px shrink-0 self-stretch bg-gray-700/60" />
        <button
          type="button"
          onClick={onToggleEvents}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
            "border border-gray-700/50",
            showEvents
              ? "bg-purple-500 text-white border-purple-500"
              : "bg-gray-800/60 text-gray-200 hover:bg-gray-700/70",
          )}
        >
          События
        </button>
      </div>
    </div>
  );
}
