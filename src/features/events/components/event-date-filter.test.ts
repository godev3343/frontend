// src/features/events/components/event-date-filter.test.ts
import { describe, expect, it } from "vitest";

import { presetToRange } from "./event-date-filter";

describe("presetToRange", () => {
  const fixed = new Date("2026-05-12T10:30:00Z"); // вторник

  it("today: from = start of day, to = end of day", () => {
    const r = presetToRange("today", fixed);
    expect(r).not.toBeNull();
    expect(new Date(r!.from).getUTCHours()).toBeLessThanOrEqual(23);
    expect(new Date(r!.to).getTime()).toBeGreaterThan(new Date(r!.from).getTime());
  });

  it("week ends later than today", () => {
    const today = presetToRange("today", fixed)!;
    const week = presetToRange("week", fixed)!;
    expect(new Date(week.to).getTime()).toBeGreaterThanOrEqual(
      new Date(today.to).getTime(),
    );
  });

  it("month ends later than week", () => {
    const week = presetToRange("week", fixed)!;
    const month = presetToRange("month", fixed)!;
    expect(new Date(month.to).getTime()).toBeGreaterThanOrEqual(
      new Date(week.to).getTime(),
    );
  });

  it("all returns null", () => {
    expect(presetToRange("all", fixed)).toBeNull();
  });
});
