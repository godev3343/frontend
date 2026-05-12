// src/app/(app)/page.tsx
import { CityMap } from "@/features/map/components/city-map-loader";

export default function MapPage() {
  return (
    <div className="h-[calc(100dvh-4rem)] w-full">
      <CityMap />
    </div>
  );
}
