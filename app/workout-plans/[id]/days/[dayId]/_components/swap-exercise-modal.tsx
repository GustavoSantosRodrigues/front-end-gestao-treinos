"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clientFetch } from "@/app/_lib/client-fetch";
import type { GetWorkoutDay200ExercisesItem } from "@/app/_lib/api/fetch-generated";
import Image from "next/image";

const MUSCLE_GROUPS = [
  { label: "Todos", value: "" },
  { label: "Peito", value: "peito" },
  { label: "Costas", value: "costas" },
  { label: "Bíceps", value: "biceps" },
  { label: "Tríceps", value: "triceps" },
  { label: "Ombro", value: "ombro" },
  { label: "Quadríceps", value: "quadriceps" },
  { label: "Glúteo", value: "gluteo" },
  { label: "Isquiotibiais", value: "isquiotibiais" },
  { label: "Abdômen", value: "abdomen" },
  { label: "Panturrilha", value: "panturrilha" },
];

interface Exercise {
  id: string;
  name: string;
  muscles: string[];
  gifUrl: string;
}

interface SwapExerciseModalProps {
  exercise: GetWorkoutDay200ExercisesItem;
  workoutPlanId: string;
  workoutDayId: string;
  weekDay: string;
  allExercises: GetWorkoutDay200ExercisesItem[];
  onClose: () => void;
}

export function SwapExerciseModal({
  exercise,
  workoutPlanId,
  weekDay,
  allExercises,
  onClose,
}: SwapExerciseModalProps) {
  const router = useRouter();
  const [dbExercises, setDbExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await clientFetch<{ status: number; data: Exercise[] }>(
          "/exercises", { method: "GET" }
        );
        if (res.status === 200) {
          setDbExercises(res.data);
          setFiltered(res.data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    let result = dbExercises;
    if (selectedMuscle) result = result.filter((e) => e.muscles.includes(selectedMuscle));
    if (search) result = result.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [selectedMuscle, search, dbExercises]);

  const handleSwap = async () => {
    if (!selectedId) return;
    console.log("weekDay:", weekDay);
    console.log("allExercises:", allExercises);
    console.log("selected:", selectedId);
    setSaving(true);
    try {
      const selected = dbExercises.find((e) => e.id === selectedId);
      if (!selected) return;

      const updatedExercises = allExercises.map((ex) => ({
        order: ex.order,
        name: ex.id === exercise.id ? selected.name : ex.name,
        sets: ex.sets,
        reps: ex.reps,
        restTimeInSeconds: ex.restTimeInSeconds,
        weightSuggestion: ex.weightSuggestion ?? undefined,
        notes: ex.notes ?? undefined,
        exerciseId: ex.id === exercise.id ? selected.id : (ex as { exerciseId?: string }).exerciseId ?? undefined,
      }));

      await clientFetch(`/workout-plans/${workoutPlanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutDays: [{ weekDay, exercises: updatedExercises }] }),
      });

      router.refresh();
      await new Promise((resolve) => setTimeout(resolve, 200));
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end bg-foreground/40 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold text-foreground">Trocar exercício</span>
            <span className="font-heading text-xs text-muted-foreground">{exercise.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-5" /></Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Buscar exercício..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted pl-9 pr-3 font-heading text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MUSCLE_GROUPS.map((m) => (
              <button key={m.value} onClick={() => setSelectedMuscle(m.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 font-heading text-xs font-semibold transition-colors ${selectedMuscle === m.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >{m.label}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center font-heading text-sm text-muted-foreground">Nenhum exercício encontrado</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((ex) => (
                <button key={ex.id} onClick={() => setSelectedId(ex.id === selectedId ? null : ex.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selectedId === ex.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    }`}
                >
                  {ex.gifUrl ? (
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={ex.gifUrl} alt={ex.name} width={48} height={48} unoptimized className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="size-12 shrink-0 rounded-lg bg-muted" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="font-heading text-sm font-semibold text-foreground">{ex.name}</span>
                    <span className="font-heading text-xs text-muted-foreground">{ex.muscles.join(", ")}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-4 pb-8">
          <Button className="w-full" disabled={!selectedId || saving} onClick={handleSwap}>
            {saving ? "Salvando..." : "Confirmar troca"}
          </Button>
        </div>
      </div>
    </div>
  );
}