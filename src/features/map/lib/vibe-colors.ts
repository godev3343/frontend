// src/features/map/lib/vibe-colors.ts
import type { Vibe } from "@/features/map/schemas";

/**
 * Единый источник правды по цветам вайбов.
 * Используется маркерами на карте, VibeBadge, фильтрами.
 * Цвета взяты из design.md (Primary Purple / Accent Pink / Energy Orange / Info Blue
 * + Emotional Traces).
 */
export const VIBE_COLORS: Record<Vibe, { hex: string; glow: string; label: string }> = {
  calm: { hex: "#10b981", glow: "rgba(16,185,129,0.45)", label: "Спокойно" },
  active: { hex: "#fb923c", glow: "rgba(251,146,60,0.45)", label: "Активно" },
  productive: { hex: "#3b82f6", glow: "rgba(59,130,246,0.45)", label: "Продуктивно" },
  romantic: { hex: "#ec4899", glow: "rgba(236,72,153,0.45)", label: "Романтично" },
  musical: { hex: "#a855f7", glow: "rgba(168,85,247,0.45)", label: "Музыкально" },
  gaming: { hex: "#d946ef", glow: "rgba(217,70,239,0.45)", label: "Игровой" },
  networking: { hex: "#06b6d4", glow: "rgba(6,182,212,0.45)", label: "Networking" },
};

export const VIBE_LIST = Object.keys(VIBE_COLORS) as Vibe[];
