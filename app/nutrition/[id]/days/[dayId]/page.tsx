import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getNutritionDay, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/app/_components/bottom-nav";
import { BackButton } from "./_components/back-button";
import { MealCard } from "./_components/meal-card";
import type { NutritionDayWithPlan } from "@/app/_lib/api/nutrition-types";
import { Calendar, Flame, Beef, Wheat, Droplets } from "lucide-react";

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: "SEGUNDA",
  TUESDAY: "TERÇA",
  WEDNESDAY: "QUARTA",
  THURSDAY: "QUINTA",
  FRIDAY: "SEXTA",
  SATURDAY: "SÁBADO",
  SUNDAY: "DOMINGO",
};

const WEEKDAY_TITLE_LABELS: Record<string, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export default async function NutritionDayPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const { dayId } = await params;
  const [dayData, trainData] = await Promise.all([
    getNutritionDay(dayId),
    getUserTrainData(),
  ]);

  const needsOnboarding = trainData.status === 200 && !trainData.data;
  if (needsOnboarding) redirect("/onboarding");

  if (dayData.status !== 200) redirect("/nutrition");

  const day = dayData.data as unknown as NutritionDayWithPlan;

  const sortedMeals = [...day.meals].sort((a, b) => a.order - b.order);

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="flex items-center justify-between px-5 py-4">
        <BackButton />
        <h1 className="font-heading text-lg font-semibold text-foreground">
          {day.weekDay ? WEEKDAY_TITLE_LABELS[day.weekDay] : "Dia único"}
        </h1>
        <div className="size-6" />
      </div>

      {/* Resumo de macros do dia */}
      <div className="mx-5 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-1">
          {day.weekDay && (
            <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="font-heading text-xs font-semibold uppercase text-muted-foreground">
                {WEEKDAY_LABELS[day.weekDay]}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mb-4">
          <Flame className="size-5 text-orange-500" />
          <span className="font-heading text-3xl font-semibold">
            {day.totalCalories}
          </span>
          <span className="text-sm text-muted-foreground">kcal/dia</span>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-1.5">
            <Beef className="size-4 text-red-400" />
            <div className="flex flex-col">
              <span className="font-heading text-sm font-semibold">{day.totalProtein}g</span>
              <span className="font-heading text-xs text-muted-foreground">Proteína</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Wheat className="size-4 text-yellow-400" />
            <div className="flex flex-col">
              <span className="font-heading text-sm font-semibold">{day.totalCarbs}g</span>
              <span className="font-heading text-xs text-muted-foreground">Carboidratos</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="size-4 text-blue-400" />
            <div className="flex flex-col">
              <span className="font-heading text-sm font-semibold">{day.totalFat}g</span>
              <span className="font-heading text-xs text-muted-foreground">Gordura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refeições */}
      <div className="flex flex-col gap-3 px-5 pt-5 pb-32">
        {sortedMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      <BottomNav activePage="nutrition" />
    </div>
  );
}