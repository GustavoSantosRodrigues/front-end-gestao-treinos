import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getHomeData, getUserTrainData } from "./_lib/api/fetch-generated";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { BottomNav } from "./_components/bottom-nav";
import { ConsistencyTracker } from "./_components/consistency-tracker";
import { WorkoutDayCard } from "./_components/workout-day-card";
import { listNutritionPlans } from "./_lib/api/fetch-generated";
import { Flame, Beef, Wheat, Droplets } from "lucide-react";
import type { NutritionPlan, NutritionDay } from "./_lib/api/nutrition-types";
import { JS_TO_WEEKDAY } from "./_lib/api/nutrition-types";
import { StartWorkoutButton } from "./workout-plans/[id]/days/[dayId]/_components/start-workout-button";

export default async function Home() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();
  const [homeData, trainData, plansData] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD")),
    getUserTrainData(),
    listNutritionPlans(),
  ]);

  const plans = (plansData.data as unknown as NutritionPlan[]) ?? [];
  const activePlan = plans.find((p) => p.isActive) ?? null;

  const todayEnum = JS_TO_WEEKDAY[today.day()];
  const todayNutritionDay: NutritionDay | null = activePlan
    ? activePlan.days.length === 1 && activePlan.days[0].weekDay === null
      ? activePlan.days[0]
      : (activePlan.days.find((d) => d.weekDay === todayEnum) ?? activePlan.days[0])
    : null;

  if (homeData.status !== 200) {
    throw new Error("Failed to fetch home data");
  }

  const needsOnboarding = trainData.status === 200 && !trainData.data;
  if (needsOnboarding) redirect("/onboarding");

  const { todayWorkoutDay, workoutStreak, consistencyByDay } = homeData.data;
  const userName = session.data.user.name?.split(" ")[0] ?? "";

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="relative flex h-[296px] shrink-0 flex-col items-start justify-between overflow-hidden rounded-b-[20px] px-5 pb-10 pt-5">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/home-banner.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(243deg, rgba(0,0,0,0) 34%, rgb(0,0,0) 100%)",
            }}
          />
        </div>

        <p
          className="relative text-[22px] uppercase leading-[1.15] text-background"
          style={{ fontFamily: "var(--font-anton)" }}
        >
          GS.ai
        </p>

        <div className="relative flex w-full items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-2xl font-semibold leading-[1.05] text-background">
              Olá, {userName}
            </h1>
            <p className="font-heading text-sm leading-[1.15] text-background/70">
              Bora treinar hoje?
            </p>
          </div>
          <div className="rounded-full bg-primary px-4 py-2">
            <span className="font-heading text-sm font-semibold text-primary-foreground">
              Bora!
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Consistência
          </h2>
          <Link href="/stats" className="font-heading text-xs text-primary">
            Ver histórico
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl border border-border p-5">
            <ConsistencyTracker
              consistencyByDay={consistencyByDay}
              today={today}
            />
          </div>
          <div className="flex items-center gap-2 self-stretch rounded-xl bg-streak px-5 py-2">
            <Flame className="size-5 text-streak-foreground" />
            <span className="font-heading text-base font-semibold text-foreground">
              {workoutStreak}
            </span>
          </div>
        </div>
      </div>

      {todayWorkoutDay && (
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Treino de Hoje
            </h2>
          </div>

          <div className="relative">
            <Link href={`/workout-plans/${todayWorkoutDay.workoutPlanId}/days/${todayWorkoutDay.id}`}>
              <WorkoutDayCard
                name={todayWorkoutDay.name}
                weekDay={todayWorkoutDay.weekDay}
                estimatedDurationInSeconds={todayWorkoutDay.estimatedDurationInSeconds}
                exercisesCount={todayWorkoutDay.exercisesCount}
                coverImageUrl={todayWorkoutDay.coverImageUrl}
              />
            </Link>

            <div className="absolute bottom-5 right-5">
              <StartWorkoutButton
                workoutPlanId={todayWorkoutDay.workoutPlanId}
                workoutDayId={todayWorkoutDay.id}
                sessionStatus={todayWorkoutDay.sessionStatus}
                sessionId={todayWorkoutDay.sessionId}
              />
            </div>
          </div>
        </div>
      )}

      {todayNutritionDay && activePlan && (
        <div className="flex flex-col gap-3 px-5 pb-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Nutrição de Hoje
            </h2>
            <Link
              href={`/nutrition/${activePlan.id}/days/${todayNutritionDay.id}`}
              className="font-heading text-xs text-primary"
            >
              Ver refeições
            </Link>
          </div>

          <div className="rounded-xl border border-border p-5">
            <div className="mb-4 flex items-center gap-1">
              <Flame className="size-5 text-orange-500" />
              <span className="font-heading text-2xl font-semibold">
                {todayNutritionDay.totalCalories}
              </span>
              <span className="text-sm text-muted-foreground">kcal/dia</span>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-1.5">
                <Beef className="size-4 text-red-400" />
                <div className="flex flex-col">
                  <span className="font-heading text-sm font-semibold">
                    {todayNutritionDay.totalProtein}g
                  </span>
                  <span className="font-heading text-xs text-muted-foreground">
                    Proteína
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Wheat className="size-4 text-yellow-400" />
                <div className="flex flex-col">
                  <span className="font-heading text-sm font-semibold">
                    {todayNutritionDay.totalCarbs}g
                  </span>
                  <span className="font-heading text-xs text-muted-foreground">
                    Carboidratos
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="size-4 text-blue-400" />
                <div className="flex flex-col">
                  <span className="font-heading text-sm font-semibold">
                    {todayNutritionDay.totalFat}g
                  </span>
                  <span className="font-heading text-xs text-muted-foreground">
                    Gordura
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}