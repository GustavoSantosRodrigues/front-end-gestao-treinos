"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, Clock,
  Coffee, Sun, Sunset, Moon, Zap, Apple,
} from "lucide-react";
import type { NutritionMeal } from "@/app/_lib/api/nutrition-types";

interface MealCardProps {
  meal: NutritionMeal;
}

type MealStyle = {
  icon: React.ElementType;
  bg: string;
  iconColor: string;
}

const MEAL_STYLES: Record<string, MealStyle> = {
  café:   { icon: Coffee, bg: "bg-amber-50 dark:bg-amber-950/30",   iconColor: "text-amber-500"  },
  cafe:   { icon: Coffee, bg: "bg-amber-50 dark:bg-amber-950/30",   iconColor: "text-amber-500"  },
  manhã:  { icon: Coffee, bg: "bg-amber-50 dark:bg-amber-950/30",   iconColor: "text-amber-500"  },
  manha:  { icon: Coffee, bg: "bg-amber-50 dark:bg-amber-950/30",   iconColor: "text-amber-500"  },
  almoço: { icon: Sun,    bg: "bg-orange-50 dark:bg-orange-950/30", iconColor: "text-orange-500" },
  almoco: { icon: Sun,    bg: "bg-orange-50 dark:bg-orange-950/30", iconColor: "text-orange-500" },
  lanche: { icon: Apple,  bg: "bg-green-50 dark:bg-green-950/30",   iconColor: "text-green-500"  },
  jantar: { icon: Moon,   bg: "bg-blue-50 dark:bg-blue-950/30",     iconColor: "text-blue-500"   },
  pré:    { icon: Zap,    bg: "bg-yellow-50 dark:bg-yellow-950/30", iconColor: "text-yellow-500" },
  pre:    { icon: Zap,    bg: "bg-yellow-50 dark:bg-yellow-950/30", iconColor: "text-yellow-500" },
  pós:    { icon: Zap,    bg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-500" },
  pos:    { icon: Zap,    bg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-500" },
}

const DEFAULT_STYLE: MealStyle = {
  icon: Sunset,
  bg: "bg-muted",
  iconColor: "text-muted-foreground",
}

function getMealStyle(name: string): MealStyle {
  const n = name.toLowerCase();
  const key = Object.keys(MEAL_STYLES).find((k) => n.includes(k));
  return key ? MEAL_STYLES[key] : DEFAULT_STYLE;
}

export function MealCard({ meal }: MealCardProps) {
  const [open, setOpen] = useState(false);
  const style = getMealStyle(meal.name);
  const Icon = style.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/50"
      >
        {/* Ícone + horário */}
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <div className={`flex size-12 items-center justify-center rounded-2xl ring-1 ring-black/5 ${style.bg}`}>
            <Icon className={`size-6 ${style.iconColor}`} />
          </div>
          {meal.time && (
            <div className="flex items-center gap-0.5">
              <Clock className="size-2.5 text-muted-foreground" />
              <span className="font-heading text-[10px] text-muted-foreground">
                {meal.time}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Nome */}
          <span className="font-heading text-base font-semibold text-foreground">
            {meal.name}
          </span>

          {/* Macros em linha */}
          <div className="flex items-center gap-1.5 font-heading text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{meal.calories} kcal</span>
            <span>·</span>
            <span>P {meal.protein}g</span>
            <span>·</span>
            <span>C {meal.carbs}g</span>
            <span>·</span>
            <span>G {meal.fat}g</span>
          </div>
        </div>

        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <div className="flex flex-col gap-2">
            {meal.foods.map((food, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5"
              >
                <span className="font-heading text-sm text-foreground">
                  {food.name}
                </span>
                <span className="ml-4 shrink-0 rounded-full bg-background px-2.5 py-1 font-heading text-xs text-muted-foreground ring-1 ring-border">
                  {food.quantity} {food.unit}
                </span>
              </div>
            ))}
          </div>

          {meal.notes && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
              <span className="text-base leading-none">💡</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Substituições
                </span>
                <p className="font-heading text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                  {meal.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}