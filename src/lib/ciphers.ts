// 🗝 ابزارهای رمزنگاری گرانش فالز — سزار، اتبش، A1Z، ویژنر (مجازی: الفبای بیل)
export type CipherId = "caesar" | "atbash" | "a1z" | "vigenere";

export const CIPHERS: Record<CipherId, { fa: string; en: string; desc: string; needsKey: boolean; icon: string }> = {
  caesar: { fa: "سزار (شیفت حرفی)", en: "CAESAR", icon: "🏛", needsKey: true, desc: "هر حرف چند خانه در الفبتا جلو می‌رود. در سریال با شیفت ۳ بازی می‌شد." },
  atbash: { fa: "اتبش (آینه‌وار)", en: "ATBASH", icon: "🪞", needsKey: false, desc: "A↔Z، B↔Y… اولین ژورنال با همین نوشته شده بود — اگر متنِ «AOL PDLN» دیدید، همین است." },
  a1z: { fa: "A1Z (عدد به‌جای حرف)", en: "A1Z", icon: "🔢", needsKey: false, desc: "A=1 تا Z=26. روی کاورِ کتاب‌ها و پشتِ قابلمۀ پاپ‌کورن هم پیدا می‌شود." },
  vigenere: { fa: "ویژنر (کلیدواژه‌ای)", en: "VIGENERE", icon: "🗝", needsKey: true, desc: "سزارِ متغیر با یک کلیدواژه. سخت‌ترینِ رمزهایِ روزانهٔ جنگل." },
};

const A = 65; // 'A'
export const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "");
export const normAns = (s: string) => clean(s).replace(/\s+/g, "");

export function caesar(s: string, shift = 3, decode = false): string {
  const k = ((decode ? -shift : shift) % 26 + 26) % 26;
  return s.toUpperCase().replace(/[A-Z]/g, c => String.fromCharCode(A + ((c.charCodeAt(0) - A + k) % 26)));
}
export function atbash(s: string): string {
  return s.toUpperCase().replace(/[A-Z]/g, c => String.fromCharCode(A + 25 - (c.charCodeAt(0) - A)));
}
export function a1z(s: string): string {
  // encode → "20-8-5 20-8-5" ; spaces between words become " / "
  return s.toUpperCase().split(/\s+/).filter(Boolean).map(w =>
    [...w].filter(c => c >= "A" && c <= "Z").map(c => c.charCodeAt(0) - A + 1).join("-")
  ).join(" / ");
}
export function a1zDec(s: string): string {
  return s.split(/[\s/]+/).map(word =>
    word.split(/[-,.]+/).filter(Boolean).map(n => {
      const v = +n;
      return v >= 1 && v <= 26 ? String.fromCharCode(A + v - 1) : "";
    }).join("")
  ).filter(Boolean).join(" ");
}
export function vigenere(s: string, key = "GRAVITY", decode = false): string {
  const k = clean(key) || "GRAVITY";
  let ki = 0;
  return s.toUpperCase().replace(/[A-Z]/g, c => {
    const sh = k.charCodeAt(ki++ % k.length) - A;
    const v = decode ? c.charCodeAt(0) - A - sh : c.charCodeAt(0) - A + sh;
    return String.fromCharCode(A + ((v % 26) + 26) % 26);
  });
}
// آینهٔ حروفِ فارسی برای نمایش (فقط تزئینی — رمزها روی لاتین کار می‌کنند)
export function applyCipher(id: CipherId, s: string, key: string, shift: number): string {
  switch (id) {
    case "caesar": return caesar(s, shift);
    case "atbash": return atbash(s);
    case "a1z": return a1z(s);
    case "vigenere": return vigenere(s, key);
  }
}
export function decryptSample(id: CipherId, s: string, key: string, shift: number): string {
  switch (id) {
    case "caesar": return caesar(s, shift, true);
    case "atbash": return atbash(s);
    case "a1z": return a1zDec(s);
    case "vigenere": return vigenere(s, key, true);
  }
}
export const IS_A1Z = /^\s*(\d{1,2}\s*[-.,]\s*)*\d{1,2}\s*(\/\s*(\d{1,2}\s*[-.,]\s*)*\d{1,2}\s*)*$/;
