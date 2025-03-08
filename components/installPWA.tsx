// components/InstallPWA.tsx
"use client";

import { useState, useEffect } from "react";

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<Event | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    // Show the install prompt
    (promptInstall as any).prompt();
    // Wait for the user to respond to the prompt
    (promptInstall as any).userChoice.then(
      (choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setPromptInstall(null);
      }
    );
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <button
      className="pwa-install-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={onClick}
    >
      Install App
    </button>
  );
};

export default InstallPWA;
