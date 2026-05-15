// src/features/events/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  eventDetailSchema,
  eventMarkerSchema,
  eventsPageSchema,
  rsvpResponseSchema,
} from "./schemas";

const baseMarker = {
  id: "evt_1",
  title: "Test concert",
  category: "concert" as const,
  vibes: ["musical"],
  cover_url: "https://cdn/x.jpg",
  starts_at: "2026-06-01T18:00:00Z",
  ends_at: null,
  location: null,
  place: null,
  price: "от 5000 ₸",
  attendees_count: { going: 10, interested: 4 },
  user_rsvp: null,
};

describe("eventMarkerSchema", () => {
    it("accepts attendees_count as plain number (backend pre-MVP format)", () => {
    const ok = { ...baseMarker, attendees_count: 5 };
    const res = eventMarkerSchema.safeParse(ok);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.attendees_count).toEqual({ going: 5, interested: 0 });
    }
  });
  it("parses minimal event", () => {
    expect(() => eventMarkerSchema.parse(baseMarker)).not.toThrow();
  });

  it("rejects negative attendees count", () => {
    const bad = { ...baseMarker, attendees_count: { going: -1, interested: 0 } };
    expect(eventMarkerSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects unknown category", () => {
    const bad = { ...baseMarker, category: "rave" };
    expect(eventMarkerSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts user_rsvp = 'going'", () => {
    const ok = { ...baseMarker, user_rsvp: "going" };
    expect(eventMarkerSchema.safeParse(ok).success).toBe(true);
  });
});

describe("eventDetailSchema", () => {
  it("parses with organizer", () => {
    const detail = {
      ...baseMarker,
      description: "Long text",
      organizer: { id: "u1", display_name: "Org", avatar_url: null },
      url: null,
    };
    expect(() => eventDetailSchema.parse(detail)).not.toThrow();
  });
});

describe("eventsPageSchema", () => {
  it("parses DRF cursor page", () => {
    const page = { next: null, previous: null, results: [baseMarker] };
    expect(() => eventsPageSchema.parse(page)).not.toThrow();
  });
});

describe("rsvpResponseSchema", () => {
  it("parses 'none' as valid status", () => {
    expect(rsvpResponseSchema.parse({ status: "none" }).status).toBe("none");
  });
});
