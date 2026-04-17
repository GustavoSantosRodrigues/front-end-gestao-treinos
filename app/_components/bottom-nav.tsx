import Link from "next/link";
import {
  House,
  Calendar,
  ChartNoAxesColumn,
  UserRound,
  Salad,
  Users,
} from "lucide-react";
import dayjs from "dayjs";
import { getHomeData } from "@/app/_lib/api/fetch-generated";
import { cn } from "@/lib/utils";
import { ChatOpenButton } from "@/app/_components/chat-open-button";
import { getUserTrainData } from "@/app/_lib/api/fetch-generated";



interface BottomNavProps {
  activePage?: "home" | "calendar" | "nutrition" | "stats" | "profile" | "students";
}

export async function BottomNav({ activePage = "home" }: BottomNavProps) {
  const today = dayjs();
  const [homeData, trainData] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD")),
    getUserTrainData(),
  ]);

  const isTrainer = trainData.status === 200 && trainData.data?.isTrainer === true;

  const calendarHref =
    homeData.status === 200 && homeData.data.activeWorkoutPlanId
      ? `/workout-plans/${homeData.data.activeWorkoutPlanId}`
      : null;


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-1 rounded-t-4xl border border-border bg-background px-1 py-4">
      <Link href="/" className="p-3">
        <House
          className={cn(
            "size-6",
            activePage === "home" ? "text-primary" : "text-foreground/30"
          )}
        />
      </Link>

      {calendarHref ? (
        <Link href={calendarHref} className="p-3">
          <Calendar
            className={cn(
              "size-6",
              activePage === "calendar"
                ? "text-primary"
                : "text-foreground/30"
            )}
          />
        </Link>
      ) : (
        <button className="p-3">
          <Calendar
            className={cn(
              "size-6",
              activePage === "calendar"
                ? "text-primary"
                : "text-foreground/30"
            )}
          />
        </button>
      )}

      <ChatOpenButton />

      <Link href="/nutrition" className="p-3">
        <Salad
          className={cn(
            "size-6",
            activePage === "nutrition"
              ? "text-primary"
              : "text-foreground/30"
          )}
        />
      </Link>

      <Link href="/stats" className="p-3">
        <ChartNoAxesColumn
          className={cn(
            "size-6",
            activePage === "stats"
              ? "text-primary"
              : "text-foreground/30"
          )}
        />
      </Link>

      <Link href="/profile" className="p-3">
        <UserRound
          className={cn(
            "size-6",
            activePage === "profile"
              ? "text-primary"
              : "text-foreground/30"
          )}
        />
      </Link>

      {isTrainer && (
        <Link href="/students" className="p-3">
          <Users
            className={cn(
              "size-6",
              activePage === "students"
                ? "text-primary"
                : "text-foreground/30"
            )}
          />
        </Link>
      )}
    </nav>
  );
}