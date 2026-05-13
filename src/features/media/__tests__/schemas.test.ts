// src/features/media/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  formatValidationError,
  presignResponseSchema,
  validateImageFile,
} from "../schemas";

describe("validateImageFile", () => {
  it("принимает валидный jpeg в пределах лимита", () => {
    const file = new File([new Uint8Array(1024)], "photo.jpg", { type: "image/jpeg" });
    expect(validateImageFile(file)).toBeNull();
  });

  it("отклоняет неподдерживаемый тип", () => {
    const file = new File([new Uint8Array(10)], "doc.pdf", { type: "application/pdf" });
    expect(validateImageFile(file)).toEqual({
      code: "bad_type",
      allowed: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
    });
  });

  it("отклоняет слишком большой файл", () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], "huge.jpg", {
      type: "image/jpeg",
    });
    const err = validateImageFile(file);
    expect(err?.code).toBe("too_large");
  });

  it("форматирует размер в МБ", () => {
    const msg = formatValidationError({ code: "too_large", max_bytes: 10 * 1024 * 1024 });
    expect(msg).toContain("10 МБ");
  });
});

/**
 * Бэк presign response (apps/media/serializers/presign.py::PresignResponseSerializer):
 *   {asset_id, upload_url, key, expires_in}
 *
 * Поля public_url / expires_at / fields НЕ возвращаются — multipart fallback
 * на бэке не реализован, используется чистый PUT в R2.
 */
describe("presignResponseSchema", () => {
  it("парсит минимальный ответ бэка", () => {
    const parsed = presignResponseSchema.parse({
      asset_id: 42,
      key: "avatars/42/abc/original.jpg",
      upload_url: "https://r2.example.com/signed",
      expires_in: 300,
    });
    expect(parsed.asset_id).toBe(42);
    expect(parsed.key).toBe("avatars/42/abc/original.jpg");
    expect(parsed.expires_in).toBe(300);
  });

  it("отклоняет ответ без asset_id", () => {
    expect(() =>
      presignResponseSchema.parse({
        key: "avatars/42/abc/original.jpg",
        upload_url: "https://r2.example.com/signed",
        expires_in: 300,
      }),
    ).toThrow();
  });

  it("отклоняет ответ без expires_in", () => {
    expect(() =>
      presignResponseSchema.parse({
        asset_id: 42,
        key: "avatars/42/abc/original.jpg",
        upload_url: "https://r2.example.com/signed",
      }),
    ).toThrow();
  });
});
