"use client";
// 📖 داستانِ کامل — ۴۰ قسمت، خط زمانی، نقشۀ قوس‌ها، کتاب‌ها و فن‌فیک‌ها
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EPISODES } from "@/data/episodes";
import { CHARACTERS, charName } from "@/data/characters";
import { TIMELINE, STORY_ARC, type StoryArcNode } from "@/data/timeline";
import { BOOKS, VOICE_CAST } from "@/data/cast";
import { GnomeSpot } from "@/components/GnomeHunt";
import { CipherScroll } from "@/components/CipherScroll";
import { Panel, SectionTitle, Chip, Reveal, useToast, ProceduralImg } from "@/components/ui";
import { faDate, faNum, share } from "@/lib/utils";
import { speak, stopSpeak, VOICE_PRESETS, supported } from "@/lib/tts";
import { addEntry, allEntries, removeEntry, type UserEntry } from "@/lib/db";
import { galleryPoster } from "@/lib/poster";
import { CHARMAP } from "./chars";

const SHORTS = [
  { t: "Dipper's Guide to the Unexplained", n: "۶ قسمت", d: "راهنمای مستندگونهٔ آنومالی‌ها — «Candy Monster»، «The Mailbox»، «The Hide-Behind»…" },
  { t: "Mabel's Guide to Life", n: "۵ قسمت", d: "میبل دربارهٔ قرارها، استیکرها، فشن و «بچه‌های بد»." },
  { t: "Fixin' It with Soos", n: "۲+ قسمت", d: "سوس، چسبِ نقره‌ای و یک فلسفۀ زندگی." },
  { t: "Public Access TV Shorts", n: "۲ قسمت", d: "تبلیغات و تیزرهای «چینل ۴» شهر؛ منبعِ بیشترِ جوک‌های پس‌زمینه." },
  { t: "Creepy Letters from Lil' Gideon", n: "۵ قسمت", d: "نامه‌های دلهره‌آور گیدئون به بچه‌های شهر." },
  { t: "Mabel's Scrapbook: Heist Movie", n: "۲ قسمت", d: "دفترچۀ خاطرات با ادای دین به مستندها و دوقلوهایِ بیل داونپورت." },
  { t: "Old Man McGucket's Conspiracy Corner", n: "۱۰ قسمت", d: "تئوری‌های توطئه با انرژیِ کاملِ مک‌گاکت." },
  { t: "Mystery Shack: Shop at Home with Mr. Mystery", n: "۹ قسمت", d: "استن و فروش مستقیمِ کالاهای جعلی." },
  { t: "Between the Pines (ویژۀ پشت‌صحنه)", n: "۱ قسمت", d: "نگاهِ مستندگونه به تیم داستان و ضبط صداها." },
];

function ArcTree({ node, depth = 0 }: { node: StoryArcNode; depth?: number }) {
  const tone = node.tone === "horror" ? "#b0392e" : node.tone === "heart" ? "#e88fb2" : "#e0b64f";
  return (
    <div className="relative pr-5" style={{ marginRight: depth ? 14 : 0 }}>
      <span className="absolute right-0 top-2 h-3 w-3 rounded-full ring-2 ring-black/30" style={{ background: tone }} />
      {node.children?.length ? (
        <details open={depth < 1} className="group">
          <summary className="mb-1 cursor-pointer list-none">
            <Panel hover className="border-r-4 !bg-black/20 p-3 dark:!bg-white/5" >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black" style={{ color: tone }}>{node.t}</h4>
                <span className="text-[0.65rem] opacity-50 transition group-open:rotate-90">◀</span>
              </div>
              <p className="mt-1 text-[0.74rem] leading-6 opacity-70">{node.x}</p>
            </Panel>
          </summary>
          <div className="mt-1 space-y-1.5 border-r border-dashed border-white/10 pr-4">
            {node.children.map(c => <ArcTree key={c.id} node={c} depth={depth + 1} />)}
          </div>
        </details>
      ) : (
        <Panel className="mb-1.5 border-r-4 !bg-black/10 p-2.5 dark:!bg-white/5">
          <div className="text-[0.8rem] font-bold" style={{ color: tone }}>{node.t}</div>
          <div className="text-[0.68rem] opacity-60">{node.x}</div>
        </Panel>
      )}
    </div>
  );
}

function StoryInner() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<"eps" | "timeline" | "tree" | "books" | "fanfic">("eps");
  const [season, setSeason] = useState<0 | 1 | 2>(0);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(sp.get("ep"));
  const [narrating, setNarrating] = useState<string | null>(null);
  const [fanfic, setFanfic] = useState<UserEntry[]>([]);
  const [ft, setFt] = useState(""), [fx, setFx] = useState("");
  const toast = useToast();

  useEffect(() => { allEntries("fanfic").then(setFanfic).catch(() => { }); }, []);
  useEffect(() => {
    const ep = sp.get("ep");
    if (ep) { setTab("eps"); setOpen(ep); setTimeout(() => document.getElementById(`ep-${ep}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 350); }
    const tl = sp.get("section");
    if (tl === "timeline") setTab("timeline");
  }, [sp]);

  const rows = useMemo(() => {
    const nq = q.trim();
    return EPISODES.filter(e => (season === 0 || e.s === season) && (!nq || (e.tfa + e.ten + e.sum + e.chars.join(" ")).includes(nq)));
  }, [season, q]);

  const narrate = (id: string, text: string) => {
    if (narrating === id) { stopSpeak(); setNarrating(null); return; }
    stopSpeak(); setNarrating(id);
    speak(text, VOICE_PRESETS[0]); // دیپر
    const ms = Math.min(48000, 3000 + text.length * 110);
    setTimeout(() => setNarrating(n => (n === id ? null : n)), ms);
    toast.show("🗣 روایتِ صوتی (با صدای دیپر) شروع شد — برای توقف دوباره بزنید");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <GnomeSpot i={9} />
      <CipherScroll id="s2" t={22} side="left" />
      <SectionTitle kicker="THE SUMMER THAT NEVER ENDS" title="📖 داستان، خط زمانی و قوس‌ها"
        sub="خلاصۀ هر ۴۰ قسمت + روایتِ صوتیِ فارسی، خط زمانی تعاملی، نقشۀ درختیِ داستان و کتاب‌ها/مینی‌قسمت‌ها." />
      <div className="mb-5 flex flex-wrap gap-2">
        {([["eps", "📺 قسمت‌ها"], ["timeline", "🧭 خط زمانی"], ["tree", "🌳 نقشۀ داستان"], ["books", "📚 کتاب و کامیک"], ["fanfic", "🖋 فن‌فیک‌ها"]] as const).map(([k, l]) => (
          <Chip key={k} on={tab === k} onClick={() => setTab(k)}>{l}</Chip>
        ))}
      </div>

      {tab === "eps" && (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Chip on={season === 0} onClick={() => setSeason(0)}>هر دو فصل</Chip>
            <Chip on={season === 1} onClick={() => setSeason(1)}>فصل ۱</Chip>
            <Chip on={season === 2} onClick={() => setSeason(2)}>فصل ۲</Chip>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو: بیل، گیدئون، گلف…" className="input sm:max-w-64" />
            <div className="mr-auto text-[0.65rem] opacity-50">{faNum(rows.length)} قسمت · سطح ترس = 🔥</div>
          </div>
          <div className="space-y-2">
            {rows.map((ep, i) => {
              const key = `${ep.s}-${ep.e}`;
              return (
                <div id={`ep-${key}`} key={key}>
                  <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 5) * 0.03 }}>
                    <Panel className={`overflow-hidden transition ${open === key ? "ring-1 ring-gold/50" : "hover:ring-1 hover:ring-white/10"}`}>
                      <button className="flex w-full items-center gap-3 p-3.5 text-right" onClick={() => { sfxClick(); setOpen(open === key ? null : key); }}>
                        <span className="title-crep grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest to-night text-base text-gold2 ring-1 ring-gold/25">{ep.s}.{ep.e}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black">{ep.tfa} <span className="text-[0.68rem] font-normal opacity-50">{ep.ten}</span></span>
                          <span className="mt-0.5 block truncate text-[0.68rem] opacity-60">{faDate(ep.air)}{ep.d ? ` · کارگردان: ${ep.d}` : ""}{ep.v ? ` · ${faNum(ep.v)}M بیننده` : ""}{ep.arc ? " · ⭐ قوس اصلی" : ""}</span>
                        </span>
                        <span className="hidden shrink-0 gap-0.5 sm:flex">{Array.from({ length: 5 }, (_, n) => <span key={n} className={n < ep.sc ? "" : "opacity-15"}>🔥</span>)}</span>
                        <span className={`shrink-0 text-gold transition ${open === key ? "rotate-90" : ""}`}>◀</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open === key && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
                            <div className="grid gap-4 border-t border-white/10 p-4 md:grid-cols-[1fr_240px]">
                              <div>
                                <p className="text-[0.82rem] leading-8">{ep.sum}</p>
                                {ep.moment && <div className="mt-2 rounded-xl border-r-4 border-gold/60 bg-gold/5 px-3 py-2 text-[0.74rem] italic leading-7 opacity-85">✦ {ep.moment}</div>}
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {ep.chars.map(c => <span key={c} className="chip !text-[0.62rem] !cursor-default">{CHARMAP[c] ?? "👤"} {charName(c)}</span>)}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {supported() && <button className="btn btn-magic !py-1.5 !text-xs" onClick={() => narrate(key, `قسمت ${ep.e} از فصل ${ep.s}: ${ep.tfa}. ${ep.sum}`)}>{narrating === key ? "⏹ توقف روایت" : "🗣 روایتِ صوتی"}</button>}
                                  <a className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs" href={`/watch?ep=${key}`}>📺 تماشای این قسمت</a>
                                  <button className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs" onClick={() => share(ep.tfa, ep.sum).then(r => toast.show(r === "shared" ? "اشتراک ✓" : "کپی ✓"))}>📤 اشتراک</button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-1 md:grid-cols-2">
                                {ep.chars.slice(0, 6).map(c => CHARACTERS.find(ch => ch.id === c)).filter(Boolean).map(ch => (
                                  <div key={ch!.id} title={ch!.fa} className="overflow-hidden rounded-xl ring-1 ring-white/10">
                                    <img src={galleryPoster({ id: ch!.id, hue: parseInt(ch!.color.slice(1), 16) % 360, sat: 0.5, fa: ch!.fa, title: ch!.name } as any, 240)} alt="" className="aspect-square w-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Panel>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="relative mx-auto max-w-3xl py-4">
          <div className="absolute inset-y-0 right-[13px] w-0.5 bg-gradient-to-b from-gold/10 via-gold/50 to-magic/20 sm:right-1/2" />
          {TIMELINE.map((t, i) => (
            <Reveal key={i} delay={(i % 4) * 0.05}>
              <div className={`relative mb-6 flex gap-4 sm:w-1/2 ${i % 2 ? "sm:mr-[50%] sm:flex-row" : "sm:ml-[50%] sm:flex-row-reverse sm:text-left"}`}>
                <span className={`absolute right-[7px] top-3 h-3.5 w-3.5 rounded-full ring-4 ring-[var(--bg)] sm:${i % 2 ? "-right-[23px]" : "-left-[23px]"}`} style={{ background: t.kind === "show" ? "#e0b64f" : "#9d5cff" }} />
                <Panel hover className="mr-8 w-full p-4 sm:mr-0">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[0.66rem] font-black tracking-widest">
                    <span className={t.kind === "show" ? "text-gold" : "text-magic2"}>{t.kind === "show" ? "🛠 تاریخچۀ ساخت" : "📜 درونِ داستان"}</span>
                    <span className="opacity-60">{t.y}</span>
                  </div>
                  <h4 className="mb-1 font-black">{t.t}</h4>
                  <p className="text-[0.76rem] leading-7 opacity-75">{t.x}</p>
                </Panel>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "tree" && (
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-center text-xs opacity-60">هر شاخه یک «قوس» است؛ بازشان کنید تا پرونده‌ها بیرون بیایند. رنگ‌ها: طلایی=راز، قرمز=وحشت، صورتی=قلبِ سریال.</p>
          <ArcTree node={STORY_ARC} />
        </div>
      )}

      {tab === "books" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-black">📚 کتاب‌ها و کامیک‌ها (اسنادِ رسمی/ادامه)</h3>
            <div className="space-y-2">
              {BOOKS.map((b, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <Panel hover className="flex items-center gap-3 p-3.5">
                    <span className="title-crep grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/10 text-xl ring-1 ring-gold/30">📖</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black">{b.t}</span>
                      <span className="block text-[0.68rem] opacity-55">{b.y} · {b.type}</span>
                      <span className="mt-1 block text-[0.74rem] leading-6 opacity-75">{b.d}</span>
                    </span>
                  </Panel>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-black">🎬 مینی‌قسمت‌ها و اسپین‌آف‌ها</h3>
            <div className="space-y-2">
              {SHORTS.map((s, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <Panel hover className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0"><div className="truncate text-sm font-black">{s.t}</div><div className="truncate text-[0.7rem] opacity-65">{s.d}</div></div>
                    <span className="chip !cursor-default shrink-0">{s.n}</span>
                  </Panel>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "fanfic" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <h3 className="font-black">🖋 تابستان‌هایی که ما نوشتیم</h3>
            {fanfic.map(f => (
              <Panel key={f.id} className="p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="text-sm font-black">{f.title}</div>
                  <div className="flex items-center gap-2 text-[0.62rem] opacity-50">
                    <span>{new Date(f.createdAt).toLocaleDateString("fa-IR")}</span>
                    <button className="hover:text-blood" title="حذف" onClick={() => { removeEntry(f.id!).then(() => allEntries("fanfic").then(setFanfic)); toast.show("حذف شد"); }}>✕</button>
                  </div>
                </div>
                {f.img && <img src={f.img} alt="" className="mb-2 max-h-40 rounded-xl object-cover" />}
                <p className="whitespace-pre-line text-[0.8rem] leading-8 opacity-85">{f.text}</p>
                <div className="mt-2 flex gap-2">
                  {supported() && <button className="chip" onClick={() => narrate("f" + f.id, `${f.title}. ${f.text}`)}>🗣 با صدای دیپر بخوان</button>}
                  <button className="chip" onClick={() => share(f.title, f.text)}>📤</button>
                  <button className="chip" onClick={() => { const p = VOICE_PRESETS[(f.id! + 1) % VOICE_PRESETS.length]; narrate("f" + f.id, `${f.title}. ${f.text}`); stopSpeak(); speak(`${f.title}. ${f.text}`, p); }}>🎭 {p_fa(f.id! % VOICE_PRESETS.length)}</button>
                </div>
              </Panel>
            ))}
            {!fanfic.length && <div className="card glass p-8 text-center text-sm opacity-60">هنوز قصه‌ای ننوشته‌اید. از فرمِ کنار شروع کنید — همه‌چیز فقط در دستگاهِ شما ذخیره می‌شود.</div>}
          </div>
          <Panel className="h-fit p-4">
            <h4 className="mb-3 font-black">✍️ نوشتنِ تابستانِ خودتان</h4>
            <input className="input mb-2" placeholder="عنوان (مثلاً: «بیل در تهران»)" value={ft} onChange={e => setFt(e.target.value)} />
            <textarea className="input min-h-40" placeholder="متن داستان…" value={fx} onChange={e => setFx(e.target.value)} />
            <button className="btn btn-gold mt-2 w-full" disabled={ft.trim().length < 2 || fx.trim().length < 20}
              onClick={async () => { await addEntry({ type: "fanfic", title: ft.trim(), text: fx.trim(), cat: "fanfic", tags: "fan", author: "شما", createdAt: Date.now(), likes: 0 } as any); setFt(""); setFx(""); allEntries("fanfic").then(setFanfic); toast.show("داستان ثبت شد ✓"); }}>
              ثبت در دفترچۀ تابستانی
            </button>
            <p className="mt-2 text-[0.64rem] leading-5 opacity-50">برای دیدۀ عمومی می‌توانید از صفحۀ «ثبت اطلاعات» خروجی JSON بگیرید و در شبکه‌ها به اشتراک بگذارید.</p>
          </Panel>
        </div>
      )}
      {toast.node}
    </div>
  );
}
const p_fa = (i: number) => ["دیپر", "میبل", "استن", "بیل", "سوس", "وندی", "فورد", "گیدئون"][i % 8] + " بخواند";
function sfxClick() { try { import("@/components/Shell").then(m => m.sfx()); } catch { } }
export default function StoryPage() { return <Suspense fallback={<div className="p-10 text-center opacity-60">در حال باز کردن ژورنال…</div>}><StoryInner /></Suspense>; }
