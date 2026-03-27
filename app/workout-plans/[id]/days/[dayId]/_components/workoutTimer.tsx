"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Play, Pause, Flame, RotateCcw } from "lucide-react";

type TimerData = {
  start: number;
  pausedAt: number | null;
  totalPaused: number;
};

export function WorkoutTimer() {
  const params = useParams();

  const workoutId = params?.id as string || "global";
  const dayId = params?.dayId as string || "day";

  const STORAGE_KEY = `workout_timer_${workoutId}_${dayId}`;

  const getOrCreateTimer = (): TimerData => {
    if (typeof window === "undefined") {
      return { start: Date.now(), pausedAt: null, totalPaused: 0 };
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback seguro
      }
    }

    const initial: TimerData = {
      start: Date.now(),
      pausedAt: null,
      totalPaused: 0,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  };

  const getElapsedSeconds = (data: TimerData) => {
    const now = Date.now();

    if (data.pausedAt) {
      return Math.floor(
        (data.pausedAt - data.start - data.totalPaused) / 1000
      );
    }

    return Math.floor(
      (now - data.start - data.totalPaused) / 1000
    );
  };

  const [seconds, setSeconds] = useState<number>(() => {
    const data = getOrCreateTimer();
    return getElapsedSeconds(data);
  });

  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ⏱ Timer preciso
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      const data = getOrCreateTimer();
      setSeconds(getElapsedSeconds(data));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // 🎯 Evento externo (não apaga mais o timer!)
  useEffect(() => {
    const handler = () => {
      setRunning(false);

      const data = getOrCreateTimer();

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        pausedAt: Date.now(),
      }));
    };

    window.addEventListener("workout:completed", handler);
    return () => window.removeEventListener("workout:completed", handler);
  }, []);

  const handlePause = () => {
    const data = getOrCreateTimer();

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      pausedAt: Date.now(),
    }));

    setRunning(false);
  };

  const handleResume = () => {
    const data = getOrCreateTimer();

    if (!data.pausedAt) return;

    const pauseDuration = Date.now() - data.pausedAt;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      pausedAt: null,
      totalPaused: data.totalPaused + pauseDuration,
    }));

    setRunning(true);
  };

  const handleReset = () => {
    const fresh: TimerData = {
      start: Date.now(),
      pausedAt: null,
      totalPaused: 0,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setSeconds(0);
    setRunning(true);
  };

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-4">
      <div className="absolute -left-6 -top-6 size-32 rounded-full bg-primary/20 blur-2xl" />
      <div className="absolute -bottom-6 -right-6 size-32 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Flame className="size-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-background/50">
              Em treino
            </span>
          </div>

          <div className="flex items-end gap-1 tabular-nums">
            <span className="text-4xl font-black text-background">
              {String(h).padStart(2, "0")}
            </span>
            <span className="mb-1 text-xl text-background/40">:</span>
            <span className="text-4xl font-black text-background">
              {String(m).padStart(2, "0")}
            </span>
            <span className="mb-1 text-xl text-background/40">:</span>
            <span className={`text-4xl font-black ${running ? "text-background" : "text-primary"}`}>
              {String(s).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex size-10 items-center justify-center rounded-full bg-background/10 hover:bg-background/20"
          >
            <RotateCcw className="size-4 text-background/60" />
          </button>

          {running ? (
            <button
              onClick={handlePause}
              className="flex size-12 items-center justify-center rounded-full bg-background/10 hover:bg-background/20"
            >
              <Pause className="size-5 text-background" />
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="flex size-12 items-center justify-center rounded-full bg-primary hover:bg-primary/90"
            >
              <Play className="size-5 text-primary-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 h-0.5 w-full rounded-full bg-background/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000"
          style={{ width: `${((seconds % 60) / 60) * 100}%` }}
        />
      </div>
    </div>
  );
}