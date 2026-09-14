"use client";
// 🏅 شناورِ XP + کارتِ «دستاورد باز شد» + چیپِ سطح در هدر
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress, levelInfo, type AwardEvent } from "@/lib/progress";
import { ACHIEVEMENTS } from "@/data/achievements";
import { faNum } from "@/lib/utils";
import { useHydrated } from "./ui";

interface Floater extends AwardEvent { k: number }
export function XPFloater() {
  const [list, setList] = useState<Floater[]>([]);
  const k = useRef(0);
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent<AwardEvent>).detail;
      if (!d) return;
      const item = { ...d, k: ++k.current };
      setList(l => [...l.slice(-3), item]);
      setTimeout(() => setList(l => l.filter(x => x.k !== item.k)), d.kind === "ach" || d.kind === "level" ? 3800 : 2300);
    };
    window.addEventListener("gf-award", h);
    return () => window.removeEventListener("gf-award", h);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[92] flex flex-col items-center gap-1.5 px-4">
      <AnimatePresence>
        {list.map(f => f.kind === "ach" ? (
          <motion.div key={f.k} initial={{ y: -24, opacity: 0, scale: 0.85 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -14, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.42 }}
            className="glass flex items-center gap-3 rounded-2xl border border-gold/40 px-4 py-2.5 shadow-[0_0_44px_-6px_rgba(224,182,79,0.5)]">
            <span className="animate-bounce text-2xl">{f.icon}</span>
            <span>
              <span className="block text-[0.6rem] font-black tracking-[0.25em] text-gold/80">دستاورد باز شد · +{faNum(f.xp)} XP</span>
              <span className="block text-sm font-black">{f.title}</span>
            </span>
          </motion.div>
        ) : f.kind === "level" ? (
          <motion.div key={f.k} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl border border-magic/50 px-5 py-2.5 text-center shadow-[0_0_60px_-8px_rgba(157,92,255,0.65)]">
            <span className="title-creep glow-magic block text-xl text-magic2">⬆️ ارتقایِ سطح!</span>
            <span className="block text-xs font-bold opacity-80">{f.label}</span>
          </motion.div>
        ) : (
          <motion.div key={f.k} initial={{ y: -16, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -10, opacity: 0 }}
            className={`glass flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black ${f.kind === "gnome" ? "border border-pine/40 text-pine" : f.kind === "scroll" ? "border border-magic/50 text-magic2" : "border border-gold/40 text-gold"}`}>
            {f.icon && <span>{f.icon}</span>}<span>{f.label}</span>
            {f.xp > 0 && <span className="rounded-full bg-gold/15 px-2 py-0.5 tabular-nums">+{faNum(f.xp)} XP</span>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function LevelChip() {
  const h = useHydrated();
  const xp = useProgress(s => s.xp);
  const earned = useProgress(s => s.earned);
  const info = levelInfo(xp);
  const n = Object.keys(earned).length;
  if (!h) return <span className="hidden h-9 w-28 rounded-full bg-white/5 md:block" aria-hidden />;
  return (
    <Link href="/profile" title={`سطحِ ${info.lvl} · ${info.rank} — پروفایلِ بازیکن`}
      className="group relative hidden h-9 items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 text-[0.68rem] font-black text-gold transition hover:bg-gold/20 md:flex">
      <svg viewBox="0 0 36 36" className="h-7 w-7 -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.5" />
        <circle cx="18" cy="18" r="15" fill="none" stroke="#e0b64f" strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={`${info.pct * 94.2} 999`} className="transition-all duration-700" />
      </svg>
      <span className="leading-4">
        <span className="block">Lv.{faNum(info.lvl)}</span>
        <span className="block text-[0.55rem] opacity-70">{faNum(xp)} XP · 🏅{faNum(n)}/{faNum(ACHIEVEMENTS.length)}</span>
      </span>
    </Link>
  );
}
