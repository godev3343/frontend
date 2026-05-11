// src/components/layout/app-shell.tsx
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-dvh">
      <Sidebar />
      <main
        className={
          // mobile: padding-bottom под BottomNav (h-20) + safe area
          // desktop: смещение от Sidebar (w-64)
          'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-64'
        }
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
