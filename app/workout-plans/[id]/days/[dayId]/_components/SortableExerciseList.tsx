"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { clientFetch } from "@/app/_lib/client-fetch";
import type { GetWorkoutDay200ExercisesItem } from "@/app/_lib/api/fetch-generated";
import { SortableItem } from "./SortableItem";

interface SortableExerciseListProps {
    exercises: GetWorkoutDay200ExercisesItem[];
    workoutPlanId: string;
    workoutDayId: string;
    sessionId?: string;
}

export function SortableExerciseList({
    exercises: initialExercises,
    workoutPlanId,
    workoutDayId,
    sessionId,
}: SortableExerciseListProps) {
    const router = useRouter();

    const [exercises, setExercises] = useState<GetWorkoutDay200ExercisesItem[]>(
        [...initialExercises].sort((a, b) => a.order - b.order)
    );

    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = exercises.findIndex((e) => e.id === active.id);
        const newIndex = exercises.findIndex((e) => e.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(exercises, oldIndex, newIndex);

        setExercises(newOrder);
        setSaving(true);

        try {
            await clientFetch(
                `/workout-plans/${workoutPlanId}/days/${workoutDayId}/exercises/reorder`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        exercises: newOrder.map((e, index) => ({
                            id: e.id,
                            order: index + 1,
                        })),
                    }),
                }
            );


            router.refresh();
        } catch (error) {
            console.error("Erro ao reordenar:", error);

            setExercises(
                [...initialExercises].sort((a, b) => a.order - b.order)
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative flex flex-col gap-3">
            {saving && (
                <div className="absolute -top-6 right-0 flex items-center gap-1.5">
                    <div className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="font-heading text-xs text-muted-foreground">
                        Salvando...
                    </span>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={exercises.map((e) => e.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {exercises.map((exercise) => (
                        <SortableItem
                            key={exercise.id}
                            exercise={exercise}
                            workoutPlanId={workoutPlanId}
                            workoutDayId={workoutDayId}
                            sessionId={sessionId}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}