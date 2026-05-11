// src/lib/api/show-error.ts
import { toast } from 'sonner';

import { extractError } from './client';

/** Удобная обёртка: распаковать ошибку и показать тост. */
export async function showError(err: unknown): Promise<void> {
  const { detail } = await extractError(err);
  toast.error(detail);
}