"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { clientFetch } from "@/app/_lib/client-fetch";
import { Button } from "@/components/ui/button";

// 🔹 Tipos da API
type LinkTrainerSuccess = {
  message: string;
};

type LinkTrainerError = {
  code:
  | "ALREADY_LINKED"
  | "TRAINER_NOT_FOUND"
  | "USER_IS_NOT_TRAINER"
  | "CANNOT_LINK_YOURSELF";
};

type LinkTrainerApiResponse = {
  status: number;
  data: LinkTrainerSuccess | LinkTrainerError;
};

export function LinkTrainerForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await clientFetch<LinkTrainerApiResponse>("/trainer/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerEmail: email }),
      });

      if (res.status === 200) {
        setMessage({
          type: "success",
          text: "Solicitação enviada! Aguarde o personal aceitar.",
        });
        setEmail("");
        return;
      }

      // 🔹 Tratamento de erros tipado
      if ("code" in res.data) {
        switch (res.data.code) {
          case "ALREADY_LINKED":
            setMessage({
              type: "error",
              text: "Você já está vinculado a esse personal.",
            });
            break;

          case "TRAINER_NOT_FOUND":
            setMessage({
              type: "error",
              text: "Personal não encontrado com esse email.",
            });
            break;

          case "USER_IS_NOT_TRAINER":
            setMessage({
              type: "error",
              text: "Esse usuário não é um personal trainer.",
            });
            break;
          case "CANNOT_LINK_YOURSELF":
            setMessage({
              type: "error",
              text: "Você não pode vincular seu próprio email.",
            });
            break;


          default:
            setMessage({
              type: "error",
              text: "Erro ao enviar solicitação. Tente novamente.",
            });
        }
      } else {
        setMessage({
          type: "error",
          text: "Erro ao enviar solicitação. Tente novamente.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erro ao enviar solicitação. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl bg-muted p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full bg-primary/10 p-2">
          <UserCheck className="size-4 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm font-semibold text-foreground">
            Vincular Personal
          </span>
          <span className="font-heading text-xs text-muted-foreground">
            Digite o email do seu personal trainer
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="email@personal.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 font-heading text-sm outline-none focus:border-primary"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={loading || !email}
          className="h-10"
        >
          {loading ? "..." : "Enviar"}
        </Button>
      </div>

      {message && (
        <p
          className={`font-heading text-xs ${message.type === "success"
              ? "text-green-600"
              : "text-destructive"
            }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
// 123456789