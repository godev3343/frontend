// src/features/media/compress.ts
// Динамический импорт, чтобы либа не попала в bundle страниц без аплоада.

import { MAX_RESIZE_DIMENSION } from "./schemas";

export async function compressImage(file: File): Promise<File> {
  // Не сжимаем PNG (может потерять прозрачность в некоторых режимах),
  // и не трогаем мелкие файлы.
  if (file.size < 1024 * 1024) return file;
  if (file.type === "image/png") return file;

  const mod = await import("browser-image-compression");
  const compress = mod.default;

  const compressed = await compress(file, {
    maxSizeMB: 8,
    maxWidthOrHeight: MAX_RESIZE_DIMENSION,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: file.type,
  });

  // Тайпинги либы говорят File, но в рантайме на некоторых браузерах прилетает Blob.
  // Нормализуем без instanceof-проверки, чтобы TS не сужал до never.
  const result = compressed as File | Blob;
  if ("name" in result && "lastModified" in result) return result as File;
  return new File([result], file.name, { type: result.type || file.type });
}
