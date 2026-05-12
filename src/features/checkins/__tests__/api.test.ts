// src/features/checkins/__tests__/api.test.ts
import { describe, expect, it } from "vitest";

import { extractCursor } from "../cursor";

describe("extractCursor", () => {
  it("returns null for null input", () => {
    expect(extractCursor(null)).toBeNull();
  });

  it("extracts cursor query param", () => {
    expect(
      extractCursor("https://api.example.com/feed?cursor=abc123"),
    ).toBe("abc123");
  });

  it("returns null when cursor is absent", () => {
    expect(extractCursor("https://api.example.com/feed")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(extractCursor("not a url")).toBeNull();
  });
});
