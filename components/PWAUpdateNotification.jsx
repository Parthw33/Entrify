"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function PWAUpdateNotification() {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Listen for new service worker
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setNewVersionAvailable(true);
                setWaitingWorker(newWorker);
              }
            });
          });
        });
      });
    }
  }, []);

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setNewVersionAvailable(false);
    }
  };

  if (!newVersionAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-muted max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium">नवीन अपडेट उपलब्ध आहे</div>
        <p className="text-xs text-muted-foreground">
          ऍप अपडेट करण्यासाठी खालील बटण दाबा
        </p>
        <Button
          onClick={updateApp}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>अपडेट करा</span>
        </Button>
      </div>
    </div>
  );
}
