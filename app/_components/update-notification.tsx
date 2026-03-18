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
      // Se já existe uma nova versão aguardando ativação
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      }

      // Força checagem por atualização
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
    <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 rounded-2xl bg-foreground px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-sm font-semibold text-background">
          🚀 Nova versão disponível!
        </p>

        <button
          type="button"
          onClick={handleUpdate}
          className="shrink-0 rounded-full bg-primary px-3 py-1.5 font-heading text-xs font-semibold text-primary-foreground"
        >
          Atualizar
        </button>
      </div>

      <ul className="flex flex-col gap-0.5">
        <li className="font-heading text-xs text-background/70">
          🥗 Plano nutricional com IA
        </li>
        <li className="font-heading text-xs text-background/70">
          ⚡ Botão de iniciar treino na home
        </li>
        <li className="font-heading text-xs text-background/70">
          🏠 Resumo de macros na home
        </li>
        <li className="font-heading text-xs text-background/70">
          🧪 Teste de notificação
        </li>
      </ul>
    </div>
  );
}