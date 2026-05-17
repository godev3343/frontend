// src/features/points/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  pointsPageSchema,
  pointsReasonSchema,
  pointsTransactionSchema,
} from "../schemas";

describe("pointsReasonSchema", () => {
  // После фикса B1 (см. REDESIGN_TODO) pointsReasonSchema — открытая
  // z.string(), а не z.enum. Это сделано чтобы фронт не падал zod-ошибкой
  // на новых значениях reason с бэка (бэкенд может добавить achievement,
  // review_posted, и т.д. без согласованной выкатки фронта).
  //
  // Поэтому здесь тестируем что:
  //   1. Известные значения принимаются как есть
  //   2. Произвольные значения тоже принимаются (открытый enum)
  //   3. Не-строки падают (это всё ещё контракт типа)

  it("принимает известные reason'ы как есть", () => {
    for (const r of ["checkin", "first_checkin", "friend_added"]) {
      expect(pointsReasonSchema.parse(r)).toBe(r);
    }
  });

  it("принимает произвольную строку (открытый enum)", () => {
    // Бэк может ввести новый reason без фронт-релиза — фронт не должен падать.
    expect(pointsReasonSchema.parse("review_posted")).toBe("review_posted");
    expect(pointsReasonSchema.parse("ufo_landing")).toBe("ufo_landing");
  });

  it("падает на не-строке", () => {
    expect(() => pointsReasonSchema.parse(42)).toThrow();
    expect(() => pointsReasonSchema.parse(null)).toThrow();
  });
});

describe("pointsTransactionSchema", () => {
  const base = {
    id: 1,
    delta: 5,
    reason: "checkin",
    ref_type: "checkin",
    ref_id: 42,
    created_at: "2026-05-13T10:00:00+00:00",
  };

  it("валидная транзакция", () => {
    const tx = pointsTransactionSchema.parse(base);
    expect(tx.delta).toBe(5);
    expect(tx.reason).toBe("checkin");
  });

  it("парсит friend_added (с ref_type=friendship)", () => {
    const tx = pointsTransactionSchema.parse({
      ...base,
      reason: "friend_added",
      ref_type: "friendship",
      ref_id: 4,
    });
    expect(tx.reason).toBe("friend_added");
  });

  it("ref_id может быть null", () => {
    const tx = pointsTransactionSchema.parse({ ...base, ref_id: null });
    expect(tx.ref_id).toBeNull();
  });

  it("ref_type по умолчанию пустая строка", () => {
    const { ref_type: _omit, ...rest } = base;
    const tx = pointsTransactionSchema.parse(rest);
    expect(tx.ref_type).toBe("");
  });

  it("delta может быть отрицательной", () => {
    const tx = pointsTransactionSchema.parse({ ...base, delta: -10 });
    expect(tx.delta).toBe(-10);
  });

  it("падает на не-ISO дате", () => {
    expect(() =>
      pointsTransactionSchema.parse({ ...base, created_at: "вчера" }),
    ).toThrow();
  });

  it("падает на нецелом delta", () => {
    expect(() =>
      pointsTransactionSchema.parse({ ...base, delta: 5.5 }),
    ).toThrow();
  });
});

describe("pointsPageSchema", () => {
  it("парсит пустой результат", () => {
    const page = pointsPageSchema.parse({
      next: null,
      previous: null,
      results: [],
    });
    expect(page.results).toHaveLength(0);
  });

  it("парсит страницу с next-cursor", () => {
    const page = pointsPageSchema.parse({
      next: "https://api.example.com/api/users/me/points?cursor=cD0yMDI2",
      previous: null,
      results: [
        {
          id: 1,
          delta: 5,
          reason: "checkin",
          ref_type: "checkin",
          ref_id: 42,
          created_at: "2026-05-13T10:00:00+00:00",
        },
      ],
    });
    expect(page.next).toContain("cursor=");
    expect(page.results).toHaveLength(1);
  });

  it("падает на отсутствие results", () => {
    expect(() =>
      pointsPageSchema.parse({ next: null, previous: null }),
    ).toThrow();
  });
});