// src/features/events/components/rsvp-buttons.tsx
"use client";

import { Check, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRsvp } from "@/features/events/hooks/use-rsvp";
import type { UserRsvp } from "@/features/events/schemas";
import { cn } from "@/lib/utils";

interface Props {
  eventId: string;
  current: UserRsvp;
}

export function RsvpButtons({ eventId, current }: Props) {
  const mut = useRsvp();

  const handle = (target: "going" | "interested") => {
    // Повторное нажатие на активный = снять.
    const next: UserRsvp = current === target ? null : target;
    mut.mutate({ id: eventId, next });
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={current === "going" ? "default" : "outline"}
        onClick={() => handle("going")}
        disabled={mut.isPending}
        className={cn(
          "flex-1 gap-1.5",
          current === "going" && "bg-purple-500 hover:bg-purple-600",
        )}
      >
        <Check className="size-4" />
        Иду
      </Button>
      <Button
        type="button"
        variant={current === "interested" ? "default" : "outline"}
        onClick={() => handle("interested")}
        disabled={mut.isPending}
        className={cn(
          "flex-1 gap-1.5",
          current === "interested" && "bg-purple-500 hover:bg-purple-600",
        )}
      >
        <Star className="size-4" />
        Интересно
      </Button>
    </div>
  );
}
