"use client";
// 🧩 ۲۱۲ فکتِ جالب — کارت‌های فلیپ، فیلتر، کارت‌کشی، TTS و ادغامِ فکت‌های ثبت‌شدهٔ شما
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FUN_FACTS } from "@/data/fun";
import { FUN_CATS, type FunCat } from "@/data/types";
import { Panel, SectionTitle, Chip, FlipCard, FavBtn, useToast } from "@/components/ui";
import { allEntries, type UserEntry } from "@/lib/db";
import { share, faNum } from "@/lib/utils";
import { speak, stopSpeak, VOICE_PRESETS, supported } from "@/lib/tts";
import { sfx } from "@/components/Shell";

type Row = { id: string; x: string; c: FunCat; tags?: string[]; user?: UserEntry };

function FactsInner() {
  const sp = useSearchParams();
  const [cat, setCat] = useState<FunCat | "all" | "fav">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"id" | "rand">("id");
  const [draw, setDraw] = useState<Row | null>(null);
  const [userRows, setUserRows] = useState<UserEntry[]>([]);
  const toast = useToast();
  const [speaking, setSpeaking] = useState<string | null>(null);

  useEffect(() => { allEntries("fun").then(setUserRows).catch(() => { }); }, []);
  useEffect(() => {
    const focus = sp.get("focus");
    if (focus) setTimeout(() => document.getElementById(`fun-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }, [sp]);

  const rows: Row[] = useMemo(() => {
    const base: Row[] = [
      ...FUN_FACTS.map(f => ({ id: `f${f.id}`, x: f.x, c: f.c, tags: f.tags })),
      ...userRows.map(u => ({ id: `u${u.id}`, x: u.text, c: ((u.cat as FunCat) in FUN_CATS ? u.cat : "prod") as FunCat, user: u })),
    ];
    const nq = q.trim();
    let out = base.filter(r =>
      (cat === "all" || cat === "fav" ? true : r.c === cat) &&
      (!nq || (r.x + " " + (r.tags || []).join(" ")).includes(nq))
    );
    if (cat === "fav") {
      const favs = new Set((typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("gf-fav") || "[]")) as string[]);
      out = out.filter(r => favs.has(`fun:${r.id}`));
    }
    if (sort === "rand") out = [...out].sort(() => Math.random() - 0.5);
    return out;
  }, [cat, q, sort, userRows]);

  const say = (r: Row, presetId: string) => {
    sfx();
    const p = VOICE_PRESETS.find(x => x.id === presetId) ?? VOICE_PRESETS[1];
    stopSpeak(); speak("فکت جالب: " + r.x, p); setSpeaking(r.id);
    const iv = setInterval(() => setSpeaking(s => (s === r.id ? s : null)), 400);
    setTimeout(() => { clearInterval(iv); setSpeaking(null); }, Math.min(30000, 4000 + r.x.length * 90));
  };

  const drawOne = () => { const r = rows[(Math.random() * rows.length) | 0]; setDraw(r); };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionTitle kicker="F-331 PRESENTS · ۲۰۰+ DOSSIERS"
        title="فکت‌هایِ جالبِ آبشار جاذبه"
        sub={`همۀ ${faNum(FUN_FACTS.length)} فکتِ راستی‌آزمایی‌شده + ${faNum(userRows.length)} فکتِ ثبت‌شدۀ شما روی کارت‌های فلیپ. کلیک = برگردان؛ بلندخوانی = با صدای شخصیت‌ها.`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>🗂 همه</Chip>
        <Chip on={cat === "fav"} onClick={() => setCat("fav")}>★ علاقه‌مندی</Chip>
        {(Object.keys(FUN_CATS) as FunCat[]).map(c => (
          <Chip key={c} on={cat === c} onClick={() => setCat(c)} color={FUN_CATS[c].color}>{FUN_CATS[c].emoji} {FUN_CATS[c].fa}</Chip>
        ))}
        <span className="mx-1 h-5 w-px bg-white/10" />
        <Chip on={sort === "rand"} onClick={() => setSort(sort === "rand" ? "id" : "rand")}>🎲 بر زدن</Chip>
        <button className="btn btn-magic !py-1.5 !text-xs" onClick={drawOne}>🃏 کارت بکش</button>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو در فکت‌ها…" className="input sm:max-w-56" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) => {
          const meta = FUN_CATS[r.c];
          return (
            <motion.div key={r.id + sort} layout initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: (i % 6) * 0.035 }}>
              <div id={`fun-${r.id.replace(/^\D+/, "")}`}>
                <FlipCard
                  front={
                    <Panel className="flex h-full min-h-56 flex-col p-4" >
                      <div className="mb-2 flex items-center justify-between text-[0.62rem] font-black">
                        <span className="rounded-lg px-2 py-0.5" style={{ background: meta.color + "22", color: meta.color }}>{meta.emoji} {meta.fa}</span>
                        <span className="flex items-center gap-1 opacity-50">{speaking === r.id && <span className="animate-pulse">🔊</span>}<span className="font-mono">{r.id}</span></span>
                      </div>
                      <p className="line-clamp-4 text-sm leading-7">{r.x.slice(0, 150)}{r.x.length > 150 ? "…" : ""}</p>
                      <div className="mt-auto flex items-center gap-1 pt-2 text-[0.68rem] opacity-60">
                        {(r.tags || []).slice(0, 3).map(t => <span key={t} className="rounded bg-white/5 px-1.5 py-0.5">#{t}</span>)}
                        {r.user && <span className="rounded bg-magic/20 px-1.5 py-0.5 text-magic2">کاربرِ شما</span>}
                        <span className="mr-auto cursor-pointer text-gold opacity-90">برگردان ←</span>
                      </div>
                    </Panel>
                  }
                  back={
                    <Panel className="flex h-full min-h-56 flex-col justify-between !border-gold/40 bg-gradient-to-br from-gold/10 to-magic/10 p-4">
                      <p className="text-[0.78rem] leading-7">{r.x}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {supported() && <button className="chip !text-[0.65rem]" onClick={e => { e.stopPropagation(); say(r, "mabel"); }}>🗣 میبل بخواند</button>}
                        {supported() && <button className="chip !text-[0.65rem]" onClick={e => { e.stopPropagation(); say(r, "stan"); }}>🎩 استن بخواند</button>}
                        <button className="chip !text-[0.65rem]" onClick={e => { e.stopPropagation(); share("فکت گرانش فالز", r.x).then(res => toast.show(res === "shared" ? "اشتراک ✓" : "کپی ✓")); }}>📤 اشتراک</button>
                        <FavBtn k={`fun:${r.id}`} />
                        <span className="mr-auto text-[0.62rem] opacity-50">↺ برگشت</span>
                      </div>
                    </Panel>
                  }
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      {!rows.length && <div className="py-16 text-center opacity-50">{cat === "fav" ? "هنوز ستاره‌ای ندارید؛ روی ☆ کارت‌ها بزنید." : "نتیجه‌ای نبود؛ عبارت دیگری را امتحان کنید."}</div>}

      <AnimatePresence>
        {draw && (
          <motion.div className="fixed inset-0 z-[95] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDraw(null)}>
            <motion.div initial={{ rotate: -8, y: 60, opacity: 0 }} animate={{ rotate: 0, y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", bounce: 0.45 }}
              className="card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between text-[0.65rem] font-black tracking-widest opacity-60">
                <span>🃏 کارتِ شانس — {FUN_CATS[draw.c].emoji} {FUN_CATS[draw.c].fa}</span><span>{draw.id}</span>
              </div>
              <p className="text-sm leading-8">{draw.x}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn btn-gold !text-xs" onClick={drawOne}>کارتِ بعدی</button>
                <button className="btn btn-ghost ring-1 ring-white/10 !text-xs" onClick={() => setDraw(null)}>بستن</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {toast.node}
    </div>
  );
}
export default function FactsPage() {
  return <Suspense fallback={<div className="p-10 text-center opacity-60">در حال چیدنِ کارت‌ها…</div>}><FactsInner /></Suspense>;
}
