"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL!;

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discord-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      toast.success("Feedback enviado! Obrigado 🙏");
      setMessage("");
    } catch {
      toast.error("Erro ao enviar feedback. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl bg-muted p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-primary" />
        <span className="font-heading text-sm font-semibold text-foreground">
          Enviar Feedback
        </span>
      </div>
      <textarea
        placeholder="O que você acha que poderia melhorar no app?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-heading text-sm outline-none focus:border-primary"
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={loading || !message.trim()}
        className="w-full"
      >
        {loading ? "Enviando..." : "Enviar"}
      </Button>
    </div>
  );
}
