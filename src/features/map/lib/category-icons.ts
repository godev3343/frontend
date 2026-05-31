import {
  Briefcase,
  Coffee,
  Dumbbell,
  Gamepad2,
  Landmark,
  type LucideIcon,
  MapPin,
  Music,
  ShoppingBag,
  Trees,
  Utensils,
  Wine,
} from "lucide-react";

/**
 * Иконка по слагу категории места. Слаги — из PlaceCategory на бэке
 * (fixtures/places.json). Маппинг отдельный от VIBE_ICONS намеренно:
 * вайб задаёт ЦВЕТ пина, категория — ИКОНКУ внутри. Это разные оси.
 *
 * Неизвестный слаг или null → MapPin (нейтральный фолбэк, ничего не падает).
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cafe: Coffee,
  coffee: Coffee,
  restaurant: Utensils,
  bar: Wine,
  club: Music,
  coworking: Briefcase,
  park: Trees,
  museum: Landmark,
  shopping: ShoppingBag,
  gym: Dumbbell,
  gaming: Gamepad2,
};

export function getCategoryIcon(category: string | null | undefined): LucideIcon {
  if (!category) return MapPin;
  return CATEGORY_ICONS[category] ?? MapPin;
}