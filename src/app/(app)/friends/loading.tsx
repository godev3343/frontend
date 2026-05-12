// src/app/(app)/friends/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function FriendsLoading() {
  return (
    <main className="container mx-auto max-w-2xl space-y-4 px-4 py-6">
      <Skeleton className="h-10 w-full rounded-lg bg-gray-800" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg bg-gray-800" />
        <Skeleton className="h-9 w-24 rounded-lg bg-gray-800" />
        <Skeleton className="h-9 w-24 rounded-lg bg-gray-800" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-800" />
        ))}
      </div>
    </main>
  );
}
