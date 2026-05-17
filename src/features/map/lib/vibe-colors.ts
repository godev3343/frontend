// src/features/map/lib/vibe-colors.ts
import type { Vibe } from '@/features/map/schemas';

/**
 * Единый источник правды по vibe-цветам И лейблам.
 *
 * Структура: { value, glow, label }
 *   - value — основной OKLCH-цвет (был `.hex`, но содержит OKLCH-строку, не hex)
 *   - glow — тот же цвет с alpha=0.45 для теней/радиальных blob'ов на карте
 *   - label — русскоязычное имя для UI (фильтры, бейджи, фолбэки)
 *
 * ИСТОЧНИК ПРАВДЫ ДЛЯ ЛЕЙБЛОВ.
 *   `vibe-badge.tsx` имеет свой VIBE_ICONS (Lucide-иконки),
 *   но labels берёт ОТСЮДА — чтобы маркер на карте, фильтр и бейдж
 *   в карточке места показывали одинаковую подпись (раньше расходились:
 *   карта писала "Движ", бейдж "Активно" — один вайб, две надписи).
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
 */
export const VIBE_COLORS: Record<Vibe, { value: string; glow: string; label: string }> = {
  calm: {
    value: 'oklch(0.78 0.10 230)',
    glow: 'oklch(0.78 0.10 230 / 0.45)',
    label: 'Спокойно',
  },
  active: {
    value: 'oklch(0.74 0.18 35)',
    glow: 'oklch(0.74 0.18 35 / 0.45)',
    label: 'Движ',
  },
  productive: {
    value: 'oklch(0.78 0.10 280)',
    glow: 'oklch(0.78 0.10 280 / 0.45)',
    label: 'Продуктивно',
  },
  romantic: {
    value: 'oklch(0.78 0.14 360)',
    glow: 'oklch(0.78 0.14 360 / 0.45)',
    label: 'Романтично',
  },
  musical: {
    value: 'oklch(0.78 0.18 320)',
    glow: 'oklch(0.78 0.18 320 / 0.45)',
    label: 'Музыка',
  },
  gaming: {
    value: 'oklch(0.82 0.16 100)',
    glow: 'oklch(0.82 0.16 100 / 0.45)',
    label: 'Игры',
  },
  networking: {
    value: 'oklch(0.82 0.12 165)',
    glow: 'oklch(0.82 0.12 165 / 0.45)',
    label: 'Нетворкинг',
  },
};

export const VIBE_LIST = Object.keys(VIBE_COLORS) as Vibe[];

export function getFeaturedGradient(vibes: readonly Vibe[]): string | null {
  if (vibes.length === 0) return null;
  const a = vibes[0]!;
  const b = vibes[1] ?? a; // 1 вайб → дублируем
  const colorA = VIBE_COLORS[a].value;
  const colorB = VIBE_COLORS[b].value;
  return [
    `radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, ${colorA} 60%, transparent), transparent 60%)`,
    `radial-gradient(80% 80% at 100% 100%, color-mix(in oklab, ${colorB} 45%, transparent), transparent 60%)`,
  ].join(", ");
}

/**
 * Градиент для шапки профиля. См. profile-header.tsx.
 * 0 vibes → lime fade, 1 → vibe + lime, 2+ → как featured но мягче.
 */
export function getProfileGradient(vibes: readonly Vibe[]): string {
  const accent = "oklch(0.88 0.18 130)";

  if (vibes.length === 0) {
    return `radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, ${accent} 35%, transparent), transparent 60%)`;
  }

  const a = VIBE_COLORS[vibes[0]!].value;
  if (vibes.length === 1) {
    return [
      `radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, ${a} 50%, transparent), transparent 60%)`,
      `radial-gradient(80% 80% at 100% 100%, color-mix(in oklab, ${accent} 25%, transparent), transparent 60%)`,
    ].join(", ");
  }

  const b = VIBE_COLORS[vibes[1]!].value;
  return [
    `radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, ${a} 45%, transparent), transparent 60%)`,
    `radial-gradient(80% 80% at 100% 100%, color-mix(in oklab, ${b} 30%, transparent), transparent 60%)`,
  ].join(", ");
}