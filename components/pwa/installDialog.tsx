"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false);

  useEffect(() => {
    // Don't show banner if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Check if the user has dismissed the banner before
    const bannerDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (bannerDismissed === "true") {
      return;
    }

    // Check if installation is available
    const handleBeforeInstallPrompt = () => {
      setInstallPromptAvailable(true);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show banner after a delay if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center">
        <p className="mr-4">
          Experience our app at its best by installing it on your device!
        </p>
        <div className="flex gap-2">
          <Link
            href="/install"
            className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium"
          >
            How to Install
          </Link>
          <button
            onClick={dismissBanner}
            className="text-white"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
