import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { listNutritionPlans, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import Link from "next/link";
import { Salad } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/app/_components/bottom-nav";
import { LogoAI } from "@/app/_components/logo-ai";
import { NutritionDayCard } from "./_components/nutrition-day-card";
import { NutritionChat } from "./_components/nutrition-chat";
import type { NutritionPlan } from "@/app/_lib/api/nutrition-types";
import Image from "next/image";

const WEEKDAY_ORDER = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
  "FRIDAY", "SATURDAY", "SUNDAY",
];

export default async function NutritionPage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (!session.data?.user) redirect("/auth");

  const [plansData, trainData] = await Promise.all([
    listNutritionPlans(),
    getUserTrainData(),
  ]);

  const needsOnboarding = trainData.status === 200 && !trainData.data;
  if (needsOnboarding) redirect("/onboarding");

  const plans = (plansData.data as unknown as NutritionPlan[]) ?? [];
  const activePlan = plans.find((p) => p.isActive) ?? null;

  if (!activePlan) {
    return (
      <div className="flex min-h-svh flex-col bg-background pb-24">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Salad className="size-16 text-muted-foreground" />
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Nenhum plano nutricional
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Converse com a IA para criar seu plano personalizado
            </p>
          </div>
        </div>
        <NutritionChat />
        <BottomNav activePage="nutrition" />
      </div>
    );
  }

  const sortedDays = [...activePlan.days].sort((a, b) =>
    a.weekDay && b.weekDay
      ? WEEKDAY_ORDER.indexOf(a.weekDay) - WEEKDAY_ORDER.indexOf(b.weekDay)
      : 0,
  );

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="relative flex h-[296px] shrink-0 flex-col items-start justify-between overflow-hidden rounded-b-[20px] px-5 pb-10 pt-5">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/nutrition-banner.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(238deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
            }}
          />
        </div>

        <LogoAI />

        <div className="relative flex w-full items-end justify-between">
          <div className="flex flex-col gap-3">
            <Badge className="gap-1 rounded-full px-2.5 py-1.5 font-heading text-xs font-semibold uppercase">
              <Salad className="size-4" />
              {activePlan.goal}
            </Badge>
            <h1 className="font-heading text-2xl font-semibold leading-[1.05] text-background">
              Plano Nutricional
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        {sortedDays.map((day) => (
          <Link key={day.id} href={`/nutrition/${activePlan.id}/days/${day.id}`}>
            <NutritionDayCard
              weekDay={day.weekDay}
              totalCalories={day.totalCalories}
              totalProtein={day.totalProtein}
              totalCarbs={day.totalCarbs}
              totalFat={day.totalFat}
              mealsCount={0}
              isUniqueDay={true}
            />
          </Link>
        ))}
      </div>

      <BottomNav activePage="nutrition" />
    </div>
  );
}