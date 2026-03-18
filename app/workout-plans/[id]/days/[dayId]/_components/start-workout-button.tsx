"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, CheckCircle } from "lucide-react";
import { clientFetch } from "@/app/_lib/client-fetch";
import type { GetHomeData200TodayWorkoutDaySessionStatus } from "@/app/_lib/api/fetch-generated";

interface StartWorkoutButtonProps {
  workoutPlanId: string;
  workoutDayId: string;
  sessionStatus: GetHomeData200TodayWorkoutDaySessionStatus;
  sessionId?: string;
}

export function StartWorkoutButton({
  workoutPlanId,
  workoutDayId,
  sessionStatus,
  sessionId,
}: StartWorkoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const href = `/workout-plans/${workoutPlanId}/days/${workoutDayId}`;

  const handleStart = async () => {
    if (sessionStatus === "completed") {
      router.push(href);
      return;
    }

    if (sessionStatus === "in_progress") {
      router.push(href);
      return;
    }

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

  if (sessionStatus === "completed") {
    return (
      <button
        onClick={handleStart}
        className="flex items-center gap-1.5 rounded-full bg-primary/20 px-4 py-2 font-heading text-sm font-semibold text-primary"
      >
        <CheckCircle className="size-4" />
        Concluído
      </button>
    );
  }

  if (sessionStatus === "in_progress") {
    return (
      <button
        onClick={handleStart}
        className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground"
      >
        <Play className="size-4" />
        Continuar
      </button>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Play className="size-4" />
      )}
      Iniciar
    </button>
  );
}