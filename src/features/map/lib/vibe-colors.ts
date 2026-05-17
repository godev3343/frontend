// src/features/map/lib/vibe-colors.ts
import type { Vibe } from '@/features/map/schemas';

/**
 * Единый источник правды по цветам вайбов.
 * Используется маркерами на карте, VibeBadge, фильтрами, ачивками.
 *
 * Палитра v2 — OKLCH-палитра из прототипа go.html (design.md v2.0).
 * Принципы:
 *   - Lightness 0.74–0.82 (все вайбы равновесны по яркости)
 *   - Chroma 0.10–0.18 (приглушённые, не кислотные)
 *   - Hue разнесены по кругу для различимости
 *   - gaming сдвинут на hue=100 (yellow-green), чтобы не сливался с
 *     accent-лаймом (hue=130, используется для CTA-кнопок)
 *
 * MapLibre paint-properties поддерживают OKLCH в современных браузерах
 * (Chrome 111+, Safari 15.4+, Firefox 113+). Если потребуется
 * SSR-фоллбэк или работа в старых движках — добавить хелпер
 * convertOklchToHex и держать оба значения.
 *
 * Маппинг enum → vibe-имя из прототипа:
 *   calm       → chill   (blue)
 *   active     → active  (orange-red)
 *   productive → work    (violet)
 *   romantic   → love    (pink)
 *   musical    → music   (magenta)
 *   gaming     → новый   (yellow-green, hue=100)
 *   networking → zen     (mint)
 */
export const VIBE_COLORS: Record<Vibe, { hex: string; glow: string; label: string }> = {
  calm: {
    hex: 'oklch(0.78 0.10 230)',
    glow: 'oklch(0.78 0.10 230 / 0.45)',
    label: 'Спокойно',
  },
  active: {
    hex: 'oklch(0.74 0.18 35)',
    glow: 'oklch(0.74 0.18 35 / 0.45)',
    label: 'Движ',
  },
  productive: {
    hex: 'oklch(0.78 0.10 280)',
    glow: 'oklch(0.78 0.10 280 / 0.45)',
    label: 'Продуктивно',
  },
  romantic: {
    hex: 'oklch(0.78 0.14 360)',
    glow: 'oklch(0.78 0.14 360 / 0.45)',
    label: 'Романтично',
  },
  musical: {
    hex: 'oklch(0.78 0.18 320)',
    glow: 'oklch(0.78 0.18 320 / 0.45)',
    label: 'Музыка',
  },
  gaming: {
    hex: 'oklch(0.82 0.16 100)',
    glow: 'oklch(0.82 0.16 100 / 0.45)',
    label: 'Игры',
  },
  networking: {
    hex: 'oklch(0.82 0.12 165)',
    glow: 'oklch(0.82 0.12 165 / 0.45)',
    label: 'Нетворкинг',
  },
};

export const VIBE_LIST = Object.keys(VIBE_COLORS) as Vibe[];