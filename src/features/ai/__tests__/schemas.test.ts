// src/features/ai/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  aiRecommendationSchema,
  aiRequestSchema,
  aiResponseSchema,
} from "../schemas";

describe("aiRequestSchema", () => {
  it("accepts a normal query", () => {
    expect(aiRequestSchema.parse({ query: "тихое место" })).toEqual({
      query: "тихое место",
    });
  });

  it("rejects empty query", () => {
    expect(aiRequestSchema.safeParse({ query: "" }).success).toBe(false);
  });

  it("rejects query over 500 chars", () => {
    const long = "a".repeat(501);
    expect(aiRequestSchema.safeParse({ query: long }).success).toBe(false);
  });
});

describe("aiRecommendationSchema", () => {
  it("парсит реальный ответ бэка и нормализует place_id в string", () => {
    const data = {
      place_id: 90,
      name: "Astana Opera",
      reasoning: "Классическая музыка и оперные постановки.",
      vibe_match: ["musical", "calm", "romantic"],
    };
    const parsed = aiRecommendationSchema.parse(data);
    expect(parsed.place_id).toBe("90");
    expect(parsed.name).toBe("Astana Opera");
    expect(parsed.vibe_match).toBe("musical"); // primary
    expect(parsed.vibe_match_all).toEqual(["musical", "calm", "romantic"]);
  });

  it("vibe_match = null если массив пустой", () => {
    const data = { place_id: 1, name: "X", reasoning: "ok", vibe_match: [] };
    expect(aiRecommendationSchema.parse(data).vibe_match).toBeNull();
  });

  it("vibe_match по умолчанию [] если ключа нет", () => {
    const data = { place_id: 1, name: "X", reasoning: "ok" };
    const parsed = aiRecommendationSchema.parse(data);
    expect(parsed.vibe_match).toBeNull();
    expect(parsed.vibe_match_all).toEqual([]);
  });

  it("фильтрует неизвестные вайбы", () => {
    const data = {
      place_id: 1,
      name: "X",
      reasoning: "ok",
      vibe_match: ["spooky", "calm", "made_up"],
    };
    expect(aiRecommendationSchema.parse(data).vibe_match).toBe("calm");
  });

  it("rejects empty reasoning", () => {
    const data = { place_id: 1, name: "X", reasoning: "", vibe_match: [] };
    expect(aiRecommendationSchema.safeParse(data).success).toBe(false);
  });
});

describe("aiResponseSchema", () => {
  it("парсит ответ с items + request_id", () => {
    const data = {
      items: [
        { place_id: 90, name: "Opera", reasoning: "r1", vibe_match: ["calm"] },
        { place_id: 85, name: "Palace", reasoning: "r2", vibe_match: [] },
      ],
      request_id: 6,
    };
    const parsed = aiResponseSchema.parse(data);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.request_id).toBe(6);
  });

  it("принимает пустой items", () => {
    expect(
      aiResponseSchema.parse({ items: [], request_id: 1 }).items,
    ).toEqual([]);
  });
});