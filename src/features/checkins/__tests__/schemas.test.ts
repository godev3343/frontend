// src/features/checkins/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  checkinSchema,
  checkinsPageSchema,
  createCheckinSchema,
} from "../schemas";

const validCheckin = {
  id: "c_1",
  place: {
    id: "p_1",
    name: "Coffee Boom",
    location: { lat: 51.13, lng: 71.41 },
    primary_vibe: "calm",
    category: null,
  },
  author: {
    id: "u_1",
    display_name: "Alex",
    avatar_url: null,
  },
  comment: "good",
  photo_url: null,
  photo_feed_url: null,
  created_at: "2026-05-12T10:00:00Z",
  likes_count: 3,
  is_liked: false,
};

describe("checkinSchema", () => {
  it("parses minimal valid checkin", () => {
    const r = checkinSchema.safeParse(validCheckin);
    expect(r.success).toBe(true);
  });

  it("rejects negative likes_count", () => {
    const r = checkinSchema.safeParse({ ...validCheckin, likes_count: -1 });
    expect(r.success).toBe(false);
  });

  it("accepts optional points_delta", () => {
    const r = checkinSchema.safeParse({ ...validCheckin, points_delta: 5 });
    expect(r.success).toBe(true);
  });
});

describe("createCheckinSchema", () => {
  it("accepts nullable photo_key and comment", () => {
    const r = createCheckinSchema.safeParse({
      place_id: "p_1",
      lat: 51.1,
      lng: 71.4,
      photo_key: null,
      comment: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects comment > 500", () => {
    const r = createCheckinSchema.safeParse({
      place_id: "p_1",
      lat: 51.1,
      lng: 71.4,
      comment: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty place_id", () => {
    const r = createCheckinSchema.safeParse({
      place_id: "",
      lat: 51.1,
      lng: 71.4,
    });
    expect(r.success).toBe(false);
  });
});

describe("checkinsPageSchema", () => {
  it("parses page with next cursor", () => {
    const r = checkinsPageSchema.safeParse({
      next: "https://api/feed?cursor=abc",
      previous: null,
      results: [validCheckin],
    });
    expect(r.success).toBe(true);
  });
});
