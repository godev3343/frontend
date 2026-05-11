// src/app/(app)/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <Skeleton className="h-12 w-3/4 bg-gray-800" />
      <Skeleton className="h-32 w-full bg-gray-800" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 bg-gray-800" />
        <Skeleton className="h-24 bg-gray-800" />
      </div>
      <Skeleton className="h-48 w-full bg-gray-800" />
    </div>
  );
}
