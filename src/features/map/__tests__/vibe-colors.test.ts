// src/features/map/__tests__/vibe-colors.test.ts
import { describe, expect, it } from "vitest";

import { VIBE_COLORS, VIBE_LIST } from "@/features/map/lib/vibe-colors";
import { vibeSchema } from "@/features/map/schemas";

describe("VIBE_COLORS", () => {
  it("покрывает все вайбы из схемы", () => {
    const schemaVibes = vibeSchema.options;
    expect(VIBE_LIST.sort()).toEqual([...schemaVibes].sort());
  });

  it("каждый вайб имеет цвет (OKLCH), glow и непустой label", () => {
    // Поле называется `hex` исторически (см. REDESIGN_TODO долг A2),
    // но после миграции на OKLCH содержит oklch-строки.
    // Принимаем как oklch(...), так и hex (на случай ручных fallback'ов).
    const colorFormat = /^(oklch\(|#[0-9a-fA-F]{6})/;
    // glow может быть rgba(...) (старый формат) или oklch(...) с alpha.
    const glowFormat = /^(rgba\(|oklch\()/;

    for (const v of VIBE_LIST) {
      const c = VIBE_COLORS[v];
      expect(c.hex, `vibe=${v}`).toMatch(colorFormat);
      expect(c.glow, `vibe=${v}`).toMatch(glowFormat);
      expect(c.label.length, `vibe=${v}`).toBeGreaterThan(0);
    }
  });
});