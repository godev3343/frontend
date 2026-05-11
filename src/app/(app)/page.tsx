// src/app/(app)/page.tsx
import { Logo } from '@/components/brand/logo';

export default function MapPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <Logo size="md" />
      <h1 className="text-2xl font-bold text-white">Карта</h1>
      <p className="text-gray-400">MapLibre появится в EPIC 5</p>
    </div>
  );
}
