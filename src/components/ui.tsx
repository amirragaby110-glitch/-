"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { galleryPoster } from "@/lib/poster";
import type { GalleryItem } from "@/data/types";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
export function SectionTitle({ kicker, title, sub, right }: { kicker?: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <div className="mb-1 text-[0.72rem] font-black tracking-[0.3em] text-gold/80">{kicker}</div>}
        <h2 className="title-creep glow-gold text-3xl leading-tight text-forest2 sm:text-4xl dark:text-gold2">{title}</h2>
        {sub && <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/70 opacity-80">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
export function Panel({ children, className = "", hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={`card glass ${hover ? "transition-transform duration-300 hover:-translate-y-1" : ""} ${className}`}>{children}</div>;
}

export function ProceduralImg({ item, className = "", alt }: { item: GalleryItem; className?: string; alt?: string }) {
  const [err, setErr] = useState(false);
  const src = item.img && !err ? item.img : galleryPoster(item, 700);
  return <img loading="lazy" src={src} onError={() => setErr(true)} alt={alt ?? item.fa} className={`h-full w-full object-cover ${className}`} />;
}

export function FlipCard({ front, back, className = "", onFlip }: { front: ReactNode; back: ReactNode; className?: string; onFlip?: (opened: boolean) => void }) {
  const [f, setF] = useState(false);
  const tog = () => { onFlip?.(!f); setF(v => !v); };
  return (
    <div className={`[perspective:1200px] ${className}`} onClick={tog} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && tog()}>
      <div className={`flip3d relative h-full min-h-56 w-full ${f ? "flipped" : ""}`}>
        <div className="flipface absolute inset-0">{front}</div>
        <div className="flipface flipback absolute inset-0">{back}</div>
      </div>
    </div>
  );
}
export function Tilt({ children, max = 10, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const r = useRef<HTMLDivElement>(null);
  return (
    <div ref={r} className={className} onMouseMove={e => {
      const el = r.current; if (!el) return;
      const b = el.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
    }} onMouseLeave={() => { if (r.current) r.current.style.transform = ""; }}>
      {children}
    </div>
  );
}
export function Chip({ on, children, onClick, color, title, className = "" }: { on?: boolean; children: ReactNode; onClick?: () => void; color?: string; title?: string; className?: string }) {
  return <button title={title} onClick={onClick} className={`chip ${on ? "chip-on" : ""} ${className}`} style={on && color ? { borderColor: color, color } : undefined}>{children}</button>;
}
export function Marquee({ items }: { items: string[] }) {
  const s = items.join(" ✦ ");
  return (
    <div className="hairline overflow-hidden border-y border-gold/10 py-2">
      <div className="marquee flex w-max gap-10 whitespace-nowrap font-mono text-[0.7rem] tracking-widest text-gold/70">
        <span>✦ {s}</span><span>✦ {s}</span>
      </div>
    </div>
  );
}
export function ScaryEye({ open = 1, className = "" }: { open?: number; className?: string }) {
  return (
    <svg viewBox="0 0 200 90" className={className}>
      <defs><radialGradient id="iris" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#140a05" /><stop offset="0.5" stopColor="#e0b64f" /><stop offset="0.8" stopColor="#9d5cff" /><stop offset="1" stopColor="#31175e" />
      </radialGradient></defs>
      <path d="M2 45 Q100 ${45 - 62 * open} 198 45 Q100 ${45 + 62 * open} 2 45 Z" fill="#f5f0e6" stroke="#3b2b17" strokeWidth="4" />
      <circle cx="100" cy="45" r={26 * Math.max(0.15, open)} fill="url(#iris)" />
      <circle cx="100" cy="45" r={10 * Math.max(0.15, open)} fill="#0a0512" />
      <circle cx="92" cy="37" r={4 * open} fill="#fff" opacity="0.9" />
    </svg>
  );
}
export function useFav(key: string) {
  const [on, setOn] = useState(false);
  useEffect(() => { try { setOn(!!JSON.parse(localStorage.getItem("gf-fav") || "[]").find((x: string) => x === key)); } catch { } }, [key]);
  const toggle = () => setOn(v => {
    const nv = !v;
    try {
      const list = new Set(JSON.parse(localStorage.getItem("gf-fav") || "[]") as string[]);
      nv ? list.add(key) : list.delete(key);
      localStorage.setItem("gf-fav", JSON.stringify([...list]));
    } catch { }
    return nv;
  });
  return [on, toggle] as const;
}
export function FavBtn({ k, className = "" }: { k: string; className?: string }) {
  const [on, t] = useFav(k);
  return <button title="علاقه‌مندی" onClick={e => { e.stopPropagation(); t(); }} className={`text-lg transition ${on ? "scale-110 text-gold" : "opacity-40 hover:opacity-90"} ${className}`}>{on ? "★" : "☆"}</button>;
}
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0); const r = useRef<HTMLSpanElement>(null); const done = useRef(false);
  useEffect(() => {
    const el = r.current; if (!el) return;
    const io = new IntersectionObserver(es => {
      if (es[0].isIntersecting && !done.current) {
        done.current = true;
        const t0 = performance.now();
        const step = (t: number) => { const p = Math.min(1, (t - t0) / 1400); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  const fa = (n: number) => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return <span ref={r} className="tabular-nums">{fa(v)}{suffix}</span>;
}
export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.94, y: 14 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.32 }}
        className={`card max-h-[88vh] w-full ${wide ? "max-w-5xl" : "max-w-2xl"} overflow-auto p-5`} onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  );
}
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = (m: string) => { setMsg(m); if (timer.current) clearTimeout(timer.current); timer.current = window.setTimeout(() => setMsg(null), 2600); };
  const node = msg ? (
    <div className="fixed bottom-24 right-1/2 z-[95] translate-x-1/2 sm:bottom-8">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card glass px-5 py-2.5 text-sm font-bold shadow-2xl">
        {msg}
      </motion.div>
    </div>
  ) : null;
  return { show, node };
}
/** فقط روی کلاینت (پس از Hydration) true می‌شود — برای widgetهای مبتنی بر localStorage */
export function useHydrated() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
