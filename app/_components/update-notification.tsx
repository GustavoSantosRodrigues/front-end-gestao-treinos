"use client";

import { useEffect, useState } from "react";

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let isRefreshing = false;

    const onControllerChange = () => {
      if (isRefreshing) return;
      isRefreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker.ready.then(async (registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      }

      await registration.update();

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(registration.waiting ?? newWorker);
            setShowUpdate(true);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground">
      {/* Header */}
      <div className="flex flex-col gap-2 px-6 pt-16 pb-8">
        <span className="font-heading text-4xl">🚀</span>
        <h1 className="font-heading text-2xl font-bold text-background">
          Nova versão disponível!
        </h1>
        <p className="font-heading text-sm text-background/70">
          Atualize para acessar as últimas melhorias do app.
        </p>
      </div>

      {/* Changelog */}
      <div className="flex flex-1 flex-col gap-3 px-6">
        <p className="font-heading text-xs font-semibold uppercase tracking-wider text-background/40">
          O que há de novo
        </p>
        <ul className="flex flex-col gap-4">
          <li className="flex items-start gap-3">
            <span className="text-xl">👨‍💼</span>
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-sm font-semibold text-background">
                Sistema de Personal Trainer
              </p>
              <p className="font-heading text-xs text-background/60">
                Personais podem ver e editar treinos dos alunos, trocar exercícios e personalizar o plano
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">🔥</span>
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-sm font-semibold text-background">
                Streak melhorado
              </p>
              <p className="font-heading text-xs text-background/60">
                Conta qualquer treino concluído, não zera mais por faltar um dia e acumula entre semanas
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">🖼️</span>
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-sm font-semibold text-background">
                Upload de imagem de capa
              </p>
              <p className="font-heading text-xs text-background/60">
                Personais podem personalizar a imagem de capa de cada dia de treino do aluno
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">✏️</span>
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-sm font-semibold text-background">
                Edição de título do treino
              </p>
              <p className="font-heading text-xs text-background/60">
                Personais podem editar o título de cada dia de treino diretamente pelo app
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">👥</span>
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-sm font-semibold text-background">
                Meus Personais no perfil
              </p>
              <p className="font-heading text-xs text-background/60">
                Alunos podem ver quais personais estão vinculados à sua conta direto no perfil
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Botão */}
      <div className="px-6 pb-12 pt-6">
        <button
          type="button"
          onClick={handleUpdate}
          className="w-full rounded-full bg-primary py-4 font-heading text-base font-semibold text-primary-foreground"
        >
          Atualizar agora
        </button>
      </div>
    </div>
  );
}