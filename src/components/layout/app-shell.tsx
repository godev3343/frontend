// src/components/layout/app-shell.tsx
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';

/**
 * AppShell — layout-обёртка для всех (app)-маршрутов.
 *
 * v2 (floating-glass nav):
 *   Mobile: BottomNav теперь floating (`bottom-6 left-3 right-3`), поэтому
 *     padding-bottom увеличен — было pb-20 (под край), стало pb-28 (под nav + отступ + запас).
 *   Desktop: Sidebar остался w-64, padding не меняется.
 *
 * Формула pb-mobile:
 *   64px (высота nav) + 24px (отступ снизу) + 16px (запас контента над nav)
 *   = 7rem (104px) + safe-area-inset-bottom
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-dvh">
      <Sidebar />
      <main
        className={
          'pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-64'
        }
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}