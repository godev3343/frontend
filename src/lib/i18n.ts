// src/lib/i18n.ts
import { ru, type TranslationKey } from '@/i18n/ru';

/**
 * Простой переводчик для Этапа 0 (только русский).
 * На Этапе 1 заменим на next-intl с поддержкой казахского.
 *
 * @example t('nav.map') // → 'Карта'
 */
export function t(key: TranslationKey): string {
  return ru[key];
}
