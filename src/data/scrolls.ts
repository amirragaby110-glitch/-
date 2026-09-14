// 📜 شکارِ رمز — چهار طومارِ پنهان در صفحاتِ سایت (با قفلِ ترتیبی)
import { caesar, atbash, a1z, vigenere } from "@/lib/ciphers";
import type { CipherId } from "@/lib/ciphers";

export interface ScrollDef {
  id: string;
  page: string;         // مسیر صفحۀ میزبان
  pageFa: string;       // نامِ فارسی برای راهنما
  cipher: CipherId;
  shift?: number;
  key?: string;
  answer: string;       // متنِ روشن (لاتین)
  hintFa: string;       // سرنخِ فارسی
  rewardFa: string;     // پیام پس از حل
  xp: number;
}

const BASE: ScrollDef[] = [
  {
    id: "s1", page: "/horror", pageFa: "رازهایِ تاریک", cipher: "caesar", shift: 3,
    answer: "THREE FINGERS",
    hintFa: "بیل همیشه «سه» را دوست داشت؛ نه چهار. به لوگویِ ژورنال نگاه کن: چند انگشت دارد؟ (پاسخ را انگلیسی بنویس)",
    rewardFa: "درست است! «سه انگشتِ» بیل همان امضایی است که الکس هیرش همه‌جا جا گذاشته — حتی پشتِ صحنه، روی دیوارهای استودیو.",
    xp: 25,
  },
  {
    id: "s2", page: "/story", pageFa: "داستان", cipher: "atbash",
    answer: "THE WATERFALL",
    hintFa: "اول از هر رازی، یک آبشار بود. متنِ آینه‌وار را برگردان؛ پاسخ: نامِ همان «چشمۀ» عجیبِ شهر.",
    rewardFa: "آبشارِ گرانش فالز همان «منبعِ» رازهاست که فورد سال‌ها دنبالش گشت. تابستان هیچ‌وقت تمام نمی‌شود…",
    xp: 25,
  },
  {
    id: "s3", page: "/gallery", pageFa: "گالری", cipher: "a1z",
    answer: "GOBBLEWONKER",
    hintFa: "هیولایِ دریاچه! اعداد را به حروفِ الفبا برگردان. نامِ همان «ماهی‌خزنده» که استن شکارش کرد.",
    rewardFa: "گابل‌وانکر (قسمت ۱۰) فقط یک هیولا نبود؛ سال‌ها وسواسِ ثابت‌کردنش، همان چیزی است که گرانش فالز را می‌سازد.",
    xp: 30,
  },
  {
    id: "s4", page: "/settings", pageFa: "تنظیمات", cipher: "vigenere", key: "FALLS",
    answer: "SIX ONE EIGHT",
    hintFa: "کلیدِ ویژنر: «FALLS». اگر رمز باز شد، یک عددِ سه‌رقمی می‌بینی — پیش‌شمارۀ خودِ شهر. آن رقم‌ها را هر جایی که هستی تایپ کن.",
    rewardFa: "618 — پیش‌شماری که در همه‌چیزِ گرانش فالز تکرار شده. حالا که راز را باز کردی، جراتش را داری؟ عدد ۶۱۸ را تایپ کن… (فقط رقم‌ها، بدون فاصله)",
    xp: 40,
  },
];

export interface Scroll extends ScrollDef { cipherText: string }

export const SCROLLS: Scroll[] = BASE.map(s => ({
  ...s,
  cipherText: (() => {
    if (s.cipher === "caesar") return caesar(s.answer, s.shift ?? 3);
    if (s.cipher === "atbash") return atbash(s.answer);
    if (s.cipher === "a1z") return a1z(s.answer);
    return vigenere(s.answer, s.key ?? "FALLS");
  })(),
}));

export const nextScrollId = (solved: string[]): string | null =>
  SCROLLS.find(s => !solved.includes(s.id))?.id ?? null;
export const scrollById = (id: string) => SCROLLS.find(s => s.id === id)!;
