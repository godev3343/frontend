// src/features/events/components/attendance-button.tsx
"use client";

import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAttendance } from "@/features/events/hooks/use-attendance";
import { cn } from "@/lib/utils";

interface Props {
  eventId: string;
  isGoing: boolean;
}

export function AttendanceButton({ eventId, isGoing }: Props) {
  const mut = useAttendance();

  return (
    <Button
      type="button"
      variant={isGoing ? "default" : "outline"}
      onClick={() => mut.mutate({ id: eventId, going: !isGoing })}
      disabled={mut.isPending}
      className={cn(
        "w-full gap-1.5",
        isGoing && "bg-primary text-primary-foreground hover:brightness-105",
      )}
    >
      {mut.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
      {isGoing ? "Идёте" : "Иду"}
    </Button>
  );
}