import type { Vibe } from "@/features/map/schemas";

/**
 * Процент совпадения вайбов двух юзеров — Jaccard-индекс:
 * |пересечение| / |объединение| * 100. Симметричен (одно и то же число
 * с обеих сторон), 100% при идентичных наборах, 0% при отсутствии общих.
 *
 * null — если у любого из двоих нет вайбов: считать «совпадение» не из чего,
 * и UI покажет прочерк вместо вводящих в заблуждение 0%.
 */
export function vibeMatchPercent(
  a: readonly Vibe[],
  b: readonly Vibe[],
): number | null {
  if (a.length === 0 || b.length === 0) return null;

  const setB = new Set(b);
  const intersection = a.filter((v) => setB.has(v)).length;
  const union = new Set([...a, ...b]).size;

  return Math.round((intersection / union) * 100);
}