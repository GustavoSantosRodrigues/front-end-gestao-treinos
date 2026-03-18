"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import type { NutritionMeal } from "@/app/_lib/api/nutrition-types";

interface MealCardProps {
  meal: NutritionMeal;
}

export function MealCard({ meal }: MealCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-base font-semibold text-foreground">
              {meal.name}
            </span>
            {meal.time && (
              <div className="flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                <span className="font-heading text-xs text-muted-foreground">
                  {meal.time}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <span className="font-heading text-xs text-muted-foreground">
              {meal.calories} kcal
            </span>
            <span className="font-heading text-xs text-muted-foreground">
              P: {meal.protein}g
            </span>
            <span className="font-heading text-xs text-muted-foreground">
              C: {meal.carbs}g
            </span>
            <span className="font-heading text-xs text-muted-foreground">
              G: {meal.fat}g
            </span>
          </div>
        </div>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <div className="flex flex-col gap-2">
            {meal.foods.map((food, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
              >
                <span className="font-heading text-sm text-foreground">
                  {food.name}
                </span>
                <span className="font-heading text-xs text-muted-foreground">
                  {food.quantity} {food.unit}
                </span>
              </div>
            ))}
          </div>

          {meal.notes && (
            <p className="mt-4 rounded-lg bg-muted px-3 py-2 font-heading text-xs text-muted-foreground">
              💡 {meal.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}