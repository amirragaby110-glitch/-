"use client";
// 🎩 تخم‌مرغِ مخفی — تایپِ «۶۱۸» یا «618» در هر صفحه‌ای: ۱۳ ثانیه «ویرد‌مگددون»
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { bumpCounter } from "@/lib/progress";
import { bgFx } from "./Background";
import { ambient } from "@/lib/ambient";
import { ScaryEye } from "./ui";
import { useSettings } from "@/lib/store";

export default function WeirdEgg() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let buf = ""; let timer = 0 as unknown as ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt && /INPUT|TEXTAREA|SELECT/.test(tgt.tagName)) return;
      const ch = e.key;
      if (!/^[0-9]$/.test(ch)) { if (ch.length > 1) return; buf = ""; return; }
      buf = (buf + ch).slice(-6);
      if (buf.endsWith("618") || buf.endsWith("۶۱۸")) {
        buf = ""; setOn(true);
        document.documentElement.classList.add("weird");
        bgFx.kick("eye");
        try { ambient.jumpscare(); } catch { }
        bumpCounter("eggs", 1, "🎩 او تو را دید…", 50);
        useSettings.getState().set({ horrorMode: true });
        clearTimeout(timer); timer = setTimeout(() => { setOn(false); document.documentElement.classList.remove("weird"); }, 13000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(timer); document.documentElement.classList.remove("weird"); };
  }, []);
  if (!on) return null;
  return (
    <motion.div key="weird" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.9, 1, 0.8, 1, 0] }} exit={{ opacity: 0 }}
      transition={{ duration: 13, times: [0, 0.04, 0.08, 0.3, 0.55, 0.9, 1] }}
      className="pointer-events-none fixed inset-0 z-[91] grid place-items-center overflow-hidden bg-magic/10 backdrop-[blur(2px)]">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_4px,rgba(157,92,255,0.16)_4px_5px)]" />
      <div className="relative text-center">
        {[0, 1, 2].map(i => (
          <ScaryEye key={i} open={0.95} className="floaty mx-auto mb-2 w-40 opacity-90 drop-shadow-[0_0_44px_rgba(157,92,255,1)]" />
        ))}
        <div className="title-creep glow-red animate-pulse text-4xl tracking-[0.3em] text-red-300 sm:text-6xl">REALITY.EXE</div>
        <div className="mt-2 text-sm font-black tracking-[0.5em] opacity-70">متوقف شد — ۶۱۸ · Area Code</div>
      </div>
    </motion.div>
  );
}
