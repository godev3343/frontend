// src/features/map/__tests__/schemas.test.ts
import { describe, expect,it } from "vitest";

import {
  bboxSchema,
  placeDetailSchema,
  placeMarkerSchema,
  placesPageSchema,
  vibeSchema,
} from "@/features/map/schemas";

describe("vibeSchema", () => {
  it("принимает валидные вайбы", () => {
    expect(vibeSchema.parse("calm")).toBe("calm");
    expect(vibeSchema.parse("networking")).toBe("networking");
  });

  it("отклоняет неизвестные вайбы", () => {
    expect(() => vibeSchema.parse("party")).toThrow();
  });
});

describe("bboxSchema", () => {
  it("парсит [lngMin, latMin, lngMax, latMax]", () => {
    expect(bboxSchema.parse([71.3, 51.1, 71.5, 51.2])).toEqual([
      71.3, 51.1, 71.5, 51.2,
    ]);
  });

  it("отклоняет неправильный размер", () => {
    expect(() => bboxSchema.parse([1, 2, 3])).toThrow();
  });
});

describe("placeMarkerSchema", () => {
  it("парсит минимальный маркер", () => {
    const parsed = placeMarkerSchema.parse({
      id: "p1",
      name: "Coffee Boom",
      location: { lat: 51.169, lng: 71.449 },
      primary_vibe: "calm",
    });
    expect(parsed.category).toBeNull();
    expect(parsed.primary_vibe).toBe("calm");
  });
});

describe("placeDetailSchema", () => {
  it("заполняет дефолты для опциональных полей", () => {
    const parsed = placeDetailSchema.parse({
      id: "p1",
      name: "Studio",
      location: { lat: 51.169, lng: 71.449 },
      primary_vibe: "productive",
    });
    expect(parsed.vibes).toEqual([]);
    expect(parsed.photos).toEqual([]);
    expect(parsed.address).toBeNull();
  });
});

describe("placesPageSchema", () => {
  it("парсит cursor-paginated ответ", () => {
    const parsed = placesPageSchema.parse({
      results: [
        {
          id: "p1",
          name: "Place",
          location: { lat: 51, lng: 71 },
          primary_vibe: "active",
        },
      ],
      next: null,
      previous: null,
    });
    expect(parsed.results).toHaveLength(1);
  });
});
