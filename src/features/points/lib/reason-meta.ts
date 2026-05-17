// src/features/points/lib/reason-meta.ts
import type { LucideIcon } from "lucide-react";
import { CircleHelp, MapPin, MessageSquare, Star, UserPlus } from "lucide-react";

import type { KnownPointsReason, PointsReason } from "../schemas";

export interface ReasonMeta {
  label: string;
  icon: LucideIcon;
}

/**
 * Маппинг известных нам reason'ов на UI-метаданные.
 *
 * Покрывает KNOWN_REASONS из schemas.ts. Если бэк отдаёт reason
 * не из этого списка — getReasonMeta() даёт fallback с CircleHelp-иконкой
 * и humanize()-лейблом.
 *
 * При появлении нового reason в Sentry/dev-консоли:
 *   1. Добавить значение в KNOWN_REASONS (schemas.ts).
 *   2. Добавить запись сюда с правильным label + icon.
 *
 * Источник правды у бэка: apps/gamification/services/points.py::POINTS_BY_REASON.
 */
export const REASON_META: Record<KnownPointsReason, ReasonMeta> = {
  checkin: { label: "Чек-ин", icon: MapPin },
  first_checkin: { label: "Первый чек-ин в этом месте", icon: Star },
  friend_added: { label: "Новый друг", icon: UserPlus },
  review_posted: { label: "Опубликован отзыв", icon: MessageSquare },
};

/**
 * Возвращает метаданные для рендеринга строки истории поинтов.
 *
 * Защита от неизвестного reason: бэк добавил новый тип, фронт ещё не
 * обновили — рендерим humanize-строку вместо падения. В dev-режиме
 * пишем warning в консоль, чтобы заметить рассинхрон.
 */
export function getReasonMeta(reason: PointsReason): ReasonMeta {
  const meta = REASON_META[reason as KnownPointsReason];
  if (meta) return meta;

  // Dev-warn: новый reason от бэка, не покрыт REASON_META.
  // В проде молчим — не засоряем Sentry, юзер видит fallback-лейбл.
  if (process.env.NODE_ENV === "development") {
     
    console.warn(
      `[points] Unknown reason "${reason}" — add it to REASON_META in reason-meta.ts`,
    );
  }

  return {
    label: humanize(reason),
    icon: CircleHelp,
  };
}

/**
 * Превращает технический snake_case-reason в читабельную строку для UI.
 * "place_visited" → "Place visited"
 *
 * Это fallback на случай если UI-маппинг не успел за бэкендом.
 * Не идеально (русского текста нет), но лучше чем raw "place_visited"
 * или Zod-ошибка.
 */
function humanize(reason: string): string {
  return reason
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}