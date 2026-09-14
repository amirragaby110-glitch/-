"use client";
// 📜 طومارِ رمزِ پنهان در صفحات — باز شدنِ ترتیبی، مودالِ رمزگشایی، XP
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "./ui";
import { SCROLLS, nextScrollId } from "@/data/scrolls";
import { useHydrated } from "./ui";
import { CIPHERS, normAns } from "@/lib/ciphers";
import { useProgress, solveScroll } from "@/lib/progress";
import { bgFx } from "./Background";
import { sfx } from "./Shell";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function CipherScroll({ id, t = 30, side = "right" }: { id: string; t?: number; side?: "left" | "right" }) {
  const scroll = SCROLLS.find(s => s.id === id);
  const solved = useProgress(s => s.scrolls.includes(id));
  const solvedList = useProgress(s => s.scrolls);
  const [open, setOpen] = useState(false);
  const [ans, setAns] = useState("");
  const [state, setState] = useState<"idle" | "wrong" | "won">("idle");
  const path = usePathname();
  const h = useHydrated();
  if (!scroll || !h) return null;
  void path;
  const locked = nextScrollId(solvedList) !== id;
  const submit = () => {
    if (normAns(ans) === normAns(scroll.answer)) {
      setState("won"); sfx("open"); bgFx.kick("mote");
      solveScroll(id, scroll.xp);
    } else { setState("wrong"); sfx(); setTimeout(() => setState("idle"), 1400); }
  };
  return (
    <>
      <button onClick={() => { sfx("open"); setOpen(true); }} title="یه طومارِ عجیب این‌جا وا کرده…" aria-label="طومارِ رمز"
        className={`fixed z-[46] grid h-10 w-10 place-items-center rounded-full border text-lg transition-all ${solved ? "border-pine/40 bg-pine/10 opacity-60" : "border-magic/50 bg-magic/15 opacity-80 shadow-[0_0_24px_-4px_rgba(157,92,255,0.8)] hover:scale-110 hover:opacity-100"}`}
        style={{ top: `${t}%`, [side]: "1.1rem" } as React.CSSProperties}>
        <motion.span animate={solved ? {} : { rotate: [-6, 6, -6], y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 3.4 }}>📜</motion.span>
      </button>
      <AnimatePresence>
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="title-creep text-xl text-magic2">📜 طومارِ {SCROLLS.indexOf(scroll) + 1} از {SCROLLS.length}</h3>
            <span className="chip !cursor-default !text-[0.6rem]">{CIPHERS[scroll.cipher].icon} {CIPHERS[scroll.cipher].fa}</span>
          </div>
          {locked && !solved ? (
            <div className="p-6 text-center">
              <div className="mb-2 text-3xl">🔒</div>
              <p className="text-sm leading-7 opacity-75">این طومار با مُهرِ مومیِ بیل قفل شده. اول طومارِ قبلی را باز کن — سرنخش در صفحۀ «<b>{SCROLLS.find(s => s.id === nextScrollId(solvedList))?.pageFa}</b>» است.</p>
              <Link href={SCROLLS.find(s => s.id === nextScrollId(solvedList))?.page ?? "/cipher"} onClick={() => setOpen(false)} className="btn btn-magic mt-3 !text-xs">رفتن به طومارِ قبلی</Link>
            </div>
          ) : (
            <>
              <div dir="ltr" className="scanlines relative overflow-hidden rounded-2xl border border-gold/25 bg-night/70 p-4 text-center">
                <div className="font-mono text-[0.95rem] font-black leading-8 tracking-[0.2em] text-gold2 break-words">{scroll.cipherText}</div>
                {scroll.cipher === "vigenere" && <div className="mt-2 font-mono text-[0.62rem] tracking-widest opacity-50">KEY: {scroll.key}</div>}
                {scroll.cipher === "caesar" && <div className="mt-2 font-mono text-[0.62rem] tracking-widest opacity-50">SHIFT: {scroll.shift}</div>}
              </div>
              <p className="mt-3 text-[0.78rem] leading-7 opacity-75">🧭 {scroll.hintFa}</p>
              {solved ? (
                <div className="mt-4 rounded-2xl border border-pine/40 bg-pine/10 p-4">
                  <div className="mb-1 text-sm font-black text-pine">✓ رمزِ این طومار را پیش‌تر شکسته‌ای</div>
                  <p className="text-[0.75rem] leading-6 opacity-75">{scroll.rewardFa}</p>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-2">
                    <input dir="ltr" value={ans} onChange={e => setAns(e.target.value)} placeholder="TYPE YOUR ANSWER…"
                      onKeyDown={e => e.key === "Enter" && submit()}
                      className={`input !text-center font-mono uppercase tracking-widest ${state === "wrong" ? "!border-blood ring-2 ring-blood/40" : ""}`} />
                    <button onClick={submit} className="btn btn-gold shrink-0 !px-4 !py-2.5">بررسی</button>
                  </div>
                  <AnimatePresence mode="wait">
                    {state === "wrong" && <motion.p key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-center text-xs font-black text-blood">مهرِ مومی ذوب شد و دوباره شکل گرفت… بیل از پاسخِ بد خوشش نمی‌آید. ✗</motion.p>}
                    {state === "won" && (
                      <motion.div key="won" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-gold/50 bg-gold/10 p-4">
                        <div className="mb-1 text-sm font-black text-gold">🗝 طومار باز شد! +{scroll.xp} XP</div>
                        <p className="text-[0.78rem] leading-7 opacity-85">{scroll.rewardFa}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="mt-3 text-center text-[0.62rem] opacity-45">راهنما: ابزارِ کاملِ این رمزها در صفحۀ «🗝 رمز و رمزنگاری» است.</p>
                </>
              )}
            </>
          )}
        </Modal>
      </AnimatePresence>
    </>
  );
}
export default CipherScroll;
