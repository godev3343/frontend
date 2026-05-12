// src/features/checkins/cursor.ts

/** Izvlekaet `cursor` iz absolyutnogo URL DRF-kursornoi paginatsii. */
export function extractCursor(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("cursor");
  } catch {
    return null;
  }
}
