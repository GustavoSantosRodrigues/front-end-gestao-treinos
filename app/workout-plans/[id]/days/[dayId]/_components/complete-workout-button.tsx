"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { completeWorkoutAction } from "../_actions";

interface CompleteWorkoutButtonProps {
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
}

export function CompleteWorkoutButton({
  workoutPlanId,
  workoutDayId,
  sessionId,
}: CompleteWorkoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      await completeWorkoutAction(workoutPlanId, workoutDayId, sessionId);
      window.dispatchEvent(new Event("workout:completed"));
    });
  };
  return (
    <Button
      variant="outline"
      onClick={handleComplete}
      disabled={isPending}
      className="w-full rounded-full py-3 font-heading text-sm font-semibold"
    >
      {isPending ? (
        <div className="flex items-center gap-2">
          <div className="size-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          Concluindo...
        </div>
      ) : (
        "Marcar como concluído"
      )}
    </Button>
  );
}