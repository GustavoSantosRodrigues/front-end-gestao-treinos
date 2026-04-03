import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/app/_components/bottom-nav";
import { LogoAI } from "@/app/_components/logo-ai";
import { WorkoutDayCard } from "@/app/_components/workout-day-card";
import { customFetch } from "@/app/_lib/fetch";
import { ChevronLeft, Goal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { RestDayCard } from "@/app/workout-plans/_components/rest-day-card";
import type { GetHomeData200TodayWorkoutDayWeekDay } from "@/app/_lib/api/fetch-generated";

const WEEKDAY_ORDER: GetHomeData200TodayWorkoutDayWeekDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface WorkoutDay {
  id: string;
  name: string;
  weekDay: GetHomeData200TodayWorkoutDayWeekDay;
  isRest: boolean;
  estimatedDurationInSeconds: number;
  exercisesCount: number;
  coverImageUrl: string | null;
}

interface WorkoutPlan {
  id: string;
  name: string;
  workoutDays: WorkoutDay[];
}

async function getStudentPlans(studentId: string) {
  return customFetch<{ status: number; data: WorkoutPlan[] }>(
    `/trainer/students/${studentId}/plans`,
    { method: "GET" }
  );
}

export default async function StudentPlansPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (!session.data?.user) redirect("/auth");

  const { studentId } = await params;

  const [trainData, plansData] = await Promise.all([
    getUserTrainData(),
    getStudentPlans(studentId),
  ]);

  const data = trainData.status === 200 ? trainData.data : null;
  const isTrainer = data?.isTrainer ?? false;

  if (!data) redirect("/onboarding/role");
  if (!isTrainer) redirect("/profile");

  if (plansData.status !== 200) redirect("/students");

  const plans = plansData.data ?? [];
  const activePlan = plans[0] ?? null;

  if (!activePlan) {
    return (
      <div className="flex min-h-svh flex-col bg-background pb-24">
        <div className="px-5 pt-5">
          <LogoAI />
        </div>
        <div className="flex flex-col items-center gap-3 px-5 pt-12">
          <p className="font-heading text-sm text-muted-foreground">
            Este aluno ainda não tem plano de treino.
          </p>
          <Link href="/students" className="font-heading text-sm text-primary">
            ← Voltar para alunos
          </Link>
        </div>
        <BottomNav activePage="students" />
      </div>
    );
  }

  const sortedDays = [...activePlan.workoutDays].sort(
    (a, b) =>
      WEEKDAY_ORDER.indexOf(a.weekDay) - WEEKDAY_ORDER.indexOf(b.weekDay)
  );

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="relative flex h-[296px] shrink-0 flex-col items-start justify-between overflow-hidden rounded-b-[20px] px-5 pb-10 pt-5">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/workout-plan-banner.png"
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

        <div className="relative flex w-full items-center justify-between">
          <Link
            href="/students"
            className="flex items-center gap-1 font-heading text-xs text-background/80"
          >
            <ChevronLeft className="size-4" />
            Voltar
          </Link>
          <LogoAI />
          <div className="size-6" />
        </div>

        <div className="relative flex w-full items-end justify-between">
          <div className="flex flex-col gap-3">
            <Badge className="gap-1 rounded-full px-2.5 py-1.5 font-heading text-xs font-semibold uppercase">
              <Goal className="size-4" />
              {activePlan.name}
            </Badge>
            <h1 className="font-heading text-2xl font-semibold leading-[1.05] text-background">
              Plano do Aluno
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        {sortedDays.map((day) =>
          day.isRest ? (
            <RestDayCard key={day.id} weekDay={day.weekDay} />
          ) : (
            <Link
              key={day.id}
              href={`/workout-plans/${activePlan.id}/days/${day.id}`}
            >
                 <WorkoutDayCard
                name={day.name}
                weekDay={day.weekDay}
                estimatedDurationInSeconds={day.estimatedDurationInSeconds}
                exercisesCount={day.exercisesCount}
                coverImageUrl={day.coverImageUrl || undefined} 
              />
            </Link>
          )
        )}
      </div>

      <BottomNav activePage="students" />
    </div>
  );
}