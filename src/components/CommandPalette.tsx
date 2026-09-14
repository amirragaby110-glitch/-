"use client";
// ⌘K جستجوی سراسری — روی کلِ دانش‌نامه (فکت‌ها، قسمت‌ها، شخصیت‌ها، آهنگ‌ها، تصاویر…)
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BM25 } from "@/lib/search";
import { buildKnowledge } from "@/data/knowledge";
import { NAV } from "./Shell";

const TYPE_LABEL: Record<string, string> = {
  horror: "🔦 ترسناک", fun: "🧩 فکت", episode: "📺 قسمت", character: "👤 شخصیت",
  cast: "🎙️ صداپیشه", award: "🏆 جایزه", crew: "🛠️ سازنده", book: "📚 کتاب",
  timeline: "🧭 خط زمانی", gallery: "🖼️ تصویر", track: "🎵 آهنگ", nav: "🧭 صفحه",
};

export default function CommandPalette({ open, onClose, onOpen }: { open: boolean; onClose: () => void; onOpen: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { bm, navDocs } = useMemo(() => {
    const bm = new BM25(buildKnowledge());
    const navDocs = NAV.map(n => ({ id: n.href, title: n.label, text: "", type: "nav", href: n.href, score: 1 }));
    return { bm, navDocs };
  }, []);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const t = performance.now();
    const r = bm.fuzzy(q, 12);
    void t;
    const nq = q.trim();
    const nav = navDocs.filter(d => d.title.includes(nq) || d.href.includes(nq.toLowerCase())).slice(0, 4)
      .map(d => ({ doc: { id: d.id, title: d.title, text: "برو به صفحه", type: "nav", href: d.href }, score: 2 }));
    return [...nav, ...r].slice(0, 14);
  }, [q, bm, navDocs]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); else setQ(""); setSel(0); }, [open]);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open ? onClose() : onOpen(); }
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      if (e.key === "Enter" && results[sel]) { router.push(results[sel].doc.href); onClose(); }
    };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, sel, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[97] bg-black/65 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div dir="rtl" onClick={e => e.stopPropagation()}
            initial={{ y: -24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ type: "spring", bounce: 0.3 }}
            className="card glass mx-auto mt-[8vh] max-h-[74vh] w-[94%] max-w-2xl overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-white/10 p-3">
              <span className="text-lg">🔍</span>
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو در همه‌چیز… (بیل، قسمت ۳۱، ژاکت میبل، آپارات…)"
                className="w-full bg-transparent text-sm outline-none placeholder:opacity-40" />
              <kbd className="chip !cursor-default !text-[0.6rem]">ESC</kbd>
            </div>
            <div className="max-h-[58vh] overflow-auto p-2">
              {!q && <div className="p-6 text-center text-xs opacity-50">هر چیزی بنویس — همهٔ فکت‌ها، قسمت‌ها، شخصیت‌ها و آهنگ‌ها این‌جا هستند.</div>}
              {q && !results.length && <div className="p-6 text-center text-xs opacity-50">چیزی پیدا نشد؛ مثل بیل سایفر، بعضی رازها خودشان را قایم می‌کنند.</div>}
              {results.map((r, i) => (
                <button key={r.doc.id + i} onMouseEnter={() => setSel(i)}
                  onClick={() => { router.push(r.doc.href); onClose(); }}
                  className={`mb-0.5 flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-right text-sm transition ${i === sel ? "bg-gold/15 ring-1 ring-gold/30" : "hover:bg-white/5"}`}>
                  <span className="mt-0.5 shrink-0 rounded-lg bg-white/5 px-2 py-0.5 text-[0.62rem] font-black tracking-wide opacity-80">{TYPE_LABEL[r.doc.type] ?? r.doc.type}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{r.doc.title}</span>
                    <span className="block truncate text-[0.72rem] opacity-55">{r.doc.text.slice(0, 110)}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
