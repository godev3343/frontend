// src/features/points/lib/reason-meta.ts
import type { LucideIcon } from "lucide-react";
import { MapPin,
  Star, UserPlus } from "lucide-react";

import type { PointsReason } from "../schemas";

export interface ReasonMeta {
  label: string;
  icon: LucideIcon;
}

export const REASON_META: Record<PointsReason, ReasonMeta> = {
  checkin: { label: "Чек-ин", icon: MapPin },
  first_checkin: { label: "Первый чек-ин в этом месте", icon: Star },
  friend_added: { label: "Новый друг", icon: UserPlus },
};

/** Защита от неизвестного reason — на случай если бэк добавит новый. */
export function getReasonMeta(reason: PointsReason): ReasonMeta {
  return REASON_META[reason] ?? { label: reason, icon: MapPin };
}
