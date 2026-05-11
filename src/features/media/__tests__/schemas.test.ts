// src/features/media/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  formatValidationError,
  MAX_UPLOAD_BYTES,
  presignResponseSchema,
  validateImageFile,
} from "../schemas";

function fakeFile(opts: { type: string; size: number; name?: string }): File {
  const blob = new Blob([new Uint8Array(opts.size)], { type: opts.type });
  return new File([blob], opts.name ?? "test.jpg", { type: opts.type });
}

describe("validateImageFile", () => {
  it("принимает валидный jpeg в пределах лимита", () => {
    expect(validateImageFile(fakeFile({ type: "image/jpeg", size: 1024 }))).toBeNull();
  });

  it("отклоняет неподдерживаемый тип", () => {
    const err = validateImageFile(fakeFile({ type: "image/gif", size: 1024 }));
    expect(err?.code).toBe("bad_type");
  });

  it("отклоняет слишком большой файл", () => {
    const err = validateImageFile(
      fakeFile({ type: "image/jpeg", size: MAX_UPLOAD_BYTES + 1 }),
    );
    expect(err?.code).toBe("too_large");
  });
});

describe("formatValidationError", () => {
  it("форматирует размер в МБ", () => {
    const msg = formatValidationError({ code: "too_large", max_bytes: MAX_UPLOAD_BYTES });
    expect(msg).toContain("10");
  });
});

describe("presignResponseSchema", () => {
  it("парсит ответ без fields", () => {
    const parsed = presignResponseSchema.parse({
      key: "u/avatar/abc.jpg",
      upload_url: "https://r2.example.com/signed",
      public_url: "https://cdn.example.com/u/avatar/abc.jpg",
      expires_at: "2026-05-12T12:00:00Z",
    });
    expect(parsed.fields).toBeUndefined();
  });

  it("парсит ответ с fields (POST multipart)", () => {
    const parsed = presignResponseSchema.parse({
      key: "u/avatar/abc.jpg",
      upload_url: "https://r2.example.com/",
      fields: { policy: "p", "x-amz-signature": "sig" },
      public_url: "https://cdn.example.com/u/avatar/abc.jpg",
      expires_at: "2026-05-12T12:00:00Z",
    });
    expect(parsed.fields).toBeDefined();
  });
});
