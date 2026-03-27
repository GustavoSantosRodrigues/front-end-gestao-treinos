"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ExerciseCard } from "./exercise-card";
import type { GetWorkoutDay200ExercisesItem } from "@/app/_lib/api/fetch-generated";

interface SortableItemProps {
  exercise: GetWorkoutDay200ExercisesItem;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId?: string;
}

export function SortableItem({
  exercise,
  workoutPlanId,
  workoutDayId,
  sessionId,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exercise.id, 
    disabled: !!sessionId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative flex items-stretch gap-2"
    >
      {!sessionId && (
        <button
          {...attributes}
          {...listeners}
          className="flex w-6 cursor-grab items-center justify-center rounded-lg text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <div className="flex-1">
        <ExerciseCard
          exercise={exercise}
          workoutPlanId={workoutPlanId}
          workoutDayId={workoutDayId}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
}