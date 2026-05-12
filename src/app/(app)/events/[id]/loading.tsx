// src/app/(app)/events/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function EventDetailLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 pb-24">
      <Skeleton className="h-8 w-32 bg-gray-800" />
      <Skeleton className="aspect-video w-full rounded-2xl bg-gray-800" />
      <Skeleton className="h-9 w-3/4 bg-gray-800" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full bg-gray-800" />
        <Skeleton className="h-6 w-32 rounded-full bg-gray-800" />
      </div>
      <Skeleton className="h-20 w-full bg-gray-800" />
      <Skeleton className="h-10 w-40 rounded-lg bg-gray-800" />
    </div>
  );
}
