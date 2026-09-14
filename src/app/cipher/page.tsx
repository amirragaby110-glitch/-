"use client";
// 🗝 موزۀِ رمز و رمزنگاری — ابزارِ رمزگذار/رمزگشا + شکّندۀ سزار + تابلویِ شکارِ طومارها
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, SectionTitle, Chip, useToast, Reveal } from "@/components/ui";
import { CIPHERS, applyCipher, decryptSample, caesar, a1zDec, type CipherId } from "@/lib/ciphers";
import { SCROLLS } from "@/data/scrolls";
import { useProgress, bumpCounter } from "@/lib/progress";
import { faNum, copyText } from "@/lib/utils";
import { sfx } from "@/components/Shell";
import { bgFx } from "@/components/Background";
import { GnomeSpot } from "@/components/GnomeHunt";

const SAMPLES = [
  "THE MYSTERY SHACK", "WILL YOU LET ME IN", "BOO BOO BOO BOOOO", "GRUNKLE STAN", "SUMMER OF MYSTERY",
];
export default function CipherPage() {
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const [cid, setCid] = useState<CipherId>("caesar");
  const [text, setText] = useState("THE TRUTH IS OUT THERE");
  const [key, setKey] = useState("GRAVITY");
  const [shift, setShift] = useState(3);
  const out = useMemo(() => {
    if (cid === "a1z") return mode === "enc" ? applyCipher("a1z", text, key, shift) : a1zDec(text);
    return mode === "enc" ? applyCipher(cid, text, key, shift) : decryptSample(cid, text, key, shift);
  }, [mode, cid, text, key, shift]);
  const solved = useProgress(s => s.scrolls);

  // شکّندۀ سزار: ۲۶ حدس
  const [crackIn, setCrackIn] = useState("PHHW PH DIWHU WKH WRJD SDUWB");
  const crack = useMemo(() => Array.from({ length: 26 }, (_, k) => ({ k, s: caesar(crackIn, k, true) }))
    .filter(x => /[A-Z]{3,}/.test(x.s)), [crackIn]);
  const [pick, setPick] = useState<string | null>(null);

  const toast = useToast();
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <GnomeSpot i={10} />
      <div className="py-8 text-center">
        <div className="title-creep text-6xl">🗝</div>
        <h1 className="title-creep glow-gold mt-1 text-4xl text-gold sm:text-5xl">رمز و رمزنگاریِ گرانش فالز</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-8 opacity-75">
          الکس هیرش سال‌ها رمزِ واقعی پشتِ تیتراژ و کتاب‌ها قایم کرد (سزار، اتبش، A1Z و…). این‌جا هم ابزارِ خودت را بساز،
          هم «شکارِ طومار» را تعقیب کن: چهار طومار در صفحاتِ سایت پنهان است — هر کدام با یک رمزِ کلاسیک.
        </p>
      </div>

      {/* کارگاهِ رمز */}
      <Reveal>
        <Panel className="p-5">
          <SectionTitle kicker="THE CIPHER WORKSHOP" title="⚗️ کارگاهِ رمزگذار" right={
            <div className="flex gap-1.5">
              <Chip on={mode === "enc"} onClick={() => { sfx(); setMode("enc"); }}>→ رمز کن</Chip>
              <Chip on={mode === "dec"} onClick={() => { sfx(); setMode("dec"); }}>→ باز کن</Chip>
            </div>
          } />
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(CIPHERS) as CipherId[]).map(c => (
              <Chip key={c} on={cid === c} onClick={() => { sfx(); setCid(c); }}>{CIPHERS[c].icon} {CIPHERS[c].fa}</Chip>
            ))}
          </div>
          <p className="mb-4 rounded-xl border-r-4 border-magic/60 bg-magic/10 p-3 text-[0.75rem] leading-6 opacity-85">{CIPHERS[cid].desc}</p>
          <div className="grid items-start gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[0.68rem] font-black opacity-60">{mode === "enc" ? "ورودی (فقط حروفِ A–Z رمز می‌شوند)" : "متنِ رمزگذاری‌شده (لاتین)"}</label>
              <textarea dir="ltr" value={text} onChange={e => setText(e.target.value)} rows={5} className="input font-mono !text-sm" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SAMPLES.map(s => <Chip key={s} onClick={() => { sfx(); setText(s); }} className="!font-mono !text-[0.62rem]">{s}</Chip>)}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {CIPHERS[cid].needsKey && cid === "caesar" && (
                  <label className="flex items-center gap-2 text-[0.7rem] font-black opacity-70">
                    شیفت
                    <input type="range" min={1} max={25} value={shift} onChange={e => setShift(+e.target.value)} className="w-28" />
                    <span className="font-mono tabular-nums text-gold">{faNum(shift)}</span>
                  </label>
                )}
                {cid === "vigenere" && (
                  <label className="flex items-center gap-2 text-[0.7rem] font-black opacity-70">
                    کلید
                    <input dir="ltr" value={key} onChange={e => setKey(e.target.value)} className="input !w-32 !py-1 font-mono !text-xs" />
                  </label>
                )}
              </div>
            </div>
            <div className="relative">
              <div dir="ltr" className="scanlines min-h-36 overflow-hidden whitespace-pre-wrap break-words rounded-2xl border border-gold/25 bg-night/80 p-4 font-mono text-sm leading-8 text-gold2">
                {out || "…"}
              </div>
              <div className="mt-2 flex gap-2">
                <button className="btn btn-gold !py-1.5 !text-xs" onClick={() => { copyText(out); bumpCounter("encodes", 1, mode === "enc" ? "متنی رمز شد ✒️" : undefined, 3); toast.show("کپی شد ✓"); sfx(); }}>📋 کپی + ثبت در دفتر</button>
                <button className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs" onClick={() => { sfx(); navigator.clipboard?.readText().then(t => setText(t)).catch(() => toast.show("دسترسی کلیپ‌بورد نشد")); }}>📥 از کلیپ‌بورد</button>
              </div>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* شکّندۀ خودکار */}
      <Reveal>
        <Panel className="mt-6 p-5">
          <SectionTitle kicker="AUTO-BREAKER" title="🧨 شکّندۀ سزار" sub="سزار فقط ۲۶ حالت دارد — مثلِ قفلِ چرخ‌دارِ کابینتِ سوس، یکی‌یکی می‌چرخانیم تا معنی دربیاید. روی پاسخِ درست بزن تا برایِ طومار کپی شود." />
          <input dir="ltr" value={crackIn} onChange={e => setCrackIn(e.target.value)} placeholder="ENCRYPTED MESSAGE…" className="input mb-4 font-mono" />
          <div className="grid gap-1.5 md:grid-cols-2">
            {crack.map(({ k, s }) => (
              <button key={k} dir="ltr" onClick={() => { sfx(); setPick(s); copyText(s); bumpCounter("cracks", 1, "یک رمز با چرخ‌اندازی شکست 🧨", 4); }}
                className={`truncate rounded-xl px-3 py-2 text-left font-mono text-[0.72rem] ring-1 transition hover:bg-gold/10 hover:ring-gold/50 ${pick === s ? "bg-pine/15 ring-pine" : "bg-white/5 ring-white/10"}`}>
                <span className="me-2 opacity-40">−{faNum(k)}</span>{s}
              </button>
            ))}
          </div>
          {!crack.length && <div className="p-6 text-center text-xs opacity-50">متنی که لاتینِ رمز نشده باشد، چیزی برای شکستن ندارد.</div>}
        </Panel>
      </Reveal>

      {/* تابلویِ شکارِ طومار */}
      <Reveal>
        <Panel className="mt-6 p-5">
          <SectionTitle kicker="THE CIPHER HUNT" title="📜 تابلویِ شکارِ طومارها"
            sub="هر طومار در گوشۀ یکی از صفحاتِ سایت قفل‌شده منتظرت است — ترتیب را رعایت کن؛ آخریش رازِ «۶۱۸» را فاش می‌کند."
            right={<span className="chip !cursor-default">{faNum(solved.length)}/{faNum(SCROLLS.length)} باز شده</span>} />
          <div className="grid gap-3 sm:grid-cols-2">
            {SCROLLS.map((s, i) => {
              const done = solved.includes(s.id);
              const cur = SCROLLS.findIndex(x => !solved.includes(x.id)) === i;
              return (
                <Link key={s.id} href={s.page} onClick={() => { sfx(); bgFx.kick("mote"); }}>
                  <div className={`card h-full p-4 transition hover:-translate-y-0.5 ${done ? "border-pine/50 bg-pine/5" : cur ? "border-magic/60 shadow-[0_0_30px_-10px_rgba(157,92,255,0.8)]" : "opacity-70"}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-black">{done ? "✓" : cur ? "🔓" : "🔒"} طومارِ {faNum(i + 1)}</span>
                      <span className="chip !cursor-default !text-[0.58rem]">{CIPHERS[s.cipher].icon} {CIPHERS[s.cipher].en}</span>
                    </div>
                    <div dir="ltr" className="mb-2 truncate font-mono text-[0.68rem] tracking-widest text-gold/80">{s.cipherText}</div>
                    <div className="text-[0.68rem] opacity-60">محل: صفحۀ «{s.pageFa}» — {done ? "باز شده، جایزۀ XP را گرفتی" : "هنوز دست‌نخورده"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>
      </Reveal>

      <Panel className="mt-6 p-5 text-[0.72rem] leading-7 opacity-75">
        <b className="opacity-90">💡 آیا می‌دانستی؟</b> در فصل دوم، بیل جمله‌ها را با «رمزِ اعدادِ بزرگ» (A1G — تا ۹۹۹) می‌نویسد؛
        در سریالِ اصلی هم خیلی از پیام‌های پنهانِ تیتراژ تا آخر سال ۲۰۱۶ توسط هوادارها شکسته می‌شد. تمرین کن — طومارِ سوم دقیقاً همین‌طور نوشته شده.
      </Panel>
      {toast.node}
    </div>
  );
}
