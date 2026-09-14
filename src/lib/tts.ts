"use client";
// 🗣 موتور صداپیشگی: Web Speech API با پریست شخصیت‌ها + لیپ‌سینک تقریبی
export interface VoicePreset {
  id: string; fa: string; emoji: string; pitch: number; rate: number; color: string;
  hint: string; lang: string; desc: string;
}
export const VOICE_PRESETS: VoicePreset[] = [
  { id: "dipper", fa: "دیپر", emoji: "🌲", pitch: 1.15, rate: 1.02, color: "#5aa0c9", lang: "fa-IR", hint: "boy", desc: "پسرانه، کنجکاو و کمی نگران؛ انرژیِ ژورنال‌خوانی." },
  { id: "mabel", fa: "میبل", emoji: "🧸", pitch: 1.62, rate: 1.14, color: "#e88fb2", lang: "fa-IR", hint: "girl", desc: "دخترانه، شاد، سریع‌تر از فکر؛ ژاکتِ صوتیِ پر نقش‌ونگار." },
  { id: "stan", fa: "عمو استن", emoji: "🎩", pitch: 0.62, rate: 0.9, color: "#b03a2e", lang: "fa-IR", hint: "male", desc: "خش‌دار، پایین، با کمی تپقِ کاسب‌ها؛ کلاهبرداریِ مهربان." },
  { id: "bill", fa: "بیل سایفر", emoji: "🔺", pitch: 0.45, rate: 0.82, color: "#e0b64f", lang: "fa-IR", hint: "male", desc: "بمّ و کش‌دار با پرش‌های ناگهانی؛ وقتی حرف می‌زند دماغتان خنک می‌شود." },
  { id: "soos", fa: "سوس", emoji: "🔧", pitch: 0.86, rate: 0.86, color: "#4f8a5b", lang: "fa-IR", hint: "male", desc: "آرام، ساده و صمیمی؛ انگار وسطِ حرف‌هایش به پیچِ سوم فکر می‌کند." },
  { id: "wendy", fa: "وندی", emoji: "🪓", pitch: 0.98, rate: 0.94, color: "#3f6f5e", lang: "fa-IR", hint: "girl", desc: "خونسرد، کشیده و بی‌خیال؛ cool‌ترینِ پالتِ کافه." },
  { id: "ford", fa: "فورد", emoji: "🔬", pitch: 0.68, rate: 0.92, color: "#7a5cb4", lang: "fa-IR", hint: "male", desc: "علمی، محکم و جدی؛ مردی که در رؤیا پیر شده." },
  { id: "gideon", fa: "گیدئون", emoji: "📿", pitch: 1.45, rate: 1.05, color: "#2f6f7f", lang: "fa-IR", hint: "boy", desc: "بچگانه ولی دستوردهنده؛ مؤدب تا مرزِ تهدید." },
];

export type SpeakState = { speaking: boolean; char: number; total: number; preset: string | null; mouth: number };

let voices: SpeechSynthesisVoice[] = [];
const listeners = new Set<(s: SpeakState) => void>();
let timer: number | null = null;
export const state: SpeakState = { speaking: false, char: 0, total: 0, preset: null, mouth: 0 };
const emit = () => listeners.forEach(f => f({ ...state }));
export const onSpeak = (f: (s: SpeakState) => void) => { listeners.add(f); return () => { listeners.delete(f); }; };

export function supported(): boolean { return typeof window !== "undefined" && "speechSynthesis" in window; }
export function loadVoices(): SpeechSynthesisVoice[] {
  if (!supported()) return [];
  voices = speechSynthesis.getVoices();
  return voices;
}
if (typeof window !== "undefined" && supported()) {
  loadVoices();
  speechSynthesis.onvoiceschanged = () => loadVoices();
}
function pickVoice(lang: string, hint: string): SpeechSynthesisVoice | null {
  if (!voices.length) loadVoices();
  const base = lang.split("-")[0];
  const pool = voices.filter(v => v.lang.toLowerCase().startsWith(base));
  const byName = (re: RegExp) => pool.find(v => re.test(v.name));
  if (hint === "male") return byName(/(male|farhad|dariush|iman|saman|پسری|آقا)/i) ?? pool[1] ?? pool[0] ?? voices[0] ?? null;
  if (hint === "female") return byName(/(female|sara|shirin|leila| Mitra|zarrin|دختر|خانم)/i) ?? pool[0] ?? voices[0] ?? null;
  return pool[0] ?? voices[0] ?? null;
}
export function speak(text: string, p: Partial<VoicePreset>, onDone?: () => void) {
  if (!supported()) { onDone?.(); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
  const preset = { pitch: p.pitch ?? 1, rate: p.rate ?? 1, lang: p.lang ?? "fa-IR", hint: p.hint ?? "neutral" };
  const v = pickVoice(preset.lang, preset.hint);
  if (v) u.voice = v;
  u.lang = preset.lang;
  u.pitch = clampN(preset.pitch, 0.1, 2); u.rate = clampN(preset.rate, 0.4, 2); u.volume = 1;
  state.speaking = true; state.preset = p.id ?? "custom"; state.total = text.length; state.char = 0; emit();
  const chunk = Math.max(1, Math.floor(text.length / 100));
  let i = 0;
  if (timer) clearInterval(timer);
  timer = window.setInterval(() => {
    i = Math.min(text.length, i + chunk * (1 + Math.random()));
    state.char = i; state.mouth = 0.45 + 0.55 * Math.abs(Math.sin(Date.now() / 90)); emit();
    if (i >= text.length && timer) { clearInterval(timer); timer = null; }
  }, 60);
  u.onend = () => { if (timer) { clearInterval(timer); timer = null; } state.speaking = false; state.mouth = 0; emit(); onDone?.(); };
  u.onerror = () => { if (timer) { clearInterval(timer); timer = null; } state.speaking = false; state.mouth = 0; emit(); onDone?.(); };
  speechSynthesis.speak(u);
}
export function stopSpeak() { if (supported()) speechSynthesis.cancel(); if (timer) { clearInterval(timer); timer = null; } state.speaking = false; state.mouth = 0; emit(); }
export function speakEnglish(text: string, p: Partial<VoicePreset> = {}, onDone?: () => void) {
  speak(text, { ...p, lang: "en-US", hint: p.hint ?? "male" }, onDone);
}
const clampN = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// ذخیرۀ «کلیپ» در IndexedDB (متن + تنظیمات، پخش مجدد با یک کلیک)
export type Clip = { id: string; text: string; preset: string; pitch: number; rate: number; createdAt: number };
const CLIPS_KEY = "gf-nexus-clips";
export const loadClips = (): Clip[] => { try { return JSON.parse(localStorage.getItem(CLIPS_KEY) || "[]"); } catch { return []; } };
export const saveClips = (c: Clip[]) => { try { localStorage.setItem(CLIPS_KEY, JSON.stringify(c.slice(0, 40))); } catch {} };
