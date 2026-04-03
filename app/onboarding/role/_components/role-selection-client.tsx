"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, User } from "lucide-react";
import { clientFetch } from "@/app/_lib/client-fetch";

export default function RoleSelectionClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStudent = () => {
    router.push("/onboarding");
  };

  const handleTrainer = async () => {
    setLoading(true);
    try {
      await clientFetch("/trainer/become", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrainer: true }),
      });
      router.push("/profile");
    } catch {
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Como você quer usar o app?
        </h1>
        <p className="font-heading text-sm text-muted-foreground">
          Escolha seu perfil para continuar
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={handleStudent}
          disabled={loading}
          className="flex items-center gap-4 rounded-xl border border-border bg-background p-5 text-left transition-colors hover:bg-muted"
        >
          <div className="flex items-center rounded-full bg-primary/10 p-3">
            <User className="size-5 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold text-foreground">
              Sou Aluno
            </span>
            <span className="font-heading text-xs text-muted-foreground">
              Quero montar e acompanhar meus treinos
            </span>
          </div>
        </button>

        <button
          onClick={handleTrainer}
          disabled={loading}
          className="flex items-center gap-4 rounded-xl border border-border bg-background p-5 text-left transition-colors hover:bg-muted"
        >
          <div className="flex items-center rounded-full bg-primary/10 p-3">
            <Dumbbell className="size-5 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold text-foreground">
              Sou Personal Trainer
            </span>
            <span className="font-heading text-xs text-muted-foreground">
              Quero gerenciar treinos dos meus alunos
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}