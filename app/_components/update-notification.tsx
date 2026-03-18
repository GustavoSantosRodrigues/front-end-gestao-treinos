"use client";

import { useEffect, useState } from "react";

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setShowUpdate(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl bg-foreground px-4 py-3 shadow-lg">
      <p className="font-heading text-sm font-medium text-background">
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
  );
}