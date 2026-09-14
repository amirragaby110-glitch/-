"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/lib/store";
import { bgFx } from "./Background";
import { useInstallPrompt } from "./Pwa";
import { ScaryEye } from "./ui";

export const NAV = [
  { href: "/", label: "خانه", icon: "🏠" },
  { href: "/music", label: "موزیک", icon: "🎵" },
  { href: "/horror", label: "رازهای تاریک", icon: "🔦" },
  { href: "/facts", label: "فکت‌ها", icon: "🧩" },
  { href: "/story", label: "داستان", icon: "📖" },
  { href: "/watch", label: "تماشا", icon: "📺" },
  { href: "/gallery", label: "گالری", icon: "🖼️" },
  { href: "/cast", label: "سازندگان", icon: "🎙️" },
  { href: "/ai", label: "هوش مصنوعی", icon: "🤖" },
  { href: "/voice", label: "آزمایشگاه صدا", icon: "🗣️" },
  { href: "/quiz", label: "آزمون", icon: "🧠" },
  { href: "/submit", label: "ثبت اطلاعات", icon: "✍️" },
  { href: "/settings", label: "تنظیمات", icon: "⚙️" },
];

function sfx(kind: "click" | "open" = "click") {
  if (typeof window === "undefined") return;
  if (!useSettings.getState().soundFX) return;
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const g = (sfx as any)._ctx || ((sfx as any)._ctx = new AC());
    const t = g.currentTime;
    const o = g.createOscillator(), gn = g.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(kind === "open" ? 320 : 660, t);
    o.frequency.exponentialRampToValueAtTime(kind === "open" ? 640 : 240, t + 0.09);
    gn.gain.setValueAtTime(0.06, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(gn); gn.connect(g.destination); o.start(t); o.stop(t + 0.13);
  } catch { }
}
export { sfx };

export default function Shell({ children, onOpenPalette }: { children: React.ReactNode; onOpenPalette: () => void }) {
  const path = usePathname();
  const { theme, toggleTheme, autoNight } = useSettings();
  const [menu, setMenu] = useState(false);
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    if (!autoNight) return;
    const h = new Date().getHours();
    const shouldDark = h >= 18 || h < 6;
    if (shouldDark !== (theme === "dark")) toggleTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoNight]);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50">
        <nav className="glass hairline flex items-center gap-1 border-x-0 border-t-0 px-3 py-2 sm:px-5">
          <Link href="/" onClick={() => { sfx("open"); bgFx.kick("eye"); }} className="ml-1 flex shrink-0 items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold/25 to-magic/25 ring-1 ring-gold/40">
              <ScaryEye open={0.9} className="w-6" />
            </span>
            <span className="hidden sm:block">
              <span className="title-creep glow-gold block text-lg leading-5 text-gold">GRAVITY FALLS</span>
              <span className="block text-[0.6rem] font-black tracking-[0.35em] opacity-60">ULTIMATE NEXUS</span>
            </span>
          </Link>
          <div className="mx-2 hidden flex-1 items-center gap-0.5 overflow-x-auto xl:flex 2xl:gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} onClick={() => sfx()}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[0.78rem] font-bold transition ${path === n.href ? "bg-gold/15 text-gold shadow-[inset_0_0_0_1px_rgba(224,182,79,0.35)]" : "opacity-70 hover:bg-white/5 hover:opacity-100"}`}>
                <span className="ml-1">{n.icon}</span>{n.label}
              </Link>
            ))}
          </div>
          <div className="mr-auto flex items-center gap-1.5 xl:mr-0">
            <button onClick={() => { sfx("open"); onOpenPalette(); }} className="btn btn-ghost !px-3" title="جستجوی سراسری (Ctrl+K)">
              <span>🔍</span><span className="hidden text-[0.68rem] opacity-60 sm:inline">Ctrl K</span>
            </button>
            <button onClick={() => { sfx(); toggleTheme(); bgFx.kick("mote"); }} className="btn btn-ghost !px-3" title="حالت روز / شب">
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            <button onClick={() => { sfx(); setMenu(v => !v); }} className="btn btn-ghost !px-3 xl:hidden" title="منو">
              {menu ? "✕" : "☰"}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="glass overflow-hidden xl:hidden">
              <div className="grid grid-cols-2 gap-1.5 p-3">
                {NAV.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => sfx()}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${path === n.href ? "bg-gold/15 text-gold" : "bg-white/5"}`}>
                    <span>{n.icon}</span>{n.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pb-24 pt-4 md:pb-12">{children}</main>

      {/* نوار پایین موبایل */}
      <div className="glass fixed inset-x-2 bottom-2 z-50 flex items-stretch justify-between gap-1 rounded-2xl px-2 py-1.5 md:hidden">
        {NAV.slice(0, 4).map(n => (
          <Link key={n.href} href={n.href} className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[0.62rem] font-black ${path === n.href ? "text-gold" : "opacity-65"}`}>
            <span className="text-lg leading-6">{n.icon}</span>{n.label}
          </Link>
        ))}
        <button onClick={() => { sfx("open"); setMenu(v => !v); }} className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[0.62rem] font-black opacity-80">
          <span className="text-lg leading-6">⚡</span>همه
        </button>
      </div>

      <footer className="hairline mt-14 border-t border-b-0 border-x-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3">
          <div>
            <div className="title-creep glow-magic text-xl text-magic2">GRAVITY FALLS · ULTIMATE NEXUS</div>
            <p className="mt-2 text-xs leading-6 opacity-65">
              پایگاهِ دانشِ هواداریِ گرانش فالز — ساخته‌شده با ♥ برای ایرانیان.
              تمامِ موسیقی‌ها «بازسازیِ سینتی‌سایزر» هستند و این پروژه به دیزنی وابسته نیست.
              «تابستان هیچ‌وقت تمام نمی‌شود.»
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-black tracking-widest opacity-70">مسیرهای سریع</div>
            <div className="grid grid-cols-2 gap-1 text-sm">
              {NAV.slice(1, 9).map(n => <Link key={n.href} href={n.href} className="opacity-70 transition hover:text-gold hover:opacity-100">{n.icon} {n.label}</Link>)}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-black tracking-widest opacity-70">نصب و دسترسی</div>
            {!installed && (
              <button onClick={() => promptInstall()} disabled={!canInstall}
                className={`btn btn-magic mb-2 ${canInstall ? "" : "opacity-50"}`}>📲 نصب اپ (PWA)</button>
            )}
            {installed && <div className="mb-2 text-xs text-forest2 dark:text-pine">✓ اپ روی این دستگاه نصب است</div>}
            <div className="text-[0.7rem] leading-6 opacity-55">
              آفلاین کار می‌کند · روی موبایل و دسکتاپ · داده‌های شما فقط در دستگاهِ خودتان ذخیره می‌شود (IndexedDB).
            </div>
          </div>
        </div>
        <div className="px-5 pb-10 text-center text-[0.68rem] tracking-widest opacity-40">
          F-331 · EYEBROWS · «بیل را جدی نگیر… مگر آخرِ تابستان»
        </div>
      </footer>
    </div>
  );
}
