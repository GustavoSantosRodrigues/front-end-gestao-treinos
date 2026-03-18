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
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto flex max-w-md flex-col gap-3 rounded-3xl bg-foreground px-5 py-4 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-base font-semibold text-background">
            🚀 Nova versão disponível!
          </p>
          <p className="font-heading text-sm text-background/70">
            Atualize para acessar as últimas melhorias do app.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUpdate}
          className="shrink-0 rounded-full bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground"
        >
          Atualizar
        </button>
      </div>

      <ul className="flex flex-col gap-1">
        <li className="font-heading text-xs text-background/70">
          🥗 Plano nutricional com IA — agora você consegue montar seu plano alimentar personalizado conversando com a IA, com refeições, macros e substituições
        </li>
        <li className="font-heading text-xs text-background/70">
          ⚡ Iniciar treino pela home — ficou mais fácil! Agora você inicia, continua ou vê o status do treino direto na tela inicial
        </li>
        <li className="font-heading text-xs text-background/70">
          🏠 Macros na home — acompanhe suas calorias, proteína, carboidratos e gordura do dia sem precisar entrar no plano
        </li>
      </ul>
    </div>
  );
}