import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/app/_lib/auth-client";
import { getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { customFetch } from "@/app/_lib/fetch";
import { BottomNav } from "@/app/_components/bottom-nav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Weight, Ruler, BicepsFlexed, User, UserCheck } from "lucide-react";
import { LogoutButton } from "./_components/logout-button";
import { WhatsappButton } from "./_components/whatsapp-button";
import { LogoAI } from "../_components/logo-ai";
import { LinkTrainerForm } from "./_components/LinkTrainerForm";
import { TrainerToggle } from "./_components/TrainerToggle";

interface TrainerLink {
  id: string;
  status: string;
  trainer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}



async function getMyTrainers() {
  return customFetch<{ status: number; data: TrainerLink[] }>("/trainer/my-trainers", {
    method: "GET",
  });
}

export default async function ProfilePage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (!session.data?.user) redirect("/auth");

  const [trainData, trainersData] = await Promise.all([
    getUserTrainData(),
    getMyTrainers(),
  ]);

  if (trainData.status !== 200) throw new Error("Failed to fetch user train data");

  const needsOnboarding = !trainData.data || ("incomplete" in trainData.data && trainData.data.incomplete);
  const isTrainer = trainData.data?.isTrainer ?? false;

  if (needsOnboarding && !isTrainer) redirect("/onboarding");

  const user = session.data.user;
  const data = trainData.data;
  const trainers = trainersData.status === 200 ? trainersData.data : [];

  const weightInKg = data && "weightInGrams" in data ? data.weightInGrams / 1000 : null;
  const heightInCm = data && "heightInCentimeters" in data ? data.heightInCentimeters : null;
  const bodyFatPercentage = data && "bodyFatPercentage" in data ? data.bodyFatPercentage : null;
  const age = data && "age" in data ? data.age : null;

  
  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <LogoAI />

      <div className="flex flex-col items-center gap-5 px-5 pt-5">
        {/* Avatar + Nome */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-13">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-lg font-semibold leading-[1.05] text-foreground">
                {user.name}
              </h1>
              <p className="font-heading text-sm leading-[1.15] text-foreground/70">
                Plano Basico
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid w-full grid-cols-2 gap-3">
          {[
            { icon: Weight, value: weightInKg ?? "-", label: "Kg" },
            { icon: Ruler, value: heightInCm ?? "-", label: "Cm" },
            { icon: BicepsFlexed, value: bodyFatPercentage != null ? `${bodyFatPercentage}%` : "-", label: "Gc" },
            { icon: User, value: age ?? "-", label: "Anos" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-5 rounded-xl bg-primary/8 p-5">
              <div className="flex items-center rounded-full bg-primary/8 p-2.25">
                <Icon className="size-4 text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-heading text-2xl font-semibold leading-[1.15] text-foreground">
                  {value}
                </span>
                <span className="font-heading text-xs uppercase leading-[1.4] text-muted-foreground">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Meus Personais — só para alunos */}
        {!isTrainer && trainers.length > 0 && (
          <div className="flex w-full flex-col gap-3 rounded-xl bg-muted p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4 text-primary" />
              <span className="font-heading text-sm font-semibold text-foreground">
                Meus Personais
              </span>
            </div>

            {trainers.map((link) => (
              <div key={link.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-13">
                    <AvatarImage src={link.trainer.image ?? undefined} />
                    <AvatarFallback>
                      {link.trainer.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      {link.trainer.name}
                    </span>
                    <span className="font-heading text-xs text-muted-foreground">
                      {link.trainer.email}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={link.status === "ACTIVE" ? "default" : "outline"}
                  className="font-heading text-xs"
                >
                  {link.status === "ACTIVE" ? "Ativo" : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <TrainerToggle isTrainer={data?.isTrainer || false} />
        <LinkTrainerForm />
        <WhatsappButton />
        <LogoutButton />
      </div>

      <BottomNav activePage="profile" />
    </div>
  );
}