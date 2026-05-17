// src/app/(app)/page.tsx
import { CityMap } from '@/features/map/components/city-map-loader';

/**
 * Главная страница — fullscreen-карта.
 *
 * AppShell применяет ко всем (app)-страницам pb-28 на mobile под floating
 * BottomNav. Для карты этот padding не нужен — карта живёт ПОД nav'ом
 * (BottomNav поверх), занимая весь viewport.
 *
 * Компенсируем глобальный padding отрицательным margin-bottom +
 * фиксируем высоту в 100dvh. На desktop у AppShell pb-0 и pl-64 (sidebar),
 * margin-bottom не нужен.
 *
 * `safe-area-inset-bottom` учитываем — на iPhone X+ нижняя зона домика.
 */
export default function MapPage() {
  return (
    <div
      className={
        'h-[100dvh] w-full ' +
        '-mb-[calc(7rem+env(safe-area-inset-bottom))] md:mb-0'
      }
    >
      <CityMap />
    </div>
  );
}