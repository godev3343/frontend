// src/features/map/__tests__/vibe-colors.test.ts
import { describe, expect,it } from "vitest";

import { VIBE_COLORS, VIBE_LIST } from "@/features/map/lib/vibe-colors";
import { vibeSchema } from "@/features/map/schemas";

describe("VIBE_COLORS", () => {
  it("покрывает все вайбы из схемы", () => {
    const schemaVibes = vibeSchema.options;
    expect(VIBE_LIST.sort()).toEqual([...schemaVibes].sort());
  });

  it("каждый вайб имеет hex, glow и label", () => {
    for (const v of VIBE_LIST) {
      const c = VIBE_COLORS[v];
      expect(c.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.glow).toMatch(/^rgba\(/);
      expect(c.label.length).toBeGreaterThan(0);
    }
  });
});
