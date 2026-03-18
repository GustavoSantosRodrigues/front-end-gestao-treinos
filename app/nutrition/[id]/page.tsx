import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getNutritionPlan, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import Link from "next/link";
import { Salad } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/app/_components/bottom-nav";
import { LogoAI } from "@/app/_components/logo-ai";
import { NutritionDayCard } from "../_components/nutrition-day-card";
import type { NutritionPlan } from "@/app/_lib/api/nutrition-types";

const WEEKDAY_ORDER = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
  "FRIDAY", "SATURDAY", "SUNDAY",
];

export default async function NutritionPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (!session.data?.user) redirect("/auth");

  const { id } = await params;
  const [planData, trainData] = await Promise.all([
    getNutritionPlan(id),
    getUserTrainData(),
  ]);

  const needsOnboarding = trainData.status === 200 && !trainData.data;
  if (needsOnboarding) redirect("/onboarding");

  if (planData.status !== 200) redirect("/nutrition");

  const plan = planData.data as unknown as NutritionPlan;

  const sortedDays = [...plan.days].sort((a, b) =>
    a.weekDay && b.weekDay
      ? WEEKDAY_ORDER.indexOf(a.weekDay) - WEEKDAY_ORDER.indexOf(b.weekDay)
      : 0,
  );

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div
        className="relative flex h-[296px] shrink-0 flex-col items-start justify-between overflow-hidden rounded-b-[20px] px-5 pb-10 pt-5"
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
        }}
      >
        <LogoAI />

        <div className="flex w-full items-end justify-between">
          <div className="flex flex-col gap-3">
            <Badge className="gap-1 rounded-full border-white/20 bg-white/10 px-2.5 py-1.5 font-heading text-xs font-semibold uppercase text-white">
              <Salad className="size-4" />
              {plan.goal}
            </Badge>
            <h1 className="font-heading text-2xl font-semibold leading-[1.05] text-white">
              Plano Nutricional
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        {sortedDays.map((day) => (
          <Link key={day.id} href={`/nutrition/${id}/days/${day.id}`}>
            <NutritionDayCard
              weekDay={day.weekDay}
              totalCalories={day.totalCalories}
              totalProtein={day.totalProtein}
              totalCarbs={day.totalCarbs}
              totalFat={day.totalFat} 
              mealsCount={0}
            />
          </Link>
        ))}
      </div>

      <BottomNav activePage="nutrition" />
    </div>
  );
}