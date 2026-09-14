"use client";
// 🔦 رازهایِ تاریک — ۱۱۰ فکت ترسناک، حالتِ بیل، GSAP، صدای آمبینت
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { HORROR_FACTS } from "@/data/horror";
import { HORROR_CATS, type HorrorCat } from "@/data/types";
import { Panel, SectionTitle, Chip, ScaryEye, useToast, FavBtn, Counter } from "@/components/ui";
import { useSettings } from "@/lib/store";
import { ambient } from "@/lib/ambient";
import { share, faNum } from "@/lib/utils";
import { player } from "@/lib/player";
import { TRACKS } from "@/data/tracks";
import { bgFx } from "@/components/Background";
import { sfx } from "@/components/Shell";
import { GnomeSpot } from "@/components/GnomeHunt";
import { CipherScroll } from "@/components/CipherScroll";
import ShareCardBtn from "@/components/ShareCardBtn";
import { AmbientMixer } from "@/components/AmbientUI";
import { bumpCounter } from "@/lib/progress";

const SCARY_WORDS = ["بیل", "چشم", "نفرین", "مرگ", "تسخیر", "سایه", "۱۹۸۲"];
export default function HorrorPage() {
  const [cat, setCat] = useState<HorrorCat | "all">("all");
  const [lvl, setLvl] = useState(0);
  const [q, setQ] = useState("");
  const [roulette, setRoulette] = useState<number | null>(null);
  const [jump, setJump] = useState(false);
  const { horrorMode, scaryAmbient, set } = useSettings();
  const toast = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const list = useMemo(() => {
    const nq = q.trim();
    return HORROR_FACTS.filter(f =>
      (cat === "all" || f.c === cat) && (lvl === 0 || f.lvl >= lvl) &&
      (!nq || (f.t + f.x).includes(nq))
    );
  }, [cat, lvl, q]);

  useEffect(() => {
    if (!headRef.current) return;
    gsap.fromTo(headRef.current.children, { y: 26, opacity: 0, filter: "blur(6px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.09, ease: "power3.out" });
  }, []);
  useEffect(() => {
    if (!gridRef.current) return;
    const els = gridRef.current.querySelectorAll(".factcard");
    gsap.fromTo(els, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.03, ease: "power2.out", overwrite: true });
  }, [list]);
  useEffect(() => () => { ambient.stop(); }, []);

  const toggleAmbient = async () => {
    if (scaryAmbient) { ambient.stop(); set({ scaryAmbient: false }); return; }
    if (!player.ctx) await player.ensure();
    ambient.start(0.55); set({ scaryAmbient: true });
    toast.show("🌫 هووم… صدای زیرزمین روشن شد");
  };
  const jumpscare = (word?: string) => {
    sfx(); bgFx.kick("eye"); ambient.jumpscare();
    setJump(true); setTimeout(() => setJump(false), 950);
    try { speechSynthesis.cancel(); } catch { }
    if (typeof speechSynthesis !== "undefined") {
      const u = new SpeechSynthesisUtterance(word || "نیمه‌شب… گرانش فالز");
      u.lang = "fa-IR"; u.pitch = 0.2; u.rate = 0.62; u.volume = 0.9;
      try { speechSynthesis.speak(u); } catch { }
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <GnomeSpot i={13} />
      <GnomeSpot i={14} hue={140} />
      <CipherScroll id="s1" t={26} />
      <div ref={headRef} className="relative overflow-hidden py-8 text-center">
        <ScaryEye open={0.92} className="floaty mx-auto mb-3 w-24 drop-shadow-[0_0_40px_rgba(157,92,255,0.75)]" />
        <div className="text-[0.68rem] font-black tracking-[0.5em] text-blood">DO NOT READ ALONE · CLASSIFIED · FAN ARCHIVE</div>
        <h1 className="title-creep glow-red mt-2 text-5xl text-red-300 dark:text-red-400 sm:text-6xl">رازهایِ تاریک</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-8 opacity-75">
          {faNum(HORROR_FACTS.length)} فکت ترسناک از دلِ تاریکیِ آبشار جاذبه. اگر شب است، چراغ‌ها را روشن بگذار… و اگر نه، باز هم روشن بگذار.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button onClick={toggleAmbient} className={`btn ${scaryAmbient ? "btn-danger" : "btn-ghost ring-1 ring-white/15"}`}>🌫 صدایِ پس‌زمینه: {scaryAmbient ? "روشن" : "خاموش"}</button>
          <button onClick={() => { set({ horrorMode: !horrorMode }); toast.show(horrorMode ? "چشم‌ها برگشتند به دیوار…" : "👁 حالتِ بیل فعال شد — در هر صفحه‌ای پچ‌پچ می‌شنوی"); }} className={`btn ${horrorMode ? "btn-danger" : "btn-magic"}`}>
            👁 حالتِ بیل: {horrorMode ? "روشن" : "خاموش"}
          </button>
          <button onClick={() => { bumpCounter("roulettes", 1, "🎲 رولتِ وحشت چرخید", 2); const f = HORROR_FACTS[(Math.random() * HORROR_FACTS.length) | 0]; setRoulette(f.id); setTimeout(() => { jumpscare(); document.getElementById(`h-${f.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 350); }} className="btn btn-gold">🎲 رولتِ وحشت</button>
        </div>
        <div className="mt-4 flex justify-center gap-4 text-[0.68rem] font-bold opacity-60">
          <span>⚠️ میانگینِ شدت: <Counter to={Math.round(HORROR_FACTS.reduce((a, f) => a + f.lvl, 0) / HORROR_FACTS.length * 10) / 10} /> از ۵</span>
          <span>🔗 {faNum(HORROR_FACTS.filter(f => f.lvl >= 4).length)} فکتِ سطح‌سنگین</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>همه ({faNum(HORROR_FACTS.length)})</Chip>
        {(Object.keys(HORROR_CATS) as HorrorCat[]).map(c => (
          <Chip key={c} on={cat === c} onClick={() => setCat(c)}>{HORROR_CATS[c].emoji} {HORROR_CATS[c].fa} <span className="opacity-50">({faNum(HORROR_FACTS.filter(f => f.c === c).length)})</span></Chip>
        ))}
        <div className="mr-auto flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => <Chip key={n} on={lvl === n} onClick={() => setLvl(lvl === n ? 0 : n)}>💀{faNum(n)}</Chip>)}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو در تاریکی… (کلمه: نفرین، بیل، ۱۹۸۲)" className="input sm:max-w-56" />
      </div>

      <div ref={gridRef} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map(f => (
          <div key={f.id} id={`h-${f.id}`} className={`factcard ${roulette === f.id ? "ring-2 ring-blood" : ""}`}>
            <Panel hover className="group relative h-full overflow-hidden p-4">
              <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-40 bg-gradient-to-t from-blood/20 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[0.62rem] font-black opacity-80">{HORROR_CATS[f.c].emoji} {HORROR_CATS[f.c].fa}</span>
                <div className="flex items-center gap-1.5">
                  <FavBtn k={`h:${f.id}`} />
                  <span className="font-mono text-[0.62rem] opacity-40">#{String(f.id).padStart(3, "0")}</span>
                </div>
              </div>
              <h3 className="mb-1.5 flex items-center gap-2 font-black leading-6 text-red-100/95 dark:text-red-200">
                <span>{f.t}</span>
              </h3>
              <p className="text-[0.8rem] leading-7 opacity-80">{f.x}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-0.5" title={`سطح ترس ${f.lvl}`}>{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < f.lvl ? "text-red-400" : "text-red-900/40"}>🕯</span>)}</div>
                <div className="flex gap-1">
                  <button className="chip !text-[0.62rem]" onClick={() => { jumpscare(SCARY_WORDS[f.id % SCARY_WORDS.length]); }}>👁 بیل‌بینی</button>
                  <button className="chip !text-[0.62rem]" onClick={async () => { const r = await share("فکت ترسناک گرانش فالز", `${f.t} — ${f.x}`); toast.show(r === "shared" ? "اشتراک انجام شد" : "کپی شد"); }}>📤</button>
                  <ShareCardBtn tag="رازِ تاریک · GRAVITY FALLS" title={f.t} body={f.x} accent="blood" label="🖨" />
                </div>
              </div>
            </Panel>
          </div>
        ))}
      </div>
      {!list.length && <div className="py-16 text-center opacity-50">هیچ فکتی با این فیلترها پیدا نشد — مثلِ شواهدِ پرونده‌هایِ بسته‌شده.</div>}

      <div className="mt-10">
        <SectionTitle kicker="برای ادامهٔ شب" title="پخشِ موسیقیِ مناسبِ این حال" />
        <div className="flex flex-wrap gap-2">
          {["fog_forest", "mirror_waltz", "clock_waltz", "bill_swing", "third_eye"].map(id => {
            const t = TRACKS.find(x => x.id === id)!;
            return <button key={id} className="btn btn-ghost ring-1 ring-white/10 !text-xs" onClick={() => { player.playDef(t); }}>▶ {t.title}</button>;
          })}
        </div>
      </div>

      <div className="mt-10">
        <SectionTitle kicker="MIDNIGHT SOUND STUDIO" title="🌫 میکسرِ صداهایِ جنگل"
          sub="باد، باران، هیزم و جیرجیرک — هر چهار لوپ با فیلتر و نوسان‌ساز زنده ساخته می‌شوند؛ ترکیب دلخواهت را بساز و حتی در صفحاتِ دیگر هم با خودت ببر." />
        <AmbientMixer />
      </div>

      {jump && (
        <div className="scare-flash pointer-events-none fixed inset-0 z-[96] grid place-items-center bg-red-950/90">
          <div className="text-center">
            <ScaryEye open={1} className="mx-auto w-64" />
            <div className="title-creep mt-4 animate-pulse text-3xl tracking-[0.5em] text-red-300">I&apos;M ALWAYS ALIVE</div>
          </div>
        </div>
      )}
      {toast.node}
    </div>
  );
}
