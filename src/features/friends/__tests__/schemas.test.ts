// src/features/friends/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  friendshipSchema,
  paginatedSchema,
  profileEditSchema,
  publicUserSchema,
  userProfileSchema,
} from "../schemas";

describe("friends schemas", () => {
  it("парсит публичного юзера с пустыми полями", () => {
    const parsed = publicUserSchema.parse({
      id: 1,
      display_name: "Aibek",
      avatar_url: null,
      bio: "",
      points: 0,
    });
    expect(parsed.display_name).toBe("Aibek");
    expect(parsed.avatar_url).toBeNull();
  });
    it("применяет default к отсутствующему avatar_url", () => {
    const parsed = publicUserSchema.parse({
      id: 1,
      display_name: "Aibek",
      bio: "",
      points: 0,
      // avatar_url не передаём
    });
    expect(parsed.avatar_url).toBe("");
  });

  it("отклоняет UserProfile с невалидным friendship_status", () => {
    expect(() =>
      userProfileSchema.parse({
        id: 1,
        display_name: "X",
        avatar_url: "",
        bio: "",
        points: 0,
        friendship_status: "buddy", // невалидный
        friendship_id: null,
        friends_count: 0,
        checkins_count: 0,
      }),
    ).toThrow();
  });

  it("парсит пагинированный ответ", () => {
    const result = paginatedSchema(friendshipSchema).parse({
      next: "http://api/friends?cursor=abc",
      previous: null,
      results: [
        {
          id: 10,
          status: "accepted",
          created_at: "2025-01-01T00:00:00Z",
          user: {
            id: 2,
            display_name: "Friend",
            avatar_url: "",
            bio: "",
            points: 5,
          },
        },
      ],
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.user.display_name).toBe("Friend");
  });

  describe("profileEditSchema", () => {
    it("отклоняет слишком короткое имя", () => {
      const result = profileEditSchema.safeParse({
        display_name: "a",
        bio: "",
      });
      expect(result.success).toBe(false);
    });

    it("отклоняет bio > 280 символов", () => {
      const result = profileEditSchema.safeParse({
        display_name: "Valid",
        bio: "x".repeat(281),
      });
      expect(result.success).toBe(false);
    });

    it("принимает корректные значения", () => {
      const result = profileEditSchema.safeParse({
        display_name: "Aibek Nurlan",
        bio: "Hello",
      });
      expect(result.success).toBe(true);
    });

    it("тримит пробелы", () => {
      const result = profileEditSchema.parse({
        display_name: "  Aibek  ",
        bio: "  hi  ",
      });
      expect(result.display_name).toBe("Aibek");
      expect(result.bio).toBe("hi");
    });
  });
});