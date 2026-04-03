"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientFetch } from "@/app/_lib/client-fetch";
import { Button } from "@/components/ui/button";

interface AcceptStudentButtonProps {
  linkId: string;
}

export function AcceptStudentButton({ linkId }: AcceptStudentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "accept" | "reject") => {
    setLoading(true);
    try {
      await clientFetch(`/trainer/students/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() => handleAction("reject")}
        className="h-8 font-heading text-xs text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        Recusar
      </Button>
      <Button
        size="sm"
        disabled={loading}
        onClick={() => handleAction("accept")}
        className="h-8 font-heading text-xs"
      >
        Aceitar
      </Button>
    </div>
  );
}