"use client";
// 🎙️ سازندگانِ آبشار — صداپیشه‌ها، الکس هیرش، استودیو، جوایز، آمار، مصاحبه‌ها، پشت‌صحنه
import { useState } from "react";
import { motion } from "framer-motion";
import { VOICE_CAST, CREW, AWARDS, SERIES_STATS, INTERVIEWS, BEHIND, STUDIO_HISTORY } from "@/data/cast";
import { Panel, SectionTitle, Chip, Reveal, useToast, Counter } from "@/components/ui";
import { posterUrl } from "@/lib/poster";
import { charPoster } from "@/lib/poster";
import { CHARACTERS } from "@/data/characters";
import { faNum, share } from "@/lib/utils";
import { speak, VOICE_PRESETS, supported } from "@/lib/tts";
import { Modal } from "@/components/ui";

const TABS = [
  ["alex", "🧠 الکس هیرش"], ["voices", "🎙️ صداپیشه‌ها"], ["studio", "🏛️ استودیو و تاریخچۀ ساخت"],
  ["awards", "🏆 جوایز و آمار"], ["talks", "🎤 مصاحبه‌ها"], ["bts", "📼 پشت‌صحنه"], ["chars", "👥 شخصیت‌ها"],
] as const;

export default function CastPage() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("alex");
  const [open, setOpen] = useState<string | null>(null);
  const [char, setChar] = useState<string | null>(null);
  const toast = useToast();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionTitle kicker="BEHIND THE WATERFALL" title="🎙️ آدم‌هایِ پشتِ پرده"
        sub="هر آنچه دربارهٔ خالق، صداپیشه‌ها، استودیو و تاریخچۀ پنهانِ ساخت باید بدانید — با آمارِ زنده و روایتِ صوتی." />
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => <Chip key={k} on={tab === k} onClick={() => setTab(k)}>{l}</Chip>)}
      </div>

      {tab === "alex" && (
        <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
          <Reveal>
            <img src={posterUrl({ hue: 35, sat: 0.55, fa: "الکس هیرش · Alex Hirsch", title: "The One-Man Myther" }, "alex-hero", 620, 800)} alt="Alex Hirsch poster"
              className="w-full rounded-3xl shadow-2xl ring-1 ring-gold/25" />
          </Reveal>
          <div className="space-y-4">
            <Panel className="p-5">
              <h3 className="title-crep mb-2 text-2xl text-gold">Alex Hirsch — الکس هیرش</h3>
              <p className="text-[0.85rem] leading-8 opacity-85">
                الکس هیرش، پسرِ دوقلوه‌ای که کودکی‌اش بینِ جاده‌های اورگان و جاذبه‌گاه‌های سانتاکروز گذشت، «گرانش فالز» را از دلِ همان تابستان‌ها بیرون کشید:
                خودِ کنجکاو شد دیپپر، خواهرِ بی‌قرارش شد میبل و کارفرمایِ دغل‌بازِ کلبه شد «استن». او در دیزنی از نویسنده و استوری‌بوردِ «Flapjack» و «Fish Hooks»
                به خالقِ یکی از تحسین‌شده‌ترین انیمیشن‌های دهه رسید؛ صدای استن، سوس، بیل و مک‌گاکت هم پایِ امضای خودش است. پس از پایانِ سریال، «کتاب بیل» (۲۰۲۴) را
                نوشت که شمارهٔ ۱ پرفروش‌های نیویورک‌تایمز شد و ثابت کرد تابستانِ گرانش فالز برای هیچ نسلی تمام نمی‌شود.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {supported() && <button className="btn btn-magic !py-1.5 !text-xs" onClick={() => speak("الکس هیرش، خالق گرانش فالز. اگر تا اینجا خوانده‌اید، یعنی کنجکاوی‌تان به اندازۀ دیپپر است.", VOICE_PRESETS[4])}>🗣 با صدای سوس بشنو</button>}
                <button className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs" onClick={() => share("الکس هیرش", "خالق گرانش فالز")}>📤</button>
              </div>
            </Panel>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["متولد", "۱۸ ژوئن ۱۹۸۵ — کالیفرنیا (ریشه در گوآتیمالا)"],
                ["خانواده", "دوقلوی خواهر: آریل هیرش — الگویِ میبل و همکارِ پیشین"],
                ["زوجِ هنری", "دانا تِرِس، خالق «The Owl House» — هم‌خانوادۀ معنویِ گرانش فالز"],
                ["سبک", "کمدیِ لایه‌دار + رمزنگاری + وحشتِ کودکانهٔ کنترل‌شده"],
              ].map(([k, v]) => (
                <Panel key={k} className="p-3.5"><div className="text-[0.62rem] font-black tracking-widest text-gold/80">{k}</div><div className="mt-1 text-[0.78rem] leading-6 opacity-85">{v}</div></Panel>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "voices" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VOICE_CAST.map((v, i) => (
            <Reveal key={v.id} delay={(i % 3) * 0.05}>
              <motion.div whileHover={{ y: -5 }}>
                <Panel className="group cursor-pointer p-4" >
                  <button className="w-full text-right" onClick={() => setOpen(v.id)}>
                    <div className="flex items-center gap-3">
                      <img src={posterUrl({ hue: v.hue, sat: 0.6, fa: v.fa, title: v.name }, v.id, 200, 200)} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2" style={{ borderColor: `hsl(${v.hue} 70% 60%)` }} />
                      <div className="min-w-0">
                        <div className="truncate font-black">{v.fa}</div>
                        <div className="truncate text-[0.66rem] font-mono opacity-55">{v.name}</div>
                        <div className="mt-0.5 truncate text-[0.68rem] text-gold/90">{v.role}</div>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 text-[0.74rem] leading-6 opacity-75">{v.bio}</p>
                    <div className="mt-2 flex flex-wrap gap-1">{v.roles.slice(0, 3).map(r => <span key={r} className="rounded bg-white/5 px-1.5 py-0.5 text-[0.6rem] opacity-75">{r}</span>)}</div>
                  </button>
                </Panel>
              </motion.div>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "studio" && (
        <div className="space-y-6">
          <Panel className="p-5">
            <h3 className="mb-3 font-black">🏛️ دیزنی تلویژن انیمیشن — از پیلوت تا پدیده</h3>
            <div className="relative pr-4">
              <div className="absolute inset-y-0 right-0 w-0.5 bg-gradient-to-b from-gold/10 via-gold/60 to-magic/30" />
              {STUDIO_HISTORY.map((h, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="relative mb-4">
                    <span className="absolute -right-[19px] top-1.5 h-3 w-3 rounded-full bg-gold ring-4 ring-[var(--bg)]" />
                    <div className="text-[0.66rem] font-black tracking-widest text-gold/80">{h.y}</div>
                    <div className="font-black">{h.t}</div>
                    <p className="text-[0.76rem] leading-6 opacity-75">{h.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Panel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CREW.map((c, i) => (
              <Reveal key={i} delay={i * 0.03}>
                <Panel hover className="p-4"><div className="text-[0.62rem] font-black tracking-widest text-magic2">{c.r}</div><div className="mt-1 font-black">{c.n}</div><p className="mt-1 text-[0.74rem] leading-6 opacity-75">{c.note}</p></Panel>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {tab === "awards" && (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            {AWARDS.map((a, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <Panel hover className="flex items-start gap-3 p-4">
                  <span className="title-crep grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/10 text-xl ring-1 ring-gold/30">🏆</span>
                  <div><div className="font-black">{a.t}</div><div className="text-[0.66rem] font-bold opacity-50">{a.y}</div><p className="mt-1 text-[0.76rem] leading-6 opacity-80">{a.d}</p></div>
                </Panel>
              </Reveal>
            ))}
          </div>
          <Panel className="p-5">
            <h3 className="mb-3 font-black">📊 کارنامۀ سریال در یک نگاه</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {SERIES_STATS.map((s, i) => (
                <Reveal key={i} delay={i * 0.02}>
                  <div className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10">
                    <div className="text-[0.62rem] font-black tracking-widest opacity-55">{s.k}</div>
                    <div className="mt-1 text-[0.85rem] font-black text-gold2 dark:text-gold">{s.v}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[["۱۰۰٪", "Rotten Tomatoes"], ["+۲۲۰K", "رأی IMDb"], ["+۸", "سال از پخش اولین قسمت"]].map(([n, l]) => (
                <div key={l} className="card p-3"><div className="title-crep text-2xl text-gold">{n}</div><div className="text-[0.62rem] opacity-60">{l}</div></div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === "talks" && (
        <div className="grid gap-3 md:grid-cols-2">
          {INTERVIEWS.map((iv, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <Panel hover className="p-4">
                <div className="mb-1.5 flex items-center justify-between"><span className="text-[0.66rem] font-black text-gold/90">{iv.who}</span>
                  <button className="opacity-60 hover:opacity-100" title="بشنو" onClick={() => speak(iv.what, VOICE_PRESETS[0])}>🔊</button></div>
                <p className="text-[0.8rem] leading-8 opacity-85">«{iv.what}»</p>
              </Panel>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "bts" && (
        <div className="grid gap-3 md:grid-cols-2">
          {BEHIND.map((b, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <Panel hover className="flex gap-3 p-4">
                <span className="title-crep shrink-0 text-3xl text-gold/50">{faNum(i + 1)}</span>
                <p className="text-[0.8rem] leading-8 opacity-85">{b}</p>
              </Panel>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "chars" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHARACTERS.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.04}>
              <Panel hover className="overflow-hidden">
                <div className="relative h-24 overflow-hidden">
                  <img src={charPoster(c, 420)} alt="" className="h-full w-full object-cover opacity-70" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[var(--bg2)] via-black/30 to-transparent" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-3xl drop-shadow">{c.emoji}</span>
                </div>
                <div className="p-4 pt-2">
                  <div className="flex items-baseline justify-between"><h4 className="font-black">{c.fa}</h4><span className="text-[0.6rem] font-mono opacity-45">{c.name}</span></div>
                  <div className="mt-0.5 text-[0.64rem] font-bold" style={{ color: c.color }}>{c.role}</div>
                  <p className="mt-1.5 line-clamp-3 text-[0.74rem] leading-6 opacity-75">{c.desc}</p>
                  {c.voice && <div className="mt-2 text-[0.64rem] opacity-60">🎙 {c.voice}</div>}
                  <button className="mt-2 chip !text-[0.62rem]" onClick={() => setChar(c.id)}>مشاهدهٔ کامل</button>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      )}

      <Modal open={!!char} onClose={() => setChar(null)}>
        {char && (() => {
          const c = CHARACTERS.find(x => x.id === char)!;
          return (
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-4xl">{c.emoji}</span>
                <div><h3 className="text-lg font-black">{c.fa}</h3><div className="text-[0.68rem] font-mono opacity-55">{c.name} — {c.role}</div></div>
              </div>
              <p className="text-[0.84rem] leading-8 opacity-90">{c.desc}</p>
              {c.quote && <div className="mt-2 rounded-xl border-r-4 border-gold/60 bg-gold/5 p-3 text-[0.78rem] italic">«{c.quote}»</div>}
              <div className="mt-2 grid gap-1 text-[0.72rem] opacity-80">
                <div>📺 اولین حضور: {c.first}</div>
                {c.voice && <div>🎙 صداپیشه: {c.voice}</div>}
                {c.powers && <div>⚡ abilities: {c.powers.join(" · ")}</div>}
              </div>
              {supported() && <button className="btn btn-magic mt-3 !py-1.5 !text-xs" onClick={() => speak(`${c.fa}. ${c.desc}`, VOICE_PRESETS[3])}>🗣 با صدای بیل بشنو</button>}
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!open} onClose={() => setOpen(null)} wide>
        {open && (() => {
          const v = VOICE_CAST.find(x => x.id === open)!;
          return (
            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <img src={posterUrl({ hue: v.hue, sat: 0.6, fa: v.fa, title: v.name }, v.id + "-big", 480, 600)} alt="" className="w-full rounded-2xl ring-1 ring-white/10" />
              <div>
                <h3 className="text-xl font-black">{v.fa}</h3>
                <div className="text-[0.7rem] font-mono opacity-55">{v.name} — {v.role}</div>
                {v.born && <div className="mt-1 text-[0.72rem] opacity-70">🎂 {v.born}</div>}
                <p className="mt-3 text-[0.84rem] leading-8 opacity-90">{v.bio}</p>
                {v.fun && <div className="mt-3 rounded-xl border-r-4 border-gold/60 bg-gold/5 p-3 text-[0.76rem] leading-7">✦ {v.fun}</div>}
                <div className="mt-3 flex flex-wrap gap-1">{v.roles.map(r => <span key={r} className="chip !cursor-default">{r}</span>)}</div>
                <div className="mt-3 flex gap-2">
                  {supported() && <button className="btn btn-magic !py-1.5 !text-xs" onClick={() => speak(v.bio, VOICE_PRESETS[1])}>🗣 با صدای میبل بشنو</button>}
                  <button className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs" onClick={() => share(v.fa, v.bio).then(r => toast.show(r === "shared" ? "اشتراک ✓" : "کپی ✓"))}>📤</button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
      {toast.node}
    </div>
  );
}
