import { Calendar, Flame, Beef, Wheat, Droplets, UtensilsCrossed } from "lucide-react";
import type { WeekDay } from "@/app/_lib/api/nutrition-types";

const WEEKDAY_LABELS: Record<WeekDay, string> = {
    MONDAY: "SEGUNDA",
    TUESDAY: "TERÇA",
    WEDNESDAY: "QUARTA",
    THURSDAY: "QUINTA",
    FRIDAY: "SEXTA",
    SATURDAY: "SÁBADO",
    SUNDAY: "DOMINGO",
};

interface NutritionDayCardProps {
    weekDay: WeekDay | null
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    mealsCount: number
}

export function NutritionDayCard({
    weekDay,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
}: NutritionDayCardProps) {
    return (
        <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span className="font-heading text-xs font-semibold uppercase text-muted-foreground">
                        {weekDay ? WEEKDAY_LABELS[weekDay] : "DIA ÚNICO"}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <UtensilsCrossed className="size-3.5 text-muted-foreground" />
                    <span className="font-heading text-xs text-muted-foreground">
                        Ver refeições
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Flame className="size-4 text-orange-500" />
                <span className="font-heading text-2xl font-semibold">
                    {totalCalories}
                </span>
                <span className="text-sm text-muted-foreground">kcal/dia</span>
            </div>

            <div className="flex gap-4">
                <div className="flex items-center gap-1">
                    <Beef className="size-3.5 text-red-400" />
                    <span className="font-heading text-xs text-muted-foreground">
                        P: {totalProtein}g
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Wheat className="size-3.5 text-yellow-400" />
                    <span className="font-heading text-xs text-muted-foreground">
                        C: {totalCarbs}g
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Droplets className="size-3.5 text-blue-400" />
                    <span className="font-heading text-xs text-muted-foreground">
                        G: {totalFat}g
                    </span>
                </div>
            </div>
        </div>
    );
}