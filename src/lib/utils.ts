"use client";
// 💾 خروجی WAV ۱۶بیتی + اشتراک‌گذاری + دانلود
export function audioBufferToWav(buf: AudioBuffer): Blob {
  const nCh = Math.min(2, buf.numberOfChannels), sr = buf.sampleRate, len = buf.length;
  const bytes = 44 + len * nCh * 2;
  const ab = new ArrayBuffer(bytes), dv = new DataView(ab);
  const W = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  W(0, "RIFF"); dv.setUint32(4, bytes - 8, true); W(8, "WAVE"); W(12, "fmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, nCh, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * nCh * 2, true); dv.setUint16(32, nCh * 2, true); dv.setUint16(34, 16, true);
  W(36, "data"); dv.setUint32(40, len * nCh * 2, true);
  const chans: Float32Array[] = []; for (let c = 0; c < nCh; c++) chans.push(buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < nCh; c++) {
    const s = Math.max(-1, Math.min(1, chans[c][i]));
    dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
  }
  return new Blob([ab], { type: "audio/wav" });
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 800);
}
export async function share(title: string, text: string, url?: string) {
  const payload = { title, text, url: url ?? (typeof location !== "undefined" ? location.href : "") };
  try {
    if (navigator.share) { await navigator.share(payload); return "shared" as const; }
    await navigator.clipboard.writeText(`${title}\n${text}\n${payload.url}`);
    return "copied" as const;
  } catch { return "none" as const; }
}
export const faNum = (n: number | string) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const faDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch { return iso; }
};
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export function copyText(t: string) { navigator.clipboard?.writeText(t).catch(() => {}); }
export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}
export function lsSet(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { } }
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
