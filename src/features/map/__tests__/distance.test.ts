// src/features/map/__tests__/distance.test.ts
import { describe, expect,it } from "vitest";

import { CHECKIN_RADIUS_METERS,haversineMeters } from "@/features/map/lib/distance";

describe("haversineMeters", () => {
  it("даёт 0 для одинаковых точек", () => {
    const p = { lat: 51.169, lng: 71.449 };
    expect(haversineMeters(p, p)).toBeLessThan(0.001);
  });

  it("даёт ~111 км для 1 градуса по широте", () => {
    const a = { lat: 51, lng: 71 };
    const b = { lat: 52, lng: 71 };
    const d = haversineMeters(a, b);
    expect(d).toBeGreaterThan(111_000);
    expect(d).toBeLessThan(112_000);
  });

  it("различает соседние точки в пределах 100м", () => {
    const a = { lat: 51.169, lng: 71.449 };
    // ~50м на восток
    const b = { lat: 51.169, lng: 71.4497 };
    const d = haversineMeters(a, b);
    expect(d).toBeLessThan(CHECKIN_RADIUS_METERS);
    expect(d).toBeGreaterThan(30);
  });
});
