"use client";

import { useState, useEffect, useRef } from "react";
import { CircleHelp, Zap, RotateCcw, Check } from "lucide-react";
import { useQueryStates, parseAsBoolean, parseAsString } from "nuqs";
import { Button } from "@/components/ui/button";
import { clientFetch } from "@/app/_lib/client-fetch";
import type { GetWorkoutDay200ExercisesItem } from "@/app/_lib/api/fetch-generated";

interface ExerciseCardProps {
  exercise: GetWorkoutDay200ExercisesItem;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId?: string;
}

export function ExerciseCard({ exercise, workoutPlanId, workoutDayId, sessionId }: ExerciseCardProps) {
  const [, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString,
  });

  const [sets, setSets] = useState(
    Array.from({ length: exercise.sets }, (_, i) => {
      const existingLog = exercise.logs?.find((log) => log.setNumber === i + 1);
      return {
        setNumber: i + 1,
        weightInKg: existingLog?.weightInKg ? String(existingLog.weightInKg) : "",
        repsCompleted: existingLog ? String(existingLog.repsCompleted) : String(exercise.reps),
        completed: !!existingLog,
        saving: false,
      };
    })
  );

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleHelp = () => {
    setChatParams({
      chat_open: true,
      chat_initial_message: `Como executar o exercício ${exercise.name} corretamente?`,
    });
  };

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(exercise.restTimeInSeconds);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(null);
  };

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timeLeft]);

  const handleCompleteSet = async (index: number) => {
    if (!sessionId) return;

    const set = sets[index];
    if (set.completed || set.saving) return;

    setSets((prev) => prev.map((s, i) => i === index ? { ...s, saving: true } : s));

    try {
      await clientFetch(
        `/workout-plans/${workoutPlanId}/days/${workoutDayId}/sessions/${sessionId}/exercises/${exercise.id}/logs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setNumber: set.setNumber,
            weightInKg: set.weightInKg ? parseFloat(set.weightInKg) : undefined,
            repsCompleted: parseInt(set.repsCompleted) || exercise.reps,
          }),
        }
      );

      setSets((prev) => prev.map((s, i) => i === index ? { ...s, completed: true, saving: false } : s));
      startTimer();
    } catch {
      setSets((prev) => prev.map((s, i) => i === index ? { ...s, saving: false } : s));
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-foreground">
          {exercise.name}
        </span>
        <Button variant="ghost" size="icon" onClick={handleHelp}>
          <CircleHelp className="size-5 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          {exercise.sets} séries
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          {exercise.reps} reps
        </span>
        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          <Zap className="size-3.5" />
          {exercise.restTimeInSeconds}s
        </span>
      </div>

      {exercise.weightSuggestion && (
        <p className="font-heading text-xs text-muted-foreground">
          💡 {exercise.weightSuggestion}
        </p>
      )}

      {exercise.notes && (
        <p className="font-heading text-xs text-muted-foreground">
          📝 {exercise.notes}
        </p>
      )}

      {sessionId && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 px-1">
            <span className="font-heading text-xs text-muted-foreground">Série</span>
            <span className="font-heading text-xs text-muted-foreground">Peso (kg)</span>
            <span className="font-heading text-xs text-muted-foreground">Reps</span>
            <span />
          </div>
          {sets.map((set, index) => (
            <div key={index} className={`grid grid-cols-[40px_1fr_1fr_40px] items-center gap-2 rounded-lg p-1 ${set.completed ? "bg-primary/5" : ""}`}>
              <span className="font-heading text-sm font-semibold text-foreground">{set.setNumber}</span>
              <input
                type="number"
                placeholder="0"
                value={set.weightInKg}
                disabled={set.completed}
                onChange={(e) => setSets((prev) => prev.map((s, i) => i === index ? { ...s, weightInKg: e.target.value } : s))}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 font-heading text-sm disabled:opacity-50"
              />
              <input
                type="number"
                value={set.repsCompleted}
                disabled={set.completed}
                onChange={(e) => setSets((prev) => prev.map((s, i) => i === index ? { ...s, repsCompleted: e.target.value } : s))}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 font-heading text-sm disabled:opacity-50"
              />
              <button
                onClick={() => handleCompleteSet(index)}
                disabled={set.completed || set.saving}
                className={`flex size-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${set.completed
                  ? "border-primary bg-primary text-primary-foreground scale-110"
                  : set.saving
                    ? "border-primary/50 bg-primary/10"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                {set.saving ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : set.completed ? (
                  <Check className="size-4" />
                ) : (
                  <span className="font-heading text-xs font-semibold text-muted-foreground">
                    {set.setNumber}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {sessionId && timeLeft !== null && (
        <div className="flex items-center gap-2">
          <span className={`font-heading text-sm font-semibold ${timeLeft === 0 ? "text-primary" : "text-foreground"}`}>
            {timeLeft === 0 ? "Pronto para próxima série!" : `Descanso: ${timeLeft}s`}
          </span>
          <Button variant="ghost" size="icon" onClick={resetTimer} className="size-7">
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}