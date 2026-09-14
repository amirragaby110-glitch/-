"use client";
// 📺 پخش‌خانۀ نکسوس — پلیرِ یکپارچه (یوتیوب/آپارات/ویمیو/دیلی‌موشن/فایل محلی) + پلی‌لیست + ادامهٔ پخش
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EPISODES } from "@/data/episodes";
import { charName } from "@/data/characters";
import { EMBEDS, aparatSearch, dailymotionSearch, providerOf, toEmbed, vimeoSearch, ytSearch, PROVIDER_LABEL } from "@/lib/links";
import { Panel, SectionTitle, Chip, useToast, Reveal } from "@/components/ui";
import { allEntries, addEntry, removeEntry } from "@/lib/db";
import { faNum, share } from "@/lib/utils";
import { speak, VOICE_PRESETS } from "@/lib/tts";

type Link = { id: number; ep: string; url: string };
const PROG_KEY = "gf-watch-progress";

function WatchInner() {
  const sp = useSearchParams();
  const toast = useToast();
  const [epKey, setEpKey] = useState<string>(sp.get("ep") ?? "1-1");
  const [links, setLinks] = useState<Link[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [embed, setEmbed] = useState<{ src: string; provider: string } | null>(null);
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [autoNext, setAutoNext] = useState(true);
  useEffect(() => { try { setAutoNext(localStorage.getItem("gf-autonext") !== "0"); } catch {} }, []);
  const [subs, setSubs] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [vUi, setVUi] = useState({ playing: false, t: 0, d: 0, vol: 1, rate: 1, fs: false });
  const watchStart = useRef(0);

  useEffect(() => { const k = sp.get("ep"); if (k) setEpKey(k); }, [sp]);
  useEffect(() => {
    allEntries("watchlink").then(es => setLinks(es.map(e => ({ id: e.id!, ep: (JSON.parse(e.meta || "{}")).ep ?? "", url: e.text }))))
      .catch(() => { });
  }, []);
  useEffect(() => { localStorage.setItem("gf-autonext", autoNext ? "1" : "0"); }, [autoNext]);

  const ep = useMemo(() => EPISODES.find(e => `${e.s}-${e.e}` === epKey) ?? EPISODES[0], [epKey]);
  const epLinks = useMemo(() => links.filter(l => l.ep === `${ep.s}-${ep.e}`), [links, ep]);
  const idx = EPISODES.findIndex(e => e.s === ep.s && e.e === ep.e);

  const openProvider = (u: string) => {
    const e = toEmbed(u);
    if (e) { setFileSrc(null); setEmbed({ src: e.embed, provider: e.provider }); toast.show(`پلیرِ ${PROVIDER_LABEL[e.provider as keyof typeof PROVIDER_LABEL]?.fa ?? "بیرونی"} باز شد`); }
    else toast.show("این لینک ساپورت نمی‌شود (فقط لینک ویدیو/فایل صوتی-تصویری)");
  };

  const selectEp = useCallback((k: string) => {
    setEpKey(k); setEmbed(null); setFileSrc(null);
    const all: Record<string, { secs: number; ts: number }> = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
    const rec = all[k];
    if (rec?.secs) toast.show(`ادامه از ${faNum(Math.round(rec.secs))} ثانیه (آخرین بازدید)`);
  }, [toast]);
  useEffect(() => {
    const e = EPISODES.find(x => `${x.s}-${x.e}` === epKey); if (!e) return;
    const all: Record<string, { secs: number; ts: number }> = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
    const rec = all[epKey];
    if (rec?.secs && embed) toast.show("محلِ توقفِ قبلی در این قسمت ثبت شده است");
  }, [epKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // تایمرِ «تماشاشده» برای ادامهٔ پخش + پخشِ خودکارِ بعدی (امبدِ کراس‌اورینتال قابل‌خواندن نیست)
  useEffect(() => {
    if (!embed && !fileSrc) return;
    watchStart.current = Date.now();
    const iv = setInterval(() => {
      const secs = Math.round((Date.now() - watchStart.current) / 1000);
      const all: Record<string, { secs: number; ts: number }> = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
      const cur = all[epKey]?.secs ?? 0;
      all[epKey] = { secs: Math.max(cur, fileSrc ? Math.floor(videoRef.current?.currentTime ?? cur) : cur + 5), ts: Date.now() };
      localStorage.setItem(PROG_KEY, JSON.stringify(all));
      if (autoNext && !fileSrc && embed && secs > 60 * 60) { /* بی‌صدا نگهبان؛ پخش بعدی با دکمه */ }
    }, 5000);
    return () => clearInterval(iv);
  }, [embed, fileSrc, epKey, autoNext]);

  const playNext = () => { if (idx < EPISODES.length - 1) selectEp(`${EPISODES[idx + 1].s}-${EPISODES[idx + 1].e}`); };
  const playPrev = () => { if (idx > 0) selectEp(`${EPISODES[idx - 1].s}-${EPISODES[idx - 1].e}`); };

  // کنترل‌های ویدیوی محلی
  useEffect(() => {
    if (!fileSrc) return;
    const v = videoRef.current!;
    const h = () => setVUi(s => ({ ...s, playing: !v.paused, t: v.currentTime, d: v.duration || 0, fs: !!document.fullscreenElement }));
    ["play", "pause", "timeupdate", "ended", "loadedmetadata"].forEach(e => v.addEventListener(e, h));
    const onEnd = () => { if (autoNext && idx < EPISODES.length - 1) { playNext(); toast.show("▶ قسمت بعدی به‌صورت خودکار پخش می‌شود"); } };
    v.addEventListener("ended", onEnd);
    return () => { ["play", "pause", "timeupdate", "ended", "loadedmetadata"].forEach(e => v.removeEventListener(e, h)); v.removeEventListener("ended", onEnd); };
  }, [fileSrc, autoNext]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextEp = idx < EPISODES.length - 1 ? EPISODES[idx + 1] : null;
  const prevEp = idx > 0 ? EPISODES[idx - 1] : null;
  const query = `${ep.ten} gravity falls episode ${ep.s}x${ep.e}`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionTitle kicker="PUBLIC ACCESS TV — NOW PLAYING" title="📺 پخش‌خانۀ آبشار جاذبه"
        sub="لینک‌های هواداری/آپاراتیِ خودتان را برای هر قسمت ثبت کنید، ویدیوِ محلی پخش کنید یا مستقیم به منابعِ رسمی سر بزنید — پلی‌لیستِ کامل ۴۰ قسمتی + ادامۀ پخش." />

      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <div>
          {/* پلیر */}
          <Panel className="relative overflow-hidden p-0">
            <div className="relative aspect-video bg-black/80">
              {embed && !embed.provider.startsWith("file") ? (
                <iframe key={embed.src} src={embed.src} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen title={ep.tfa} referrerPolicy="no-referrer-when-downgrade" />
              ) : fileSrc ? (
                <>
                  <video ref={videoRef} src={fileSrc} className="h-full w-full" onLoadedMetadata={e => (e.currentTarget as HTMLVideoElement).play().catch(() => { })} />
                  {subs && <div className="pointer-events-none absolute inset-x-0 bottom-16 text-center text-sm font-bold text-white drop-shadow-[0_2px_4px_#000]">{subs}</div>}
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-6 text-white">
                    <button className="text-lg" onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}>{vUi.playing ? "⏸" : "▶"}</button>
                    <button onClick={() => videoRef.current!.currentTime = Math.max(0, videoRef.current!.currentTime - 10)}>↺۱۰</button>
                    <button onClick={() => videoRef.current!.currentTime += 10}>۱۰↻</button>
                    <input type="range" min={0} max={vUi.d || 100} value={vUi.t} onChange={e => { if (videoRef.current) videoRef.current.currentTime = +e.target.value; }} className="h-1 flex-1 accent-[#e0b64f]" />
                    <span className="font-mono text-[0.65rem]">{fmt(vUi.t)}/{fmt(vUi.d)}</span>
                    <select className="rounded bg-white/10 px-1 text-[0.65rem]" value={vUi.rate} onChange={e => { vUi.rate = +e.target.value; if (videoRef.current) videoRef.current.playbackRate = vUi.rate; }}>
                      {[0.75, 1, 1.25, 1.5, 2].map(r => <option key={r} value={r}>{r}×</option>)}
                    </select>
                    <button onClick={async () => { const v = videoRef.current!; if (document.fullscreenElement) document.exitFullscreen(); else v.parentElement!.requestFullscreen?.(); }}>⛶</button>
                    <a href={fileSrc} download={`GF-${ep.s}x${ep.e}.mp4`} className="text-xs underline opacity-80 hover:opacity-100">⬇ دانلود</a>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <a className="absolute right-3 top-3 chip !text-[0.62rem]" target="_blank" rel="noreferrer" href={ytSearch(query)}>⬇ دانلود/تماشا از منبع ↗</a>
                  <div>
                    <div className="title-crep text-6xl opacity-30">📼</div>
                    <p className="mt-2 max-w-sm text-[0.75rem] leading-6 opacity-60">پلیری انتخاب نشده — از پلی‌لیست کنار، یا «لینک‌های این قسمت» یک منبعِ آپارات/یوتیوب/فایل انتخاب کنید، یا اول تریلرِ رسمی را ببینید:</p>
                    <button className="btn btn-gold mt-3 !text-xs" onClick={() => setEmbed({ src: EMBEDS.themeYt, provider: "youtube" })}>▶ تریلر/تمِ رسمی (یوتیوب)</button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3">
              <button className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs" onClick={playPrev} disabled={!prevEp}>⏮ {prevEp ? `س${prevEp.s}-ق${prevEp.e}` : "—"}</button>
              <button className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs" onClick={playNext} disabled={!nextEp}>{nextEp ? `س${nextEp.s}-ق${nextEp.e} ⏭` : "پایانِ تابستان"}</button>
              <Chip on={autoNext} onClick={() => setAutoNext(v => !v)}>⏩ پخش خودکارِ بعدی</Chip>
              <span className="mr-auto truncate text-[0.7rem] font-bold opacity-75">{ep.s}.{ep.e} — {ep.tfa}</span>
            </div>
          </Panel>

          {/* اطلاعات قسمت + منابع */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Panel className="p-4">
              <h3 className="mb-1 text-sm font-black">{ep.tfa} <span className="font-mono text-[0.62rem] opacity-50">S{ep.s}E{ep.e}</span></h3>
              <p className="text-[0.75rem] leading-7 opacity-80">{ep.sum}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-[0.62rem] opacity-70">
                {ep.chars.map(c => <span key={c} className="rounded bg-white/5 px-1.5 py-0.5">{charName(c)}</span>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <a className="chip" target="_blank" rel="noreferrer" href={ytSearch(query + " فارسی")}>🔎 یوتیوبِ فارسی</a>
                <a className="chip" target="_blank" rel="noreferrer" href={ytSearch(query)}>▶ یوتیوب</a>
                <a className="chip" target="_blank" rel="noreferrer" href={aparatSearch(`گرانش فالز س${ep.s} ق${ep.e} ${ep.tfa}`)}>🟠 آپارات</a>
                <a className="chip" target="_blank" rel="noreferrer" href={vimeoSearch(query)}>🎞️ ویمیو</a>
                <a className="chip" target="_blank" rel="noreferrer" href={dailymotionSearch(query)}>🌀 دیلی‌موشن</a>
                <button className="chip" onClick={() => { const p = VOICE_PRESETS[0]; speak(`${ep.tfa}. ${ep.sum}`, p); toast.show("🗣 روایتِ صوتیِ خلاصه"); }}>🗣 خلاصه‌خوانی</button>
              </div>
            </Panel>
            <Panel className="p-4">
              <h3 className="mb-2 text-sm font-black">🔗 لینک‌های این قسمت (هواداری)</h3>
              <div className="mb-2 flex gap-1.5">
                <input className="input !py-1.5 !text-xs" dir="ltr" placeholder="https://www.aparat.com/v/xxxx یا لینک مستقیم فایل" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                <button className="btn btn-gold !py-1.5 !text-xs shrink-0" disabled={!newUrl.trim()} onClick={async () => {
                  const p = toEmbed(newUrl) || providerOf(newUrl) !== "unknown";
                  if (!p) { toast.show("لینک نامعتبر است"); return; }
                  await addEntry({ type: "watchlink", title: `S${ep.s}E${ep.e}`, text: newUrl.trim(), cat: "watchlink", tags: `${ep.s}-${ep.e}`, meta: JSON.stringify({ ep: `${ep.s}-${ep.e}` }), author: "شما" });
                  setLinks(await allEntries("watchlink").then(es => es.map(e => ({ id: e.id!, ep: (JSON.parse(e.meta || "{}")).ep ?? "", url: e.text }))));
                  openProvider(newUrl.trim()); setNewUrl("");
                }}>ثبت + پخش</button>
              </div>
              {epLinks.map(l => (
                <div key={l.id} className="mb-1.5 flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-1.5 text-[0.72rem]">
                  <span>{PROVIDER_LABEL[providerOf(l.url) as keyof typeof PROVIDER_LABEL]?.emoji}</span>
                  <button className="min-w-0 flex-1 truncate text-right font-bold hover:text-gold" onClick={() => openProvider(l.url)}>{l.url}</button>
                  <button className="opacity-40 hover:text-blood" onClick={async () => { removeEntry(l.id); setLinks(links.filter(x => x.id !== l.id)); }}>✕</button>
                </div>
              ))}
              {!epLinks.length && <p className="text-[0.68rem] opacity-50">هنوز لینکی برای این قسمت ثبت نشده. یک لینکِ آپارات/یوتیوب بچسبانید تا همین‌جا پخش شود.</p>}
              <div className="mt-2 border-t border-white/10 pt-2">
                <label className="btn btn-ghost ring-1 ring-white/10 !py-1.5 !text-xs">
                  📁 فایلِ ویدیویی از دستگاه
                  <input type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setEmbed(null); setFileSrc(URL.createObjectURL(f)); toast.show("پخش محلی — کنترل‌ها پایینِ پلیر"); } }} />
                </label>
                <span className="mr-2 text-[0.62rem] opacity-50">فایل آپلود نمی‌شود.</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input className="input !py-1.5 !text-xs" placeholder="متن زیرنویس فارسیِ دلخواه (روی ویدیوی محلی نمایش داده می‌شود)" value={subs} onChange={e => setSubs(e.target.value)} />
              </div>
            </Panel>
          </div>
        </div>

        {/* پلی‌لیست */}
        <Panel className="order-first max-h-[70vh] overflow-auto p-3 xl:order-none">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-black">🎞 پلی‌لیستِ ۴۰ قسمتی</h3>
            <span className="text-[0.62rem] opacity-50">{faNum(EPISODES.length)} قسمت</span>
          </div>
          <div className="space-y-1">
            {EPISODES.map(e => {
              const k = `${e.s}-${e.e}`;
              const active = k === epKey;
              const prog = (typeof window === "undefined" ? {} : JSON.parse(localStorage.getItem(PROG_KEY) || "{}"))[k]?.secs;
              return (
                <button key={k} onClick={() => selectEp(k)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-right text-[0.74rem] transition ${active ? "bg-gold/15 ring-1 ring-gold/40" : "hover:bg-white/5"}`}>
                  <span className="font-mono text-[0.6rem] opacity-50">{k}</span>
                  <span className="min-w-0 flex-1 truncate font-bold">{e.tfa}</span>
                  {prog ? <span className="text-[0.56rem] text-forest2 dark:text-pine" title={`${prog} ثانیه دیده شده`}>▶ {Math.min(100, Math.round(prog / 20))}%</span> : <span className="text-[0.58rem] opacity-30">جدید</span>}
                  {e.arc && <span className="text-gold">★</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3 rounded-xl bg-magic/10 p-3 text-[0.66rem] leading-6 opacity-80 ring-1 ring-magic/25">
            💡 نکته: نسخهٔ کاملِ سریال را شبکهٔ دیزنی دارد؛ این پلیر برای لینک‌هایِ هواداری، تریلرها، دوبله‌هایِ فارسیِ موجود در آپارات و فایل‌های شخصیِ شماست.
          </div>
        </Panel>
      </div>
      {toast.node}
    </div>
  );
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export default function WatchPage() { return <Suspense fallback={<div className="p-10 text-center opacity-60">در حال کوک کردن نوار کاست…</div>}><WatchInner /></Suspense>; }
