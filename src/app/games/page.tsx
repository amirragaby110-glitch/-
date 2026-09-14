"use client";
// 🕹 تالارِ بازی — حافظه (۱ۥ کارت) + گنوم‌بزنِ ۳۰ ثانیه‌ای؛ امتیازها در پروفایل ثبت می‌شوند
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, useToast, useHydrated } from "@/components/ui";
import { addXp, bumpCounter, bestCounter, useProgress } from "@/lib/progress";
import { faNum } from "@/lib/utils";
import { sfx } from "@/components/Shell";
import { bgFx } from "@/components/Background";
import { GnomeSpot } from "@/components/GnomeHunt";

const SYMBOLS = [
  { i: "🎩", n: "کلاه بیل" }, { i: "👁️", n: "چشم" }, { i: "🌲", n: "کاج" }, { i: "📖", n: "ژورنال" },
  { i: "💎", n: "زمرد" }, { i: "🍄", n: "گنوم" }, { i: "🔥", n: "آتش" }, { i: "🎵", n: "ملودی" },
];
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[r[i], r[j]] = [r[j], r[i]]; } return r; }

function Memory() {
  const [deck, setDeck] = useState(() => shuffle(SYMBOLS.flatMap((s, i) => [{ k: i, ...s }, { k: i, ...s }])));
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const counted = useRef(false);
  const toast = useToast();
  const flipped = (idx: number) => {
    if (lock || done.includes(idx) || open.includes(idx)) return;
    sfx();
    const op = [...open, idx];
    setOpen(op);
    if (op.length === 2) {
      setMoves(m => m + 1);
      setLock(true);
      const [a, b] = op;
      if (deck[a].k === deck[b].k) {
        setTimeout(() => { setDone(d => [...d, a, b]); setOpen([]); setLock(false); }, 420);
      } else {
        setTimeout(() => { setOpen([]); setLock(false); }, 780);
      }
    }
  };
  useEffect(() => {
    if (!deck.length || done.length !== deck.length || counted.current) return;
    counted.current = true;
    const mm = moves;
    addXp(15 + (mm <= 12 ? 20 : 0), `حافظه برده شد — ${faNum(mm)} حرکت 🧠`, "xp", "🧠");
    bestCounter("memMoves", 999 - mm);
    bumpCounter("memWins", 1, undefined, 0);
    if (mm <= 12) bumpCounter("memPerfect", 1, "حافظهٔ بی‌نقص! 🌟", 10);
    toast.show(`🏆 برد! ${faNum(mm)} حرکت — XP گرفتی`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, deck.length]);
  const reset = () => {
    setDeck(shuffle(SYMBOLS.flatMap((s, i) => [{ k: i, ...s }, { k: i, ...s }])));
    setOpen([]); setDone([]); setMoves(0); setLock(false); counted.current = false;
  };
  const won = done.length === deck.length;
  return (
    <Panel className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-black">🧠 حافظهٔ جنگل</h3>
        <div className="flex items-center gap-2 text-[0.7rem] font-black opacity-70">
          <span className="chip !cursor-default">حرکت: {faNum(moves)}</span>
          <span className="chip !cursor-default">جفت: {faNum(done.length / 2)}/{faNum(SYMBOLS.length)}</span>
          <button className="btn btn-ghost ring-1 ring-white/10 !px-3 !py-1 !text-xs" onClick={() => { sfx(); reset(); }}>↻ دستِ تازه</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {deck.map((c, idx) => {
          const isUp = open.includes(idx) || done.includes(idx);
          return (
            <div key={idx} className={`[perspective:900px] ${done.includes(idx) ? "pointer-events-none opacity-80" : "cursor-pointer"}`} onClick={() => flipped(idx)}>
              <div className={`flip3d relative h-20 sm:h-28 ${isUp ? "flipped" : ""}`}>
                <div className="flipface absolute inset-0 grid place-items-center rounded-2xl border border-gold/25 bg-gradient-to-br from-night2 to-night text-2xl text-gold/60">✦</div>
                <div className={`flipface flipback absolute inset-0 grid place-items-center rounded-2xl border text-4xl ${done.includes(idx) ? "border-pine/60 bg-pine/15" : "border-magic/50 bg-magic/15"}`}>{c.i}</div>
              </div>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 rounded-2xl border border-gold/50 bg-gold/10 p-4 text-center">
            <div className="text-2xl">🏆</div>
            <div className="font-black text-gold">همه‌جفت‌ها با {faNum(moves)} حرکت!</div>
            <p className="mt-1 text-[0.7rem] opacity-70">{moves <= 12 ? "بی‌نقص — دستاورد «حافظۀ بی‌نقص» هم باز شد." : "۱۲ حرکت یا کمتر یعنی دستاوردِ «بی‌نقص» — دوباره تلاش کن."}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {toast.node}
    </Panel>
  );
}

function Whack() {
  const [phase, setPhase] = useState<"idle" | "run" | "end">("idle");
  const [holes, setHoles] = useState<number[]>(Array(9).fill(0)); // 0 خالی، 1 گنوم، 2 بیل
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const h2 = useHydrated();
  const best = useProgress(s => s.c.whackBest ?? 0);
  const scoreRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clean = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (popRef.current) clearInterval(popRef.current);
    timerRef.current = popRef.current = null;
  }, []);
  useEffect(() => clean, [clean]);
  const finish = useCallback(() => {
    clean(); setHoles(Array(9).fill(0)); setPhase("end");
    const s = scoreRef.current;
    addXp(4 + Math.round(Math.max(0, s) / 2), `گنوم‌بزن: ${faNum(Math.max(0, s))} امتیاز 🔨`);
    bumpCounter("whackTotal", Math.max(0, s), undefined, 0);
    bestCounter("whackBest", Math.max(0, s), undefined, 0);
  }, [clean]);
  const start = () => {
    sfx("open"); bgFx.kick("mote");
    scoreRef.current = 0; setScore(0); setTime(30); setHoles(Array(9).fill(0)); setPhase("run");
    clean();
    timerRef.current = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    popRef.current = setInterval(() => {
      setHoles(h => {
        const n = [...h].map(x => (x === 2 ? 0 : x === 1 && Math.random() < 0.45 ? 0 : x));
        const empt = n.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
        if (empt.length && Math.random() < 0.85) {
          const idx = empt[(Math.random() * empt.length) | 0];
          n[idx] = Math.random() < 0.22 ? 2 : 1;
        }
        return n;
      });
    }, 620);
  };
  useEffect(() => { if (phase === "run" && time === 0) finish(); }, [time, phase, finish]);
  const hit = (i: number) => {
    if (phase !== "run") return;
    const v = holes[i];
    if (v === 0) return;
    setHoles(h => { const n = [...h]; n[i] = 0; return n; });
    scoreRef.current = Math.max(0, scoreRef.current + (v === 1 ? 1 : -2));
    setScore(scoreRef.current);
    if (v === 2) { sfx(); bgFx.kick("eye"); setTime(t => Math.max(1, t - 2)); }
    else sfx("open");
  };
  return (
    <Panel className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-black">🔨 گنوم‌بزنِ ۳۰ ثانیه</h3>
        <div className="flex items-center gap-2 text-[0.7rem] font-black">
          <span className="chip !cursor-default">⏱ {faNum(time)}</span>
          <span className="chip !cursor-default">امتیاز <b className="text-gold">{faNum(score)}</b></span>
          <span className="chip !cursor-default opacity-70">رکورد {h2 ? faNum(best) : "…"}</span>
        </div>
      </div>
      <p className="mb-4 text-[0.68rem] leading-6 opacity-60">گنوم بزن: <b>+۱</b>. اگر کلاه‌سواریِ بیل آمد نزن! <b>−۲ و ۲ ثانیه عقب</b>.</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {holes.map((v, i) => (
          <button key={i} onClick={() => hit(i)} disabled={phase !== "run"}
            className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-wood/40 bg-gradient-to-b from-wood2/20 to-night shadow-inner transition active:scale-95">
            <div className="absolute inset-x-4 bottom-0 h-1/3 rounded-t-[100%] bg-black/50" />
            <AnimatePresence mode="popLayout">
              {v !== 0 && (
                <motion.div key={v + "g"} initial={{ y: 46, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 46, opacity: 0 }} transition={{ type: "spring", bounce: 0.5 }}
                  className="relative z-10 text-4xl sm:text-5xl">{v === 1 ? "🧌" : "🎩"}</motion.div>
              )}
            </AnimatePresence>
            {v === 0 && phase === "run" && <span className="absolute bottom-1 text-[0.55rem] opacity-30">خاک نرم…</span>}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {phase !== "run" && <button className="btn btn-magic !text-xs" onClick={start}>{phase === "idle" ? "▶ شروع" : "↻ دستِ دوباره"}</button>}
        {phase === "run" && <button className="btn btn-danger !text-xs" onClick={finish}>⏹ زودتر تمام کن</button>}
      </div>
      {phase === "end" && (
        <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-center">
          <div className="text-2xl">{score >= 15 ? "🥇" : score >= 12 ? "🥈" : score >= 8 ? "🥉" : "🍄"}</div>
          <div className="font-black">زنگِ آخر! {faNum(score)} گنوم به خاک برگشتند</div>
          <div className="mt-1 text-[0.7rem] opacity-70">{best === 0 ? "نخستین رکوردِ ثبت‌شدهٔ تو 🎉" : score >= best ? "رکوردِ تازه به نامت ثبت شد ✓" : `رکوردت: ${faNum(best)}`}</div>
          <div className="mt-3 flex justify-center gap-2">
            <button className="btn btn-gold !py-1.5 !text-xs" onClick={start}>↻ دوباره</button>
            <Link href="/profile" className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs">🏅 کارنامۀ بازیکن</Link>
          </div>
        </div>
      )}
    </Panel>
  );
}

export default function GamesPage() {
  const [tab, setTab] = useState<"mem" | "whack">("mem");
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <GnomeSpot i={11} />
      <div className="py-8 text-center">
        <div className="title-creep text-6xl">🕹</div>
        <h1 className="title-creep glow-magic mt-1 text-4xl text-magic2 sm:text-5xl">تالارِ بازی‌هایِ نیمه‌شب</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 opacity-75">
          دو بازیِ سریع، رکورددار و XP‌ساز. امتیازها در «پروفایلِ بازیکن» ذخیره می‌شوند — هر سه‌شنبه شب، بیل خودش هم می‌آید بازی کند (قول نمی‌دهیم ببازد).
        </p>
        <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-black">
          {([["mem", "🧠 حافظهٔ جنگل"], ["whack", "🔨 گنوم‌بزن"]] as const).map(([id, l]) => (
            <button key={id} onClick={() => { sfx(); setTab(id); }} className={`rounded-full px-4 py-1.5 transition ${tab === id ? "bg-gold/20 text-gold" : "opacity-60 hover:opacity-100"}`}>{l}</button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
          {tab === "mem" ? <Memory /> : <Whack />}
        </motion.div>
      </AnimatePresence>
      <Panel className="mt-6 p-4 text-center text-[0.68rem] leading-6 opacity-60">
        💡 برای بردِ جوایزِ بزرگ‌تر، «🗝 شکارِ طومار» و «🍄 گنوم‌یابی» را هم دنبال کن — هر ۱۶ گنومِ پنهانِ سایت یک نشانهٔ افتخارِ سلطنتی دارد.
        <div className="mt-2 flex justify-center gap-2">
          <Link href="/cipher" className="btn btn-ghost ring-1 ring-white/10 !py-1 !text-[0.65rem]">🗝 رموز</Link>
          <Link href="/profile" className="btn btn-ghost ring-1 ring-white/10 !py-1 !text-[0.65rem]">🏅 پروفایل</Link>
        </div>
      </Panel>
    </div>
  );
}
