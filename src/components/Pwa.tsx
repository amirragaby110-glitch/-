"use client";
import { useEffect, useState } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("/sw.js").catch(() => { });
    }
  }, []);
  return null;
}
export function useInstallPrompt() {
  const [ev, setEv] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEv(e); };
    addEventListener("beforeinstallprompt", h);
    addEventListener("appinstalled", () => { setInstalled(true); setEv(null); });
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => removeEventListener("beforeinstallprompt", h);
  }, []);
  const promptInstall = async () => { if (ev) { ev.prompt(); await ev.userPromise?.catch?.(() => { }); setEv(null); } };
  return { canInstall: !!ev, installed, promptInstall };
}
