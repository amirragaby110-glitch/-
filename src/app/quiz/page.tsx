"use client";
// 🧠 آزمونِ گرانش فالز — ۱۶ سؤال، تایمر، پاسخ‌توضیحی، اشتراکِ کارنامه
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUIZZES } from "@/data/quizzes";
import { Panel, SectionTitle } from "@/components/ui";
import { faNum, share } from "@/lib/utils";
import { sfx } from "@/components/Shell";
import { speak } from "@/lib/tts";
import { addXp, bestCounter, bumpCounter } from "@/lib/progress";
import ShareCardBtn from "@/components/ShareCardBtn";

const T = 28;
function shuffle<T2>(a: T2[], seed: number) {
  const r = [...a]; let s = seed;
  for (let i = r.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = ((s / 233280) * (i + 1)) | 0; [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
export default function QuizPage() {
  const [seed, setSeed] = useState(() => (Date.now() % 999983));
  const qs = useMemo(() => shuffle(QUIZZES, seed).map((q, qi) => {
    const opts = shuffle(q.a.map((t, i) => ({ t, ok: i === q.c })), seed + qi * 7);
    return { ...q, opts };
  }), [seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [t, setT] = useState(T);
  const [done, setDone] = useState(false);

  const cur = qs[i];
  useEffect(() => {
    if (!done) return;
    addXp(5 + score, `آزمون کامل شد — ${faNum(score)} پاسخِ درست 🧠`);
    bestCounter("quizBest", score);
    bumpCounter("quizzes", 1, undefined, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  useEffect(() => {
    if (done || picked !== null) return;
    if (t <= 0) { pick(-1); return; }
    const to = setTimeout(() => setT(v => v - 1), 1000);
    return () => clearTimeout(to);
  });

  function pick(k: number) {
    if (picked !== null) return;
    sfx(); setPicked(k);
    const ok = cur.opts[k]?.ok;
    if (ok) { setScore(s => s + 1); }
    setTimeout(() => {
      if (i === qs.length - 1) { setDone(true); try { speak("کارنامه صادر شد.", { pitch: 1.2, rate: 1.1 }); } catch { } }
      else { setI(v => v + 1); setPicked(null); setT(T); }
    }, 1900);
  }
  const restart = () => { setSeed(Date.now() % 999983); setI(0); setPicked(null); setScore(0); setT(T); setDone(false); };
  const grade = score >= 14 ? "نویسندۀ ژورنال ۴" : score >= 10 ? "ششمیِ افتخاری" : score >= 6 ? "توریستِ باهوش" : "خوردۀ گنوم‌ها";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <SectionTitle kicker="THE TEST OF THE TWIN MYSTERIES" title="🧠 آزمونِ گرانش فالز"
        sub={`${faNum(qs.length)} سؤالِ درهم‌ریخته، ${faNum(T)} ثانیه برای هر پرونده. اگر اشتباه بزنید، توضیح می‌خوانید تا برای تابستانِ بعد آماده شوید.`} />
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <Panel className="relative overflow-hidden p-5">
              <div className="mb-3 flex items-center justify-between text-[0.7rem] font-black">
                <span className="opacity-70">سؤال {faNum(i + 1)} / {faNum(qs.length)}</span>
                <span className="flex items-center gap-2">
                  امتیاز: <span className="text-gold">{faNum(score)}</span>
                  <span className={`grid h-9 w-9 place-items-center rounded-full ring-2 ${t <= 7 ? "animate-pulse ring-blood text-blood" : "ring-gold/60"}`}>{faNum(t)}</span>
                </span>
              </div>
              <div className="mb-4 h-1 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-gradient-to-l from-gold to-magic transition-all duration-1000" style={{ width: `${(t / T) * 100}%` }} />
              </div>
              <h3 className="mb-4 text-lg font-black leading-8">{cur.q}</h3>
              <div className="grid gap-2">
                {cur.opts.map((o, k) => (
                  <button key={k} disabled={picked !== null} onClick={() => pick(k)}
                    className={`rounded-2xl px-4 py-3 text-right text-sm font-bold ring-1 transition ${picked === null ? "ring-white/10 hover:ring-gold/50 hover:bg-gold/5" :
                      o.ok ? "bg-pine/15 ring-pine" : picked === k ? "bg-blood/20 ring-blood" : "opacity-40 ring-white/5"}`}>
                    {picked !== null && o.ok ? "✓ " : picked === k ? "✕ " : ""}{o.t}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {picked !== null && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 overflow-hidden rounded-xl border-r-4 border-gold/70 bg-gold/10">
                    <p className="p-3 text-[0.78rem] leading-7">{cur.why}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Panel className="p-8 text-center">
              <div className="text-6xl">{score >= 14 ? "🏆" : score >= 10 ? "🎖️" : score >= 6 ? "🗺️" : "🍄"}</div>
              <h3 className="title-crep mt-2 text-3xl text-gold">کارنامه صادر شد</h3>
              <div className="mt-1 text-sm opacity-70">رتبۀ شما: <b className="text-gold2">{grade}</b></div>
              <div className="title-crep mt-4 text-6xl font-black text-magic2">{faNum(score)}<span className="text-2xl opacity-60">/{faNum(qs.length)}</span></div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button className="btn btn-gold" onClick={restart}>↻ دوباره</button>
                <button className="btn btn-magic" onClick={() => share("کارنامۀ آزمون گرانش فالز", `امتیاز من ${score} از ${qs.length} — رتبه: ${grade}. امتحان کن!`, location.origin + "/quiz").then(r => r === "copied" ? null : undefined)}>📤 اشتراکِ کارنامه</button>
                <ShareCardBtn label="🖨 کارتِ کارنامه" className="btn btn-ghost ring-1 ring-white/10" tag="کارنامۀ آزمون · GRAVITY FALLS NEXUS" title={grade} body={`امتیازِ من: ${score} از ${qs.length} — بیل قضاوت کرد: «${score >= 10 ? "بد نیست… برای یک بشر" : "عجیز! برگرد فکت‌ها را بخوان"}»`} accent="magic" />
                <a href="/facts" className="btn btn-ghost ring-1 ring-white/10">🧩 مرور فکت‌ها</a>
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
