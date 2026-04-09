"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ImagePlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clientFetch } from "@/app/_lib/client-fetch";
import { useUploadThing } from "@/app/api/uploadthing";
import { toast } from "sonner";

interface TrainerDayEditorProps {
  workoutPlanId: string;
  weekDay: string;
  currentName: string;
}

export function TrainerDayEditor({
  workoutPlanId,
  weekDay,
  currentName,
}: TrainerDayEditorProps) {
  const router = useRouter();

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(currentName);
  const [savingTitle, setSavingTitle] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(false); // 👈 novo

  const { startUpload } = useUploadThing("coverImageUploader", {
    onClientUploadComplete: async (res) => {
      const url = res[0]?.ufsUrl;
      if (!url) return;

      await clientFetch(`/workout-plans/${workoutPlanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutDays: [{ weekDay, coverImageUrl: url }],
        }),
      });

      setUploadingImage(false);
      setUploadError(false); // 👈
      toast.success("Imagem atualizada!");
      router.refresh();
    },
    onUploadError: () => {
      setUploadingImage(false);
      setUploadError(true); // 👈
      toast.error("Erro ao enviar imagem. Verifique se o arquivo tem menos de 2MB.", {
        position: "top-center", // 👈 toast no centro/topo
      });
    },
  });

  const handleSaveTitle = async () => {
    if (!title.trim() || title === currentName) {
      setEditingTitle(false);
      return;
    }
    setSavingTitle(true);
    try {
      await clientFetch(`/workout-plans/${workoutPlanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutDays: [{ weekDay, name: title }],
        }),
      });
      router.refresh();
      setEditingTitle(false);
    } catch {
    } finally {
      setSavingTitle(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(false); // 👈 limpa erro ao tentar de novo
    setUploadingImage(true);
    await startUpload([file]);
  };

  return (
    <div className="flex items-center gap-2 px-5 pt-3">
      {editingTitle ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="h-9 flex-1 rounded-lg border border-border bg-background px-3 font-heading text-sm outline-none focus:border-primary"
          />
          <Button
            size="icon"
            variant="ghost"
            disabled={savingTitle}
            onClick={handleSaveTitle}
            className="size-9"
          >
            {savingTitle ? (
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Check className="size-4 text-primary" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setTitle(currentName);
              setEditingTitle(false);
            }}
            className="size-9"
          >
            <X className="size-4 text-destructive" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingTitle(true)}
          className="gap-2 font-heading text-xs"
        >
          <Pencil className="size-3.5" />
          Editar título
        </Button>
      )}

      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          disabled={uploadingImage}
        />
        {/* 👇 borda e texto ficam vermelhos se uploadError=true */}
        <div className={`flex h-9 items-center gap-2 rounded-lg border px-3 font-heading text-xs font-medium transition-colors
          ${uploadError
            ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {uploadingImage ? (
            <div className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <ImagePlus className="size-3.5" />
          )}
          {uploadingImage ? "Enviando..." : uploadError ? "Erro — tentar novamente" : "Trocar imagem"}
        </div>
      </label>
    </div>
  );
}