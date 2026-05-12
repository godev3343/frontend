// src/app/(app)/users/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfileLoading() {
  return (
    <main className="container mx-auto max-w-2xl space-y-4 px-4 py-6">
      <Skeleton className="h-48 w-full rounded-2xl bg-gray-800" />
      <Skeleton className="h-10 w-40 rounded-lg bg-gray-800" />
      <div className="space-y-2">
        <Skeleton className="h-24 w-full rounded-xl bg-gray-800" />
        <Skeleton className="h-24 w-full rounded-xl bg-gray-800" />
      </div>
    </main>
  );
}
