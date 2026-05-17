// src/app/not-found.tsx
import { MapPin } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-primary text-primary-foreground shadow-glow-accent flex size-20 items-center justify-center rounded-3xl">
        <MapPin className="size-10 text-white" strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-2 text-muted-foreground">Такой страницы нет на карте</p>
      </div>
      <Button asChild>
        <Link href="/">На карту</Link>
      </Button>
    </div>
  );
}
