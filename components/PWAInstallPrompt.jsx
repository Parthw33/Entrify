"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check local storage for previously dismissed state with 24-hour expiration
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hours24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (now - dismissedTime < hours24) {
        setIsDismissed(true);
      } else {
        // Clear expired dismissal
        localStorage.removeItem("pwa-install-dismissed");
      }
    }

    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();

    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        setIsInstalled(true);
      } else {
        console.log("User dismissed the install prompt");
      }
    });
  };

  const onDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!supportsPWA || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-muted max-w-xs">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Install स्नेहबंध App for better experience
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Install the app on your home screen for easy access
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onClick} size="sm" className="gap-2 w-full">
            <PlusCircle className="h-4 w-4" />
            <span>Install Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
