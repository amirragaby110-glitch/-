"use client";
// 🍄 شکارِ گنوم — گنوم‌هایِ ریزِ پنهان در گوشه‌وکنارِ صفحات؛ کلیکشان کن تا در فهرستِ جانوریِ شهر ثبت شوند
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHydrated } from "./ui";
import { useProgress, collectGnome } from "@/lib/progress";
import { bgFx } from "./Background";
import { sfx } from "./Shell";

// ۱۶ جایِ ثابت (درصد از viewport) — دور از نوارِ پایینِ موبایل
type Spot = { t: number; l?: number; r?: number };
const SPOTS: Spot[] = [
  { t: 22, l: 3 }, { t: 64, r: 4 }, { t: 12, r: 9 }, { t: 47, l: 2 },
  { t: 71, l: 8 }, { t: 33, r: 3 }, { t: 8, l: 44 }, { t: 58, r: 30 },
  { t: 26, l: 30 }, { t: 68, r: 46 }, { t: 15, l: 66 }, { t: 50, r: 62 },
  { t: 75, l: 48 }, { t: 38, r: 12 }, { t: 9, l: 18 }, { t: 62, l: 68 },
];
function Gnome({ hue = 0 }: { hue?: number }) {
  return (
    <svg viewBox="0 0 60 74" style={{ filter: `hue-rotate(${hue}deg)` }}>
      <path d="M30 2 L52 40 L8 40 Z" fill="#c0392b" stroke="#7c1f18" strokeWidth="2.5" />
      <circle cx="30" cy="46" r="13" fill="#e8b98a" stroke="#8a6238" strokeWidth="2" />
      <path d="M18 52 Q30 72 42 52 Q36 60 30 58 Q24 60 18 52Z" fill="#f5f0e6" stroke="#c9c2b2" strokeWidth="1.4" />
      <circle cx="25" cy="44" r="1.9" fill="#231207" /><circle cx="35" cy="44" r="1.9" fill="#231207" />
      <path d="M28 49 Q30 51 32 49" stroke="#8a5a3a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="21" y="60" width="18" height="11" rx="4" fill="#2c6a41" stroke="#173a22" strokeWidth="2" />
      <rect x="18" y="69" width="7" height="4.5" rx="2" fill="#7c4a1e" /><rect x="35" y="69" width="7" height="4.5" rx="2" fill="#7c4a1e" />
    </svg>
  );
}
export function GnomeSpot({ i, hue = 0 }: { i: number; hue?: number }) {
  const gid = `g${i}`;
  const got = useProgress(s => s.gnomes.includes(gid));
  const [pop, setPop] = useState(false);
  const pos = SPOTS[i % SPOTS.length];
  const style: React.CSSProperties = { top: `${pos.t}%` };
  if (pos.l !== undefined) style.left = `${pos.l}%`; else style.right = `${pos.r ?? 4}%`;
  const h = useHydrated();
  const hit = () => {
    if (got) { setPop(true); setTimeout(() => setPop(false), 700); return; }
    if (collectGnome(gid)) { sfx("open"); bgFx.kick("mote"); }
  };
  if (!h) return null;
  return (
    <button onClick={hit} title={got ? "این گنوم قبلاً پیداشد — ثبتِ سازمانِ حیات‌وحش" : "یه چیزی این‌جا قایم شده؟…"} aria-label="گنومِ پنهان"
      className={`fixed z-[45] h-9 w-9 cursor-pointer transition-all duration-300 sm:h-11 sm:w-11 ${got ? "opacity-30 saturate-0" : "opacity-25 hover:scale-125 hover:opacity-100 hover:drop-shadow-[0_0_14px_rgba(159,212,138,0.9)]"}`}
      style={style}>
      <Gnome hue={pop ? 90 : hue} />
      <AnimatePresence>
        {pop && (
          <motion.span key="p" initial={{ scale: 0.4, opacity: 1, y: 0 }} animate={{ scale: 1.6, opacity: 0, y: -26 }} exit={{ opacity: 0 }}
            className="absolute inset-0 grid place-items-center text-xl">
            {got ? "✓" : "✨"}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
export default function GnomeHunt() { return null; }
