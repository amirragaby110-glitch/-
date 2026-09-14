"use client";
// 🎵 مرکزِ موسیکِ آبشارِ جاذبه — موتورِ نکسوس‌سوند + ویژوالایزر + WAV + بیرونی
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TRACKS } from "@/data/tracks";
import type { TrackDef } from "@/data/types";
import { player, fmtTime } from "@/lib/player";
import { audioBufferToWav, download, share, faNum } from "@/lib/utils";
import { useMusic, useSettings } from "@/lib/store";
import Visualizer from "@/components/music/Visualizer";
import Waveform from "@/components/music/Waveform";
import { Panel, SectionTitle, Chip, useToast, FavBtn, Modal } from "@/components/ui";
import { posterUrl } from "@/lib/poster";
import { sfx } from "@/components/Shell";
import { toEmbed, ytSearch, soundcloud, aparatSearch } from "@/lib/links";
import { GnomeSpot } from "@/components/GnomeHunt";

const hueOf = (t: TrackDef) => (t.root * 9 + t.bpm) % 360;

type UserTrack = { id: string; title: string; url: string; kind: "file" | "url" };
const loadUser = (): UserTrack[] => { try { return JSON.parse(localStorage.getItem("gf-user-tracks") || "[]"); } catch { return []; } };

function MusicInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { current, setCurrent, shuffle, repeat, toggle, cycleRepeat, setEmbed, embedFor } = useMusic();
  const volume = useSettings(s => s.musicVolume);
  const setS = useSettings(s => s.set);
  const toast = useToast();
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [rendering, setRendering] = useState(false);
  const [tab, setTab] = useState<"list" | "add" | "ext">("list");
  const [users, setUsers] = useState<UserTrack[]>([]);
  const [extQ, setExtQ] = useState("");
  const [fileBusy, setFileBusy] = useState(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const track = useMemo(() => TRACKS.find(t => t.id === current) ?? TRACKS[0], [current]);
  const ids = TRACKS.map(t => t.id);

  useEffect(() => setUsers(loadUser()), []);
  useEffect(() => {
    const p = sp.get("play");
    if (p && TRACKS.some(t => t.id === p)) setCurrent(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const play = useCallback(async (def: TrackDef) => {
    sfx("open");
    try {
      setRendering(true);
      await player.playDef(def);
      setPeaks(player.getPeaks(def.id));
      setDur(player.duration);
    } catch (e) { console.error(e); toast.show("مرورگرِ شما اجازهٔ پخش نداد — یک بار کلیک کنید ✋"); }
    setRendering(false);
  }, [toast]);

  // sync with store changes
  useEffect(() => {
    player.onEnded = () => {
      if (repeat === "one") { player.seek(0); player.resume(); }
      else {
        const idx = ids.indexOf(current);
        if (idx === ids.length - 1 && repeat === "off") return;
        next();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, repeat, shuffle]);

  const next = () => { setCurrent(ids[(ids.indexOf(current) + 1) % ids.length]); };
  useEffect(() => { if (player.currentId !== current) play(track); }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      player.tick();
      setProgress(player.progress); setTime(player.time());
      if (!dur && player.duration) setDur(player.duration);
    };
    loop(); return () => cancelAnimationFrame(raf);
  }, [dur]);
  useEffect(() => { player.setVolume(volume); }, [volume]);

  const playUser = async (u: UserTrack) => {
    sfx("open");
    player.pause();
    const el = audioElRef.current!;
    el.src = u.url; setCurrent("user:" + u.id);
    try { await player.playElement(el, u.url); setDur(el.duration || 0); toast.show("پخش از فایل/لینک شما 🎶"); } catch { toast.show("این لینک قابل پخش مستقیم نیست (CORS)"); }
  };
  const onFile = async (f: File) => {
    setFileBusy(true);
    const url = URL.createObjectURL(f);
    const list = [...loadUser(), { id: "u" + Date.now(), title: f.name.replace(/\.[^.]+$/, ""), url, kind: "file" as const }];
    localStorage.setItem("gf-user-tracks", JSON.stringify(list.filter(x => x.kind !== "file"))); // فایل محلی ماندگار نیست
    setUsers(list);
    await playUser(list[list.length - 1]);
    setFileBusy(false);
  };
  const addUrl = (title: string, url: string) => {
    const list = [...loadUser(), { id: "u" + Date.now(), title: title || url.slice(0, 24), url, kind: "url" as const }];
    localStorage.setItem("gf-user-tracks", JSON.stringify(list)); setUsers(list);
    toast.show("به پلی‌لیستِ شخصی اضافه شد ✓");
  };

  const seekPct = (p: number) => { player.seek(p * (dur || player.duration)); };
  const doDownload = async () => {
    toast.show("در حال رندرِ WAV… (چند ثانیه)");
    try {
      const buf = await player.prepare(track);
      download(audioBufferToWav(buf), `GF-Nexus-${track.id}.wav`);
      toast.show("دانلود شروع شد ✓");
    } catch { toast.show("خطا در رندر"); }
  };
  const embed = embedFor ? TRACKS.find(t => t.id === embedFor) : null;
  const isUser = current.startsWith("user:");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <GnomeSpot i={2} hue={30} />
      <audio ref={audioElRef} className="hidden" onEnded={() => { if (repeat === "all") { const us = users; if (us.length) playUser(us[(us.findIndex(u => "user:" + u.id === current) + 1) % us.length]); } }} />
      <SectionTitle kicker="SEASON OF SOUND" title="🎵 مرکزِ موسیقی"
        sub={`${faNum(TRACKS.length)} بازسازیِ سینتی‌سایزریِ آهنگ‌های گرانش فالز — تم اصلی، سویینگِ بیل، راکِ سوس، دیسکوی میبل و لالاییِ گیدئون. بدونِ فایل، بدونِ کپی‌رایت؛ ساختهٔ مرورگرِ شما.`} />

      {/* دک */}
      <Panel className="relative overflow-hidden p-4 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-magic/15 blur-3xl" />
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="relative mx-auto w-56 lg:mx-0">
            <motion.img key={track.id} src={posterUrl({ hue: hueOf(track), sat: 0.7, fa: track.title, title: track.artist }, track.id, 420, 420)}
              initial={{ rotate: -3, scale: 0.92, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }}
              className="aspect-square w-full rounded-2xl object-cover shadow-2xl ring-1 ring-gold/30" alt="" />
            <div className={`absolute inset-0 rounded-2xl ring-2 ${player.playing ? "animate-pulse ring-gold/50" : "ring-transparent"}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[0.65rem] font-black tracking-[0.35em] text-gold/80">{isUser ? "USER TAPE" : "NEXUS SYNTH ENGINE"}</div>
                <h2 className="title-creep mt-1 truncate text-2xl text-gold2">{isUser ? current.replace("user:", "") : track.title}</h2>
                <div className="truncate text-xs opacity-60">{isUser ? "نوارِ کاستِ شما" : `${track.artist} · ${faNum(track.bpm)} BPM · ${track.bars} میزان · سبک: ${track.style}`}</div>
                <p className="mt-2 line-clamp-2 text-[0.78rem] leading-6 opacity-70">{isUser ? "پخش از فایلِ محلی/لینک." : track.note}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <FavBtn k={`track:${track.id}`} className="!text-xl" />
                <button className="btn btn-ghost !px-2.5" title="اشتراک" onClick={async () => { const r = await share(track.title, track.note); toast.show(r === "shared" ? "به اشتراک گذاشته شد" : "کپی شد ✓"); }}>📤</button>
              </div>
            </div>

            <div className="mt-4"><Waveform peaks={peaks} progress={progress} onSeek={isUser ? undefined : seekPct} /></div>
            <div className="mt-1 flex justify-between font-mono text-[0.7rem] opacity-70">
              <span>{fmtTime(time)}</span>
              <span className={rendering ? "animate-pulse text-magic2" : ""}>{rendering ? "رندرِ موتور صوتی…" : fmtTime(Math.max(0, dur - time))}</span>
            </div>

            {/* کنترل‌ها */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button className="btn btn-ghost !px-3 ring-1 ring-white/10" title="قبلی" onClick={() => { useMusic.getState().prev(ids); }}>⏮</button>
              <button className="btn btn-gold !h-12 !w-12 !p-0 text-xl shadow-[0_0_30px_-6px_#e0b64f]"
                onClick={() => { if (isUser) { const el = audioElRef.current!; player.playing ? el.pause() : el.play(); } else play(track); }}>
                {rendering ? "…" : player.playing ? "⏸" : "▶"}
              </button>
              <button className="btn btn-ghost !px-3 ring-1 ring-white/10" title="بعدی" onClick={next}>⏭</button>
              <Chip on={shuffle} onClick={() => { toggle("shuffle"); toast.show(shuffle ? "شافل خاموش" : "شافل روشن 🔀"); }}>🔀</Chip>
              <Chip on={repeat !== "off"} onClick={cycleRepeat} title="حالت تکرار">{repeat === "one" ? "🔂" : "🔁"}</Chip>
              <div className="flex items-center gap-2">
                <span className="text-xs">🔉</span>
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setS({ musicVolume: +e.target.value })} className="w-24" />
              </div>
              <div className="mr-auto flex gap-2">
                {!isUser && <>
                  <button className="btn btn-ghost !py-1.5 !text-xs ring-1 ring-gold/40 hover:bg-gold/10" onClick={doDownload}>⬇️ دانلود WAV</button>
                  {track.embed && <button className="btn btn-ghost !py-1.5 !text-xs ring-1 ring-white/10" onClick={() => setEmbed(track.id)}>🖥 ویدیو</button>}
                </>}
                {isUser && <button className="btn btn-ghost !py-1.5 !text-xs ring-1 ring-white/10" onClick={() => setCurrent("theme")}>بازگشت به نکسوس‌سوند</button>}
              </div>
            </div>
            <Visualizer height={140} />
          </div>
        </div>
      </Panel>

      {/* تب‌ها */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Chip on={tab === "list"} onClick={() => setTab("list")}>♪ پلی‌لیستِ نکسوس ({faNum(TRACKS.length)})</Chip>
        <Chip on={tab === "add"} onClick={() => setTab("add")}>➕ افزودن آهنگِ شما ({faNum(users.length)})</Chip>
        <Chip on={tab === "ext"} onClick={() => setTab("ext")}>🌐 پخشِ بیرونی (یوتیوب/سوندکلاد/آپارات)</Chip>
      </div>

      {tab === "list" && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {TRACKS.map((t, i) => (
            <motion.button whileHover={{ scale: 1.008 }} key={t.id} onClick={() => { setCurrent(t.id); if (player.currentId !== t.id) play(t); }}
              className={`card glass flex items-center gap-3 p-3 text-right transition ${current === t.id ? "ring-2 ring-gold/60" : "hover:ring-1 hover:ring-white/15"}`}>
              <img src={posterUrl({ hue: hueOf(t), sat: 0.65, fa: t.title, title: t.artist }, t.id, 96, 96)} alt="" className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-white/10" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.62rem] opacity-50">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate text-sm font-black">{t.title}</span>
                </div>
                <div className="truncate text-[0.68rem] opacity-60">{t.artist} · {faNum(t.bpm)}BPM · {faNum(Math.round((t.bars * (t.timeSig ?? 4) * 60 / t.bpm) / 60 * 10) / 10)} دقیقه</div>
              </div>
              {current === t.id && player.playing && (
                <div className="flex h-5 items-end gap-[3px]" aria-hidden>
                  {[0, 1, 2].map(n => <motion.span key={n} className="w-[4px] rounded bg-gold" animate={{ height: ["30%", "100%", "45%"] }} transition={{ repeat: Infinity, duration: 0.7 + n * 0.22 }} />)}
                </div>
              )}
              {current === t.id && !player.playing && <span className="text-xs opacity-50">متوقف</span>}
            </motion.button>
          ))}
        </div>
      )}

      {tab === "add" && (
        <Panel className="mt-4 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-black">📁 فایلِ صوتی از دستگاه</h3>
              <p className="mb-3 text-[0.72rem] leading-6 opacity-60">MP3/OGG/WAV را انتخاب کنید؛ مستقیم در همین مرورگر پخش می‌شود (آپلود نمی‌شود) و به ویژوالایزر وصل است.</p>
              <label className={`btn btn-magic ${fileBusy ? "pointer-events-none opacity-60" : ""}`}>
                {fileBusy ? "…" : "انتخاب فایل"}
                <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
              </label>
            </div>
            <div>
              <h3 className="mb-2 font-black">🔗 از لینکِ مستقیم</h3>
              <AddUrl onAdd={addUrl} />
            </div>
          </div>
          {users.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 text-[0.72rem] font-black opacity-70">نوارهایِ شما</div>
              {users.map(u => (
                <div key={u.id} className="mb-1.5 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                  <button className="min-w-0 flex-1 text-right text-sm font-bold" onClick={() => playUser(u)}><span className="truncate block">{u.title}</span></button>
                  <span className="chip !cursor-default !text-[0.6rem]">{u.kind === "file" ? "محلی" : "لینک"}</span>
                  <button onClick={() => { const l = loadUser().filter(x => x.id !== u.id); localStorage.setItem("gf-user-tracks", JSON.stringify(l)); setUsers(l); }} className="opacity-50 hover:text-blood hover:opacity-100">✕</button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === "ext" && (
        <Panel className="mt-4 p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input value={extQ} onChange={e => setExtQ(e.target.value)} placeholder="جستجو… مثلاً «Gravity Falls theme song»" className="input max-w-md" />
            <a className="btn btn-gold !py-2 !text-xs" target="_blank" rel="noreferrer" href={ytSearch(extQ || "Gravity Falls songs")}>▶ یوتیوب</a>
            <a className="btn btn-ghost !py-2 !text-xs ring-1 ring-white/10" target="_blank" rel="noreferrer" href={soundcloud(extQ || "gravity falls ost")}>☁ سوندکلاد</a>
            <a className="btn btn-ghost !py-2 !text-xs ring-1 ring-white/10" target="_blank" rel="noreferrer" href={aparatSearch(extQ || "گرانش فالز آهنگ")}>🟠 آپارات</a>
          </div>
          <p className="text-[0.72rem] leading-6 opacity-60">
            آلبومِ رسمیِ «Gravity Falls (Original Soundtrack)» از ژانویۀ ۲۰۲۴ در تمام استریم‌ها موجود است — جستجو کنید و لینکِ ویدیو/پلی‌لیست را به اشتراک بگذارید. برای پخشِ جاسازی‌شده، لینکِ یوتیوب یا آپارات را در «افزودن آهنگ → لینک» ثبت کنید.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TRACKS.flatMap(t => (t.embed ?? []).map((e, i) => ({ ...e, track: t, key: t.id + i }))).map(e => (
              <div key={e.key} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                <div className="min-w-0 text-sm"><span className="block truncate font-bold">{e.label}</span><span className="truncate text-[0.66rem] opacity-50">{e.track.title}</span></div>
                <button className="btn btn-ghost !py-1 !text-xs ring-1 ring-gold/40" onClick={() => setEmbed(e.track.id)}>پخش 🖥</button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* مودالِ امبد */}
      <Modal wide open={!!embed} onClose={() => setEmbed(null)}>
        {embed && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black">🖥 {embed.title}</h3>
              <button className="btn btn-ghost !p-1.5" onClick={() => setEmbed(null)}>✕</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {embed.embed?.map((e, i) => (
                <div key={i} className="overflow-hidden rounded-2xl bg-black/40">
                  {e.type === "youtube" || e.type === "soundcloud" ? (
                    <div className="aspect-video">
                      <iframe className="h-full w-full" src={e.src} title={e.label} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                  ) : (
                    <div className="grid aspect-video place-items-center p-6 text-center text-sm opacity-75">
                      <div><div className="mb-2 text-4xl">🟠</div>این منبع درون‌صفحه‌ای باز نمی‌شود؛ با کلیک، در تب جدید باز می‌شود.</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-3 py-2 text-[0.7rem]">
                    <span className="opacity-70">{e.label}</span>
                    <a className="opacity-60 hover:text-gold" target="_blank" rel="noreferrer" href={e.src}>در پنجرهٔ جدید ↗</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}

function AddUrl({ onAdd }: { onAdd: (t: string, u: string) => void }) {
  const [t, setT] = useState(""); const [u, setU] = useState("");
  return (
    <div className="flex flex-wrap gap-2">
      <input value={t} onChange={e => setT(e.target.value)} placeholder="عنوان (اختیاری)" className="input !w-auto flex-1" />
      <input value={u} onChange={e => setU(e.target.value)} placeholder="https://…/song.mp3" className="input !w-auto flex-1" dir="ltr" />
      <button className="btn btn-gold !py-2" disabled={!u} onClick={() => { if (toEmbed(u) || /\.(mp3|ogg|wav|flac|m4a)/i.test(u)) { onAdd(t, u); setU(""); setT(""); } }}>ثبت</button>
    </div>
  );
}

export default function MusicPage() {
  return <Suspense fallback={<div className="p-10 text-center opacity-60">در حال کوک کردنِ جعبه‌موسیقی…</div>}><MusicInner /></Suspense>;
}
