"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, CheckCircle } from "lucide-react";
import { clientFetch } from "@/app/_lib/client-fetch";
import type { GetHomeData200TodayWorkoutDaySessionStatus, GetHomeData200TodayWorkoutDayWeekDay } from "@/app/_lib/api/fetch-generated";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WEEKDAY_JS: Record<number, string> = {
  0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};

interface StartWorkoutButtonProps {
  workoutPlanId: string;
  workoutDayId: string;
  sessionStatus?: GetHomeData200TodayWorkoutDaySessionStatus;
  sessionId?: string;
  weekDay?: GetHomeData200TodayWorkoutDayWeekDay;
}

export function StartWorkoutButton({
  workoutPlanId,
  workoutDayId,
  sessionStatus = "not_started",
  weekDay,
}: StartWorkoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const href = `/workout-plans/${workoutPlanId}/days/${workoutDayId}`;

  const isToday = !weekDay || WEEKDAY_JS[new Date().getDay()] === weekDay;
  console.log("weekDay:", weekDay, "| hoje:", WEEKDAY_JS[new Date().getDay()], "| isToday:", isToday);
  
  const startSession = async () => {
    setLoading(true);
    try {
      await clientFetch(
        `/workout-plans/${workoutPlanId}/days/${workoutDayId}/sessions`,
        { method: "POST" }
      );
      router.push(href);
    } catch {
      router.push(href);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (sessionStatus === "completed" || sessionStatus === "in_progress") {
      router.push(href);
      return;
    }

    if (!isToday) {
      setShowDialog(true);
      return;
    }

    startSession();
  };

  return (
    <>
      {sessionStatus === "completed" ? (
        <button onClick={handleClick} className="flex items-center gap-1.5 rounded-full bg-primary/20 px-4 py-2 font-heading text-sm font-semibold text-primary">
          <CheckCircle className="size-4" />
          Concluído
        </button>
      ) : sessionStatus === "in_progress" ? (
        <button onClick={handleClick} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground">
          <Play className="size-4" />
          Continuar
        </button>
      ) : (
        <button onClick={handleClick} disabled={loading} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          Iniciar
        </button>
      )}

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Este não é o treino de hoje</AlertDialogTitle>
            <AlertDialogDescription>
              Este treino não está programado para hoje. Deseja fazê-lo mesmo assim? Vai contar normalmente no seu streak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={startSession} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Fazer mesmo assim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}