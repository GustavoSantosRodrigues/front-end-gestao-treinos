import { Calendar, Flame, Beef, Wheat, Droplets, UtensilsCrossed, UserRound } from "lucide-react";
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
    isUniqueDay: boolean
}

export function NutritionDayCard({
    weekDay,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    isUniqueDay,
}: NutritionDayCardProps) {
    return (
        <>
            <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">

                    {isUniqueDay && (
                        <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span className="font-heading text-xs font-semibold uppercase text-muted-foreground">
                                DIA ÚNICO
                            </span>
                        </div>
                    )}
                    {!isUniqueDay && weekDay && (
                        <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span className="font-heading text-xs font-semibold uppercase text-muted-foreground">
                                {WEEKDAY_LABELS[weekDay]}
                            </span>
                        </div>
                    )}
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

            <div className="flex items-start gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-5 my-5 dark:border-yellow-800 dark:bg-yellow-950">
                <UserRound className="mt-0.5 size-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                <p className="font-heading text-xs leading-relaxed text-yellow-700 dark:text-yellow-300">
                    Sugestão gerada por IA. Consulte um nutricionista e seu personal trainer antes de seguir qualquer plano alimentar.
                </p>
            </div>
        </>

    );
}