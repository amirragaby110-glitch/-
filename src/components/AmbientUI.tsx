"use client";
// 🌫 رابطِ میکسرِ صداها: پنلِ کانال‌ها + داکِ شناور (صدا حتی هنگام جابه‌جایی بین صفحات ادامه دارد)
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AMB_CHANNELS, ambEngine, useAmb, type AmbChan } from "@/lib/ambience";
import { Panel } from "./ui";
import { faNum } from "@/lib/utils";

function ChanRow({ id, icon, fa }: { id: AmbChan; icon: string; fa: string }) {
  const v = useAmb(s => s.vols[id]);
  const set = useAmb(s => s.setVol);
  return (
    <div className="flex items-center gap-3 py-1.5">
      <button onClick={() => set(id, v > 0.01 ? 0 : 0.6)} title="روشن/خاموش"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg transition ${v > 0.01 ? "bg-pine/20 ring-1 ring-pine/60" : "bg-white/5 opacity-55 hover:opacity-90"}`}>{icon}</button>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between text-[0.68rem] font-bold opacity-75">
          <span>{fa}</span><span className="font-mono tabular-nums">{faNum(Math.round(v * 100))}٪</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={v} onChange={e => set(id, +e.target.value)} className="w-full" />
      </div>
      <button onClick={() => set(id, 0)} className={`btn btn-ghost !px-2 !py-1 !text-[0.65rem] ${v > 0.01 ? "" : "invisible"}`}>✕</button>
    </div>
  );
}
export function AmbientMixer({ compact = false }: { compact?: boolean }) {
  const master = useAmb(s => s.master);
  const setMaster = useAmb(s => s.setMaster);
  const running = useAmb(s => s.running);
  return (
    <Panel className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-black">🌫 استودیویِ صداهایِ شب</h3>
          {!compact && <p className="mt-1 max-w-lg text-[0.68rem] leading-6 opacity-60">چهار لوپِ سنتزشده (نه فایلِ آماده) که با فیلتر و LFO زنده ساخته می‌شوند — با هر ترکیبی که دوست داری «جنگلِ خودت» را بساز. حتی اگر صفحه را عوض کنی، صدا قطع نمی‌شود.</p>}
        </div>
        <div className="flex items-center gap-2">
          {running && <button onClick={() => ambEngine.stop()} className="btn btn-danger !px-3 !py-1.5 !text-xs">⏹ خاموشِ همه</button>}
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {AMB_CHANNELS.map(c => <ChanRow key={c.id} {...c} />)}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
        <span className="text-[0.68rem] font-black opacity-70">🎚 کلِ میکس</span>
        <input type="range" min={0} max={1} step={0.01} value={master} onChange={e => setMaster(+e.target.value)} className="flex-1" />
        <span className="w-10 text-left font-mono text-[0.66rem] tabular-nums opacity-70">{faNum(Math.round(master * 100))}٪</span>
      </div>
    </Panel>
  );
}
export function AmbientDock() {
  const running = useAmb(s => s.running);
  const [open, setOpen] = useState(false);
  const vols = useAmb(s => s.vols);
  const lit = (Object.keys(vols) as AmbChan[]).filter(k => vols[k] > 0.01);
  return (
    <div className="fixed bottom-20 left-3 z-[62] md:bottom-5">
      <AnimatePresence>
        {open && running && (
          <motion.div initial={{ y: 16, opacity: 0, scale: 0.92 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0, scale: 0.92 }}
            className="mb-2 w-[19rem] max-w-[86vw]">
            <AmbientMixer compact />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {running && (
          <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(v => !v)}
            className="glass flex items-center gap-2 rounded-full border border-pine/40 px-3 py-2 text-[0.68rem] font-black text-pine shadow-[0_0_26px_-6px_rgba(159,212,138,0.7)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pine/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pine" />
            </span>
            🌫 {lit.length} {lit.length === 1 ? "لوپ" : "لوپ"} فعال
            <span className="opacity-60">{lit.map(k => AMB_CHANNELS.find(c => c.id === k)?.icon).join(" ")}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
