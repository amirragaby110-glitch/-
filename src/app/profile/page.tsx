"use client";
// 🏅 پروفایلِ بازیکن — حلقۀ سطح، رتبه، شمارشگرها، کارنامۀ دستاوردها، خروجی/بازگردانی
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Panel, SectionTitle, Reveal, useToast, useHydrated } from "@/components/ui";
import { useProgress, levelInfo, RANKS, exportProgress, importProgress } from "@/lib/progress";
import { ACHIEVEMENTS } from "@/data/achievements";
import { SCROLLS } from "@/data/scrolls";
import { TRACKS } from "@/data/tracks";
import { faNum } from "@/lib/utils";
import { download } from "@/lib/utils";
import { sfx } from "@/components/Shell";
import { NAV } from "@/components/Shell";

const GEM = 16; // تعداد کلِ گنوم‌هایِ پنهان
export default function ProfilePage() {
  const h = useHydrated();
  const p = useProgress();
  const { lvl, pct, toNext, rank } = levelInfo(p.xp);
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const earnedN = Object.keys(p.earned).length;
  if (!h) return <div className="mx-auto max-w-5xl px-6 py-24 text-center text-sm opacity-60 animate-pulse">در حال باز کردنِ پروندهٔ بازیکن… 🗄</div>;
  const stats = [
    { i: "⚡", l: "مجموعِ XP", v: faNum(p.xp) },
    { i: "🏅", l: "دستاورد", v: `${faNum(earnedN)}/${faNum(ACHIEVEMENTS.length)}` },
    { i: "🍄", l: "گنومِ پیدا شده", v: `${faNum(p.gnomes.length)}/${faNum(GEM)}` },
    { i: "📜", l: "طومارهایِ باز شده", v: `${faNum(p.scrolls.length)}/${faNum(SCROLLS.length)}` },
    { i: "🎧", l: "آهنگ‌هایِ پخش‌شده", v: `${faNum(p.tracks.length)}/${faNum(TRACKS.length)}` },
    { i: "🃏", l: "کارت‌هایِ برگردانده", v: faNum(p.c.flips ?? 0) },
    { i: "🧠", l: "آزمون‌ها / بهترین نمره", v: `${faNum(p.c.quizzes ?? 0)} / ${faNum(p.c.quizBest ?? 0)}` },
    { i: "🧩", l: "بردهایِ حافظه", v: faNum(p.c.memWins ?? 0) },
    { i: "🔨", l: "رکوردِ گنوم‌بزن", v: faNum(p.c.whackBest ?? 0) },
    { i: "🖨", l: "کارت اشتراک", v: faNum(p.c.cards ?? 0) },
    { i: "✍️", l: "رکوردهایِ ثبتی", v: faNum(p.c.subs ?? 0) },
    { i: "🗺", l: "صفحاتِ دیده‌شده", v: `${faNum(p.pages.length)}/${faNum(NAV.length)}` },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="py-8">
        <SectionTitle kicker="PLAYER FILE · CLASSIFIED BY GRUNKLE STAN" title="🏅 پروندۀ بازیکن"
          sub="همه‌چیز در همین مرورگرِ شما ذخیره می‌شود — سروری وجود ندارد (حتی اگر بیل بخواهد)." />
        <Panel className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative grid h-32 w-32 shrink-0 place-items-center">
              <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                <motion.circle cx="60" cy="60" r="52" fill="none" stroke="url(#lgrad)" strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={`${pct * 326.7} 999`} initial={{ strokeDasharray: "0 999" }} animate={{ strokeDasharray: `${pct * 326.7} 999` }} transition={{ duration: 1.1 }} />
                <defs>
                  <linearGradient id="lgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#e0b64f" /><stop offset="1" stopColor="#9d5cff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center">
                <div className="title-creep text-4xl text-gold">{faNum(lvl)}</div>
                <div className="text-[0.6rem] font-black tracking-widest opacity-60">LEVEL</div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[0.68rem] font-black tracking-[0.3em] text-magic2/80">رتبۀ فعلی</div>
              <h3 className="title-creep glow-gold text-2xl text-gold sm:text-3xl">{rank}</h3>
              <div className="mt-2 text-xs opacity-70">
                {toNext > 0 ? <>فقط <b className="text-gold">{faNum(toNext)} XP</b> تا سطحِ بعد.</> : "سقفِ تابستان شکسته شد — سطحِ ۱۰! 🎉"}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {RANKS.map(([l, r]) => (
                  <span key={l} className={`chip !cursor-default !text-[0.6rem] ${lvl >= l ? "!border-gold/60 text-gold" : "opacity-40"}`}>Lv{faNum(l)} · {r}</span>
                ))}
              </div>
            </div>
            <div className="mr-auto hidden gap-2 sm:flex">
              {lvl >= 10 ? <div className="text-7xl">👑</div> : <div className="text-7xl grayscale-[0.2]">🌲</div>}
            </div>
          </div>
        </Panel>
      </div>

      <Reveal>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map(s => (
            <Panel key={s.l} className="p-3.5 text-center">
              <div className="text-2xl">{s.i}</div>
              <div className="title-crep mt-1 text-xl font-black text-gold2">{s.v}</div>
              <div className="mt-0.5 text-[0.62rem] font-bold opacity-60">{s.l}</div>
            </Panel>
          ))}
        </div>
      </Reveal>

      <div className="mt-8">
        <SectionTitle kicker="ACHIEVEMENT WALL" title="🏆 دیوارِ دستاوردها"
          right={<span className="chip !cursor-default">{faNum(earnedN)} از {faNum(ACHIEVEMENTS.length)}</span>} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map(a => {
            const got = !!p.earned[a.id];
            const cur = Math.min(a.target, a.cur(p));
            const pctA = a.target ? cur / a.target : 1;
            const hidden = a.secret && !got;
            return (
              <motion.div key={a.id} whileHover={{ y: -3 }} animate={got ? { boxShadow: ["0 0 0px rgba(224,182,79,0)", "0 0 26px rgba(224,182,79,0.35)", "0 0 0px rgba(224,182,79,0)"] } : {}}
                transition={got ? { duration: 2.4, repeat: Infinity } : {}}>
                <Panel className={`flex h-full items-start gap-3 p-4 ${got ? "border-gold/50 bg-gold/5" : "opacity-70"}`}>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ring-1 ${got ? "bg-gradient-to-br from-gold/30 to-magic/25 ring-gold/50" : "bg-white/5 opacity-40 grayscale"}`}>{hidden ? "❓" : a.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-black">{hidden ? "??? رمزآلود" : a.title}</h3>
                      {got ? <span className="shrink-0 text-[0.6rem] font-black text-gold">✓ باز شد</span>
                        : <span className="shrink-0 font-mono text-[0.6rem] opacity-60">{faNum(cur)}/{faNum(a.target)}</span>}
                    </div>
                    <p className="mt-1 text-[0.66rem] leading-5 opacity-65">{hidden ? "یک رازِ تایپ‌شونده در این سایت قایم است…" : a.desc}</p>
                    {!got && (
                      <div className="mt-2 h-1 overflow-hidden rounded bg-white/10">
                        <div className="h-full bg-gradient-to-l from-gold to-magic transition-all duration-700" style={{ width: `${pctA * 100}%` }} />
                      </div>
                    )}
                  </div>
                </Panel>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Reveal>
        <Panel className="mt-8 p-5">
          <h3 className="mb-2 font-black">💾 آرشیوِ پیشرفت</h3>
          <p className="mb-3 text-[0.7rem] leading-6 opacity-65">اگر به جزیره‌ای می‌روی یا مرورگر عوض می‌کنی، خروجی بگیر. با همین فایل، رکورد و سطح و گنوم‌هایت برمی‌گردد.</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-gold !text-xs" onClick={() => { sfx(); download(new Blob([exportProgress()], { type: "application/json" }), "gf-nexus-progress.json"); }}>⬇️ خروجی JSON</button>
            <label className="btn btn-ghost ring-1 ring-white/10 !text-xs">⬆️ بازگردانی
              <input type="file" accept="application/json" className="hidden" onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                try { toast.show(importProgress(await f.text()) ? "✓ پیشرفت بازگردانی شد" : "فایل نامعتبر"); } catch { toast.show("فایل نامعتبر"); }
              }} /></label>
            {!confirmReset ? (
              <button className="btn btn-danger !text-xs" onClick={() => setConfirmReset(true)}>🧹 شروعِ دوباره</button>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-xs font-black text-blood">مطمئنی؟ همه‌چیز پاک می‌شود!</span>
                <button className="btn btn-danger !px-3 !py-1 !text-xs" onClick={() => { p.resetAll(); setConfirmReset(false); toast.show("تابستانِ تازه‌ای شروع شد 🌱"); }}>آری</button>
                <button className="btn btn-ghost ring-1 ring-white/10 !px-3 !py-1 !text-xs" onClick={() => setConfirmReset(false)}>نه!</button>
              </span>
            )}
          </div>
        </Panel>
      </Reveal>

      <Panel className="mt-6 p-5 text-center">
        <div className="text-sm font-black opacity-80">برای XPِ بیشتر: 🍄 گنوم‌ها را در صفحات پیدا کن، 📜 طومارها را بشکن، 🧠 در آزمون و بازی‌ها رکورد بزن.</div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link href="/games" className="btn btn-magic !text-xs">🕹 تالارِ بازی</Link>
          <Link href="/cipher" className="btn btn-ghost ring-1 ring-white/10 !text-xs">🗝 کارگاهِ رمز</Link>
          <Link href="/quiz" className="btn btn-ghost ring-1 ring-white/10 !text-xs">🧠 آزمون</Link>
          <Link href="/music" className="btn btn-ghost ring-1 ring-white/10 !text-xs">🎧 موزیک</Link>
        </div>
      </Panel>
      {toast.node}
    </div>
  );
}
