"use client";
// پوستهٔ سراسری: پس‌زمینۀ سه‌بعدی + ناوبری + پالت فرمان + اثراتِ «حالِ بیل» + PWA
import { useEffect, useState } from "react";
import Background from "./Background";
import Shell from "./Shell";
import CommandPalette from "./CommandPalette";
import CursorTrail from "./CursorTrail";
import { PwaRegister } from "./Pwa";
import { useSettings } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { ScaryEye } from "./ui";
import MiniPlayer from "./MiniPlayer";
import { XPFloater } from "./XPFloater";
import { AmbientDock } from "./AmbientUI";
import WeirdEgg from "./WeirdEgg";

let scareCtx: AudioContext | null = null;
const WHISPERS = [
  "بیدار بمان…", "وقتش رسیده", "یادت هست؟", "پشت سرت رو نگاه نکن", "تابستان تا ابد ادامه دارد",
  "من همه‌جا هستم", "سه… سیزده…", "خوابِ تو، خانهٔ من", "درباز موند",
];

function HorrorFX() {
  const horror = useSettings(s => s.horrorMode);
  const [flash, setFlash] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);
  useEffect(() => {
    document.documentElement.classList.toggle("scary", horror);
    if (!horror) return;
    let stop = false;
    const schedule = () => {
      if (stop) return;
      const wait = 14000 + Math.random() * 26000;
      window.setTimeout(() => {
        if (stop) return;
        const mode = Math.random();
        if (mode < 0.45) {
          setFlash(true); window.setTimeout(() => setFlash(false), 950);
        } else if (mode < 0.75) {
          const w = WHISPERS[(Math.random() * WHISPERS.length) | 0];
          setWhisper(w); window.setTimeout(() => setWhisper(null), 3600);
        } else {
          const AC = window.AudioContext || (window as any).webkitAudioContext;
          try {
            const ctx: AudioContext = scareCtx || (scareCtx = new (AC as any)());
            const t = ctx.currentTime;
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = "sawtooth"; o.frequency.setValueAtTime(58, t); o.frequency.exponentialRampToValueAtTime(27, t + 1.4);
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
            o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.7);
          } catch { }
        }
        schedule();
      }, wait);
    };
    schedule();
    return () => { stop = true; document.documentElement.classList.remove("scary"); };
  }, [horror]);
  return (
    <>
      <div className="vignette" />
      <AnimatePresence>
        {flash && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.2, 0.95, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.95 }}
            className="pointer-events-none fixed inset-0 z-[85] grid place-items-center bg-black/80">
            <ScaryEye open={1} className="w-72 drop-shadow-[0_0_60px_rgba(157,92,255,0.9)]" />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {whisper && (
          <motion.div key={whisper} initial={{ opacity: 0, y: 8 }} animate={{ opacity: [0, 1, 1, 0], y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 3.6 }}
            className="pointer-events-none fixed inset-x-0 bottom-[18vh] z-[85] text-center">
            <span className="title-creep glow-red text-2xl tracking-[0.4em] text-red-300/80">{whisper}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Root({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState(false);
  const bgEnabled = useSettings(s => s.bgEnabled);
  return (
    <>
      {bgEnabled && <Background />}
      <CursorTrail />
      <HorrorFX />
      <Shell onOpenPalette={() => setPalette(true)}>{children}</Shell>
      <CommandPalette open={palette} onClose={() => setPalette(false)} onOpen={() => setPalette(true)} />
      <PwaRegister />
      <MiniPlayer />
      <XPFloater />
      <AmbientDock />
      <WeirdEgg />
    </>
  );
}
