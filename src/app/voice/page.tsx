"use client";
// 🗣 آزمایشگاهِ صدا — Web Speech API با پریستِ هر شخصیت + لیپ‌سینک + کلیپ‌ها
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Panel, SectionTitle, Chip, useToast } from "@/components/ui";
import { speak, stopSpeak, supported, onSpeak, loadClips, saveClips, VOICE_PRESETS, type Clip, type SpeakState } from "@/lib/tts";
import { bumpCounter } from "@/lib/progress";
import { GnomeSpot } from "@/components/GnomeHunt";
import { TRACKS } from "@/data/tracks";
import { player } from "@/lib/player";
import { copyText, download, faNum, share } from "@/lib/utils";
import { sfx } from "@/components/Shell";

const DEMOS: Record<string, string> = {
  dipper: "ژورنال باز شد… چیزی توی این شهر نفس می‌کشه و با خودکار نوشته شده: «به ژورنال اعتماد کن».",
  mabel: "ژاکت جدید، چنگکِ براق، و یه نقشهٔ دزدی از مغازهٔ سوغاتی! تابستان باید تا آخرین ثانیه برق بزنه!",
  stan: "کالا نو، قیمت آتش! خرید کن یا گریه کن… باشه باشه، تخفیفِ ویژهٔ خانواده — ولی فقط همین امشب!",
  bill: "هی بچه‌ها! منم، اون مثلثی که تو رؤیای باباتون نشسته. یه معامله؟ قول میدم ارزشش رو داشت… مثل همهٔ کابوس‌های قشنگ.",
  soos: "برادر… هر چیزی که خراب شده با چسبِ نقره‌ای درست می‌شه. حتی اگه اون چیزی حافظهٔ خودت باشه.",
  wendy: "اوه، هیپسترِ کوچولو. اگه دنبالِ ماجراجویی، پارکینگ پشتِ کلبه، ساعت دوازده. دیر نیا.",
  ford: "شش معجزهٔ گرانش فالز رو با چشمای خودم دیدم؛ هفتمی رو نمی‌تونم بگم. هنوز.",
  gideon: "من، گیدئون گلیفل، از این لحظه فرمانروایِ این شهرم. و شما؟ به صفِ هواداران اضافه بشید… لطفاً.",
};

export default function VoicePage() {
  const ok = supported();
  const [preset, setPreset] = useState(VOICE_PRESETS[0]);
  const [text, setText] = useState(DEMOS[VOICE_PRESETS[0].id] ?? "");
  const [pitch, setPitch] = useState(VOICE_PRESETS[0].pitch);
  const [rate, setRate] = useState(VOICE_PRESETS[0].rate);
  const [vol, setVol] = useState(1);
  const [st, setSt] = useState<SpeakState | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const toast = useToast();
  useEffect(() => { setText(DEMOS[preset.id] ?? ""); setPitch(preset.pitch); setRate(preset.rate); }, [preset]);
  useEffect(() => onSpeak(setSt) as any, []);
  useEffect(() => setClips(loadClips()), []);

  if (!ok) return (
    <div className="mx-auto max-w-3xl p-10 text-center">
      <Panel className="p-8"><div className="text-4xl">🔇</div>
        <h2 className="mt-2 font-black">متأسفانه مرورگرِ شما Web Speech API ندارد</h2>
        <p className="mt-2 text-sm opacity-70">کروم، سافاری یا اجِ جدید را امتحان کنید — روی اندروید هم Chrome فارسی/انگلیسی کار می‌کند.</p></Panel>
    </div>
  );

  const doSpeak = () => { sfx("open"); stopSpeak(); setTimeout(() => speak(text, { ...preset, pitch, rate }), 60); };
  const speakTheme = () => {
    const t = TRACKS.find(x => x.id === "theme")!;
    stopSpeak();
    speak("آماده باشید! تابستان در گرانش فالز آغاز می‌شود؛ حالا گوش بسپارید به بازسازیِ تمِ اصلی:", preset);
    setTimeout(() => player.playDef(t), 2800);
    toast.show("🎞 اینترو + پخشِ تم…");
  };
  const saveClip = () => {
    const c: Clip = { id: "c" + Date.now(), text, preset: preset.id, pitch, rate, createdAt: Date.now() };
    const n = [c, ...clips].slice(0, 40); setClips(n); saveClips(n); bumpCounter("clips", 1, "🗣 کلیپِ تازه ذخیره شد", 4);
    toast.show("کلیپ در کتابخانۀ محلی ذخیره شد ✓");
  };

  const mouth = st?.speaking ? st.mouth : 0;
  const pct = st && st.total ? Math.round((st.char / st.total) * 100) : 0;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <GnomeSpot i={6} hue={280} />
      <SectionTitle kicker="THE VOICE LAB — B-613 ACOUSTICS DIVISION" title="🗣 آزمایشگاهِ صدایِ شخصیت‌ها"
        sub="متنِ دلخواه (فارسی یا انگلیسی) را بنویسید، شخصیت را انتخاب کنید و با تنظیم پیچ/سرعت/بلندی، «لیپ‌سینک» زنده را روی صورتش تماشا کنید. همه‌چیز رایگان، درونِ مرورگر." />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {VOICE_PRESETS.map(p => (
              <button key={p.id} onClick={() => { setPreset(p); sfx(); }} className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-[0.66rem] font-black transition ${preset.id === p.id ? "scale-105 ring-2" : "opacity-70 hover:opacity-100 ring-1 ring-white/10"}`}
                style={preset.id === p.id ? { background: p.color + "22", boxShadow: `0 0 24px -8px ${p.color}` } : undefined}>
                <span className="text-2xl">{p.emoji}</span>{p.fa}
              </button>
            ))}
          </div>

          <Panel className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-black">🎭 صورتِ گویا</h3>
              <span className="text-[0.62rem] font-mono opacity-50">{st?.speaking ? `speaking ${pct}%` : "idle"}</span>
            </div>
            <div className="flex items-center gap-5">
              <svg viewBox="0 0 120 130" className="h-32 w-32 shrink-0">
                <circle cx="60" cy="55" r="40" fill={preset.color + "33"} stroke={preset.color} strokeWidth="3" />
                {st?.speaking && <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8 }}><path d="M32 48 L44 50 M88 48 L76 50" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" /></motion.g>}
                <circle cx="47" cy="50" r={4 + mouth * 2} fill="#101018" />
                <circle cx="73" cy="50" r={4 + mouth * 2} fill="#101018" />
                <ellipse cx="60" cy={74} rx={10 + mouth * 8} ry={2 + mouth * 9} fill="#14141c" stroke={preset.color} strokeWidth="2" />
                {preset.id === "bill" && <polygon points="60,4 72,26 48,26" fill="#e0b64f" />}
                {preset.id === "stan" && <><rect x="26" y="14" width="68" height="10" rx="4" fill="#0e0e14" /><rect x="44" y="6" width="32" height="12" rx="4" fill="#0e0e14" /></>}
                {preset.id === "mabel" && <><circle cx="38" cy="18" r="5" fill="#ff5fa2" /><circle cx="82" cy="18" r="5" fill="#ff5fa2" /></>}
                {preset.id === "dipper" && <path d="M24 30 Q60 6 96 30" stroke="#3f6f3f" strokeWidth="8" fill="none" strokeLinecap="round" />}
              </svg>
              <div className="min-w-0 flex-1">
                <textarea value={text} onChange={e => setText(e.target.value)} rows={5} maxLength={2200}
                  className="input text-sm leading-7" placeholder="هر چیزی بنویس… (فارسی/انگلیسی)" />
                <div className="mt-1 text-[0.62rem] opacity-45">{faNum(text.length)} کاراکتر · حداکثر ۲۲۰۰ · برای متن‌های بلند، TTS را تکه‌تکه کنید</div>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {([["پیچ (زیر/زیری)", pitch, setPitch, 0.1, 2, 0.01], ["سرعت", rate, setRate, 0.5, 1.8, 0.01], ["بلندی", vol, setVol, 0, 1, 0.01]] as const).map(([l, v, set, a, b, s]) => (
                <label key={l} className="text-[0.68rem] font-bold opacity-80">{l}
                  <input type="range" min={a} max={b} step={s} value={v} onChange={e => set(+e.target.value)} className="mt-1 w-full" /></label>
              ))}
            </div>
            {st?.speaking && <div className="mt-2 h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-gradient-to-l from-gold to-magic transition-all" style={{ width: `${pct}%` }} /></div>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-gold" onClick={st?.speaking ? stopSpeak : doSpeak}>{st?.speaking ? "⏹ توقف" : `▶ پخش با صدای ${preset.fa}`}</button>
              <button className="btn btn-ghost ring-1 ring-white/10 !text-xs" onClick={() => { const p = { ...preset, pitch: Math.min(2, pitch + 0.3), rate: Math.min(2, rate + 0.5) }; speak("این نسخهٔ «کوک‌نشدهٔ» منم!", p); }}>👻 نسخهٔ بیل‌زده</button>
              <button className="btn btn-magic !text-xs" onClick={speakTheme}>🎞 اینتروی سریال + تم</button>
              <button className="btn btn-ghost ring-1 ring-white/10 !text-xs" onClick={saveClip}>💾 ذخیره در کلیپ‌ها</button>
              <button className="btn btn-ghost ring-1 ring-white/10 !text-xs" onClick={() => copyText(text)}>📋 کپی متن</button>
              <button className="btn btn-ghost ring-1 ring-white/10 !text-xs" onClick={() => share("صدای " + preset.fa, text).then(r => toast.show(r === "shared" ? "اشتراک ✓" : "کپی ✓"))}>📤 اشتراک</button>
            </div>
            <p className="mt-2 text-[0.62rem] leading-5 opacity-50">
              نکتهٔ فنی: Web Speech API خروجیِ فایل نمی‌دهد (محدودیتِ مرورگر)؛ به‌جایش «کلیپ» = متن + تنظیمات ذخیره می‌شود و با یک کلیک دوباره پخش می‌گردد. برای فایلِ صوتی واقعی، از ضبط‌صفحهٔ سیستم استفاده کنید. آواز نمی‌خوانیم — اما «پیت‌کولای کورال» در صف است!
            </p>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel className="p-4">
            <h3 className="mb-2 text-sm font-black">🧾 شرحِ شخصیتِ صوتی</h3>
            <div className="flex items-center gap-2 text-lg">{preset.emoji} <b>{preset.fa}</b></div>
            <p className="mt-1 text-[0.74rem] leading-6 opacity-75">{preset.desc}</p>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[0.64rem] font-mono opacity-60">
              <span>pitch: {pitch.toFixed(2)}</span><span>rate: {rate.toFixed(2)}</span>
              <span>lang: {preset.lang}</span><span>hint: {preset.hint}</span>
            </div>
          </Panel>
          <Panel className="p-4">
            <h3 className="mb-2 flex items-center justify-between text-sm font-black">💾 کتابخانۀ کلیپ‌ها <span className="text-[0.6rem] opacity-50">{faNum(clips.length)}/۴۰</span></h3>
            {!clips.length && <p className="text-[0.7rem] opacity-50">هنوز چیزی ذخیره نکرده‌اید.</p>}
            {clips.map(c => {
              const p = VOICE_PRESETS.find(x => x.id === c.preset) ?? preset;
              return (
                <div key={c.id} className="mb-1.5 rounded-xl bg-white/5 p-2">
                  <div className="flex items-center justify-between text-[0.62rem] opacity-60"><span>{p.emoji} {p.fa}</span>
                    <span className="flex gap-1">
                      <button className="hover:text-gold" onClick={() => { stopSpeak(); setTimeout(() => speak(c.text, { ...p, pitch: c.pitch, rate: c.rate }), 40); }}>▶</button>
                      <button className="hover:text-blood" onClick={() => { const n = clips.filter(x => x.id !== c.id); setClips(n); saveClips(n); }}>✕</button>
                    </span></div>
                  <div className="line-clamp-2 text-[0.72rem] leading-6">{c.text}</div>
                </div>
              );
            })}
          </Panel>
          <Panel className="p-4 text-[0.7rem] leading-6 opacity-80">
            💡 روی بیشترِ گوشی‌ها صدایِ فارسیِ کیفیت‌بالا نصب است («Google فارسی»)، وگرنه نکسوس به صدایِ انگلیسی برمی‌گردد و متنِ فارسی را با لحنِ پیش‌فرض می‌خواند.
            صدای‌ها را در تنظیماتِ گوشی → «خواباندن/متن‌به‌گفتار» می‌توانید مدیریت کنید.
          </Panel>
        </div>
      </div>
      {toast.node}
    </div>
  );
}
