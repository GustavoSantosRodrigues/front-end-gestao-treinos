"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Flame } from "lucide-react";

export function WorkoutTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Pausa automaticamente quando o treino é concluído
  useEffect(() => {
    const handler = () => setRunning(false);
    window.addEventListener("workout:completed", handler);
    return () => window.removeEventListener("workout:completed", handler);
  }, []);

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
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-background/50">
              Em treino
            </span>
          </div>
          {/* Sempre formato 00:00:00 */}
          <div className="flex items-end gap-1 tabular-nums">
            <span className="font-heading text-4xl font-black text-background">
              {String(h).padStart(2, "0")}
            </span>
            <span className="mb-1 font-heading text-xl font-bold text-background/40">:</span>
            <span className="font-heading text-4xl font-black text-background">
              {String(m).padStart(2, "0")}
            </span>
            <span className="mb-1 font-heading text-xl font-bold text-background/40">:</span>
            <span className={`font-heading text-4xl font-black ${running ? "text-background" : "text-primary"}`}>
              {String(s).padStart(2, "0")}
            </span>
          </div>
        </div>

        <button
          onClick={() => setRunning((r) => !r)}
          className={`flex size-12 items-center justify-center rounded-full transition-all active:scale-95 ${
            running
              ? "bg-background/10 hover:bg-background/20"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {running ? (
            <Pause className="size-5 text-background" />
          ) : (
            <Play className="size-5 text-primary-foreground" />
          )}
        </button>
      </div>

      <div className="relative mt-3 h-0.5 w-full overflow-hidden rounded-full bg-background/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000"
          style={{ width: `${((seconds % 60) / 60) * 100}%` }}
        />
      </div>
    </div>
  );
}