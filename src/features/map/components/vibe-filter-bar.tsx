// src/features/map/components/vibe-filter-bar.tsx
"use client";

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
 * v2 (OKLCH-палитра + scroll-indicator):
 *   - bg-gray-900/85 → bg-card/85 (наш surface через токен)
 *   - border-gray-700/50 → border-border
 *   - bg-gray-800/60 → bg-secondary/60 (наш surface-hi)
 *   - text-gray-200 → text-foreground
 *   - text-gray-900 → text-background (тёмный текст на цветном vibe-фоне)
 *
 * Скролл:
 *   - 7 вайбов + разделитель + «События» = 8 чипов, не помещается на mobile.
 *   - overflow-x-auto + scrollbar скрыт (как было).
 *   - Дополнительно: fade-маска справа (CSS mask) — визуальный сигнал
 *     что есть ещё контент справа, юзер должен проскроллить.
 */
export function VibeFilterBar({ showEvents, onToggleEvents }: Props) {
  const { selected, toggle } = useVibeFilter();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3">
      <div
        className={cn(
          "pointer-events-auto flex gap-2 overflow-x-auto rounded-full p-1.5 shadow-lg",
          "bg-card/85 border border-border backdrop-blur-md",
          // Скрыть скроллбар — кросс-браузерно.
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Fade-маска справа: подсказка что есть ещё контент.
          // Слева не делаем, потому что в начале скролла никакой fade не нужен,
          // а CSS-логика «fade только когда скроллнули» требует JS или :has(.scrolled),
          // что переусложнит. Правый fade — постоянный, его достаточно.
          "[mask-image:linear-gradient(to_right,black_85%,transparent_100%)]",
          "[-webkit-mask-image:linear-gradient(to_right,black_85%,transparent_100%)]",
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
                // Активный фон — vibe-color через CSS-переменную (OKLCH).
                // borderColor совпадает с фоном — кнопка читается как solid pill.
                isActive
                  ? { backgroundColor: color.hex, borderColor: color.hex }
                  : undefined
              }
            >
              {color.label}
            </button>
          );
        })}

        {/* Тонкий вертикальный разделитель между вайбами и событиями. */}
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