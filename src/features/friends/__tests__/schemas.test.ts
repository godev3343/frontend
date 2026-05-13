// src/features/friends/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  friendListItemSchema,
  paginatedSchema,
  profileEditSchema,
  publicUserSchema,
  userProfileSchema,
} from "../schemas";

/**
 * Бэк-shape для public-юзера (apps/social/serializers/...) использует
 * `public_name` (computed property через source). Фронт нормализует
 * в `display_name` через transform на границе.
 *
 * Аналогично avatar_url: бэк может прислать null или пустую строку —
 * мы нормализуем в '' (дефолт), потому что UI ожидает строку для <img src>.
 */
describe("friends schemas", () => {
  it("парсит публичного юзера c public_name → display_name", () => {
    const parsed = publicUserSchema.parse({
      id: 42,
      public_name: "Aibek",
      avatar_url: null,
      bio: "",
      points: 0,
    });
    expect(parsed.display_name).toBe("Aibek");
    // null → '' через .default('') в схеме
    expect(parsed.avatar_url).toBe("");
  });

  it("применяет default к отсутствующему avatar_url", () => {
    const parsed = publicUserSchema.parse({
      id: 1,
      public_name: "X",
      bio: "",
      points: 0,
    });
    expect(parsed.avatar_url).toBe("");
  });

  it("делает fallback на 'none' для невалидного friendship_status", () => {
    // Бэк отдаёт friendship_status как CharField (annotate'ом), не enum-валидируется.
    // Если придёт мусор — на фронте делаем fallback 'none', чтобы UI не падал.
    const parsed = userProfileSchema.parse({
      id: 1,
      public_name: "X",
      avatar_url: null,
      bio: "",
      points: 0,
      friendship_status: "garbage_value",
      friendship_id: null,
      friends_count: 0,
      checkins_count: 0,
    });
    expect(parsed.friendship_status).toBe("none");
  });

  it("парсит пагинированный ответ списка друзей (плоский User → Friendship)", () => {
    // GET /api/friends отдаёт FriendListItemSerializer — плоский User.
    // friendListItemSchema нормализует в Friendship: {id (synthetic), user, status, created_at}.
    const result = paginatedSchema(friendListItemSchema).parse({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 7,
          public_name: "Friend",
          avatar_url: null,
          bio: "",
          points: 10,
        },
      ],
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.user.display_name).toBe("Friend");
    expect(result.results[0]?.status).toBe("accepted");
  });
});

describe("profileEditSchema", () => {
  it("отклоняет слишком короткое имя", () => {
    const r = profileEditSchema.safeParse({ display_name: "X", bio: "", avatar_url: "" });
    expect(r.success).toBe(false);
  });

  it("отклоняет bio > 280 символов", () => {
    const r = profileEditSchema.safeParse({
      display_name: "Name",
      bio: "a".repeat(281),
      avatar_url: "",
    });
    expect(r.success).toBe(false);
  });

  it("принимает корректные значения", () => {
    const r = profileEditSchema.parse({
      display_name: "Aibek G.",
      bio: "Hello",
      avatar_url: "",
    });
    expect(r.display_name).toBe("Aibek G.");
  });

  it("тримит пробелы", () => {
    const r = profileEditSchema.parse({
      display_name: "  Aibek  ",
      bio: "  hi  ",
      avatar_url: "",
    });
    expect(r.display_name).toBe("Aibek");
    expect(r.bio).toBe("hi");
  });
});
