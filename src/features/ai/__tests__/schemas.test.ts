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
  it("parses full payload", () => {
    const data = {
      place_id: "place_abc",
      reasoning: "Тихо и уютно.",
      vibe_match: "calm",
    };
    expect(aiRecommendationSchema.parse(data)).toEqual(data);
  });

  it("defaults vibe_match to null when omitted", () => {
    const data = { place_id: "place_abc", reasoning: "ok" };
    expect(aiRecommendationSchema.parse(data).vibe_match).toBeNull();
  });

  it("accepts vibe_match: null explicitly", () => {
    const data = { place_id: "place_abc", reasoning: "ok", vibe_match: null };
    expect(aiRecommendationSchema.parse(data).vibe_match).toBeNull();
  });

  it("rejects unknown vibe", () => {
    const data = {
      place_id: "place_abc",
      reasoning: "ok",
      vibe_match: "spooky",
    };
    expect(aiRecommendationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects empty place_id", () => {
    const data = { place_id: "", reasoning: "ok" };
    expect(aiRecommendationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects empty reasoning", () => {
    const data = { place_id: "p1", reasoning: "" };
    expect(aiRecommendationSchema.safeParse(data).success).toBe(false);
  });
});

describe("aiResponseSchema", () => {
  it("parses a typical response", () => {
    const data = {
      recommendations: [
        { place_id: "p1", reasoning: "r1", vibe_match: "calm" },
        { place_id: "p2", reasoning: "r2", vibe_match: null },
      ],
    };
    expect(aiResponseSchema.parse(data).recommendations).toHaveLength(2);
  });

  it("accepts empty recommendations list", () => {
    expect(
      aiResponseSchema.parse({ recommendations: [] }).recommendations,
    ).toEqual([]);
  });

  it("rejects more than 10 recommendations", () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => ({
      place_id: `p${i}`,
      reasoning: "r",
      vibe_match: null,
    }));
    expect(
      aiResponseSchema.safeParse({ recommendations: tooMany }).success,
    ).toBe(false);
  });
});
