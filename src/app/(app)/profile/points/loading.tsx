// src/app/(app)/profile/points/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function PointsLoading() {
  return (
    <main className="container mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40 bg-gray-800" />
        <Skeleton className="h-7 w-16 rounded-full bg-gray-800" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl bg-gray-800" />
        ))}
      </div>
    </main>
  );
}
