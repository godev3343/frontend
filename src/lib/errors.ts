// src/lib/errors.ts
import { HTTPError } from "ky";

type ApiError = { detail?: string; code?: string };

/**
 * Извлекает машинный code из ответа DRF-бэка {detail, code}.
 * Бэк отдаёт code на ошибках через apps.core.exception_handler.
 *
 * ky не парсит response.json() автоматически при throw — приходится делать руками.
 */
export async function getApiErrorCode(err: unknown): Promise<string | null> {
  if (err instanceof HTTPError) {
    try {
      const body = (await err.response.clone().json()) as ApiError;
      return body.code ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function getApiErrorMessage(err: unknown): Promise<string> {
  if (err instanceof HTTPError) {
    try {
      const body = (await err.response.clone().json()) as ApiError;
      if (body.detail) return body.detail;
    } catch {
      // упало парсинг — отдадим текст ниже
    }
    return `Ошибка ${err.response.status}`;
  }
  if (err instanceof Error) return err.message;
  return "Что-то пошло не так";
}