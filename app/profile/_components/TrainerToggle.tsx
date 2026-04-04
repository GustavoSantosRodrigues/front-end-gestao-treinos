"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { clientFetch } from "@/app/_lib/client-fetch";

interface TrainerToggleProps {
    isTrainer: boolean;
}

export function TrainerToggle({ isTrainer: initial }: TrainerToggleProps) {
    const [isTrainer, setIsTrainer] = useState(initial);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            await clientFetch("/trainer/become", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isTrainer: !isTrainer }),
            });
            setIsTrainer((prev) => !prev);
        } catch {
        } finally {
            setLoading(false);
        }
    };
    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex w-full items-center justify-between rounded-xl p-4 transition-colors ${isTrainer
                    ? "bg-primary/10"
                    : "bg-muted hover:bg-muted/80"
                } cursor-pointer`}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full bg-primary/10 p-2">
                    <Dumbbell className="size-4 text-primary" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                    <span className="font-heading text-sm font-semibold text-foreground">
                        {isTrainer ? "Você é Personal Trainer" : "Sou Personal Trainer"}
                    </span>
                    <span className="font-heading text-xs text-muted-foreground">
                        {isTrainer
                            ? "Acesse seus alunos na aba de treinos"
                            : "Ative para gerenciar alunos"}
                    </span>
                </div>
            </div>

            <div
                className={`size-5 rounded-full border-2 transition-colors ${isTrainer
                    ? "border-primary bg-primary"
                    : "border-muted-foreground bg-transparent"
                    }`}
            />
        </button>
    );
}