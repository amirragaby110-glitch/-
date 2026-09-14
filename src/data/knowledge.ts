// 📚 دانش‌نامۀ یکپارچه — خورکِ RAG هوش مصنوعی + جستجوی سراسری (پالت فرمان)
import type { Doc } from "@/lib/search";
import { HORROR_CATS, FUN_CATS } from "./types";
import { HORROR_FACTS } from "./horror";
import { FUN_FACTS } from "./fun";
import { EPISODES } from "./episodes";
import { CHARACTERS } from "./characters";
import { VOICE_CAST, AWARDS, CREW, BOOKS } from "./cast";
import { TIMELINE } from "./timeline";
import { GALLERY } from "./gallery";
import { TRACKS } from "./tracks";
import { HORROR_COUNT } from "./horror";
import { FUN_COUNT } from "./fun";

export function buildKnowledge(): Doc[] {
  const docs: Doc[] = [];
  const push = (id: string, title: string, text: string, type: string, href: string, tags = "") =>
    docs.push({ id, title, text, type, href, tags });

  HORROR_FACTS.forEach(f => push(`h${f.id}`, `فکت ترسناک — ${f.t}`, `${f.t}. ${f.x}`, "horror", `/horror#${f.id}`, HORROR_CATS[f.c].fa + " " + f.t));
  FUN_FACTS.forEach(f => push(`f${f.id}`, "فکت جالب", f.x, "fun", `/facts#${f.id}`, FUN_CATS[f.c].fa + " " + (f.tags || []).join(" ")));
  EPISODES.forEach(ep => push(`e${ep.s}-${ep.e}`, `قسمت ${ep.e} فصل ${ep.s} — ${ep.tfa} (${ep.ten})`, `خلاصه: ${ep.sum} ${ep.moment || ""} شخصیت‌ها: ${ep.chars.join(", ")}`, "episode", `/story#${ep.s}-${ep.e}`, `${ep.ten} ${ep.tfa} ${ep.air}`));
  CHARACTERS.forEach(c => push(`c-${c.id}`, `${c.fa} (${c.name})`, `${c.role}. ${c.desc} ${c.quote || ""} اولین حضور: ${c.first}`, "character", `/story#characters`, `${c.role} ${c.voice || ""} ${c.powers?.join(" ") || ""}`));
  VOICE_CAST.forEach(v => push(`v-${v.id}`, `صداپیشه — ${v.fa} (${v.name})`, `${v.role}. ${v.bio}`, "cast", `/cast`, v.roles.join(" ")));
  AWARDS.forEach((a, i) => push(`aw${i}`, `جایزه — ${a.t}`, `${a.y}: ${a.d}`, "award", `/cast`, ""));
  CREW.forEach((c, i) => push(`cr${i}`, `${c.n} — ${c.r}`, c.note, "crew", `/cast`, ""));
  BOOKS.forEach((b, i) => push(`bk${i}`, `کتاب — ${b.t}`, `${b.y}: ${b.d}`, "book", `/story#books`, ""));
  TIMELINE.forEach((t, i) => push(`tl${i}`, `رویداد — ${t.t}`, t.x, "timeline", `/story#timeline`, t.y));
  GALLERY.slice(0, 60).forEach(g => push(`g-${g.id}`, `تصویر — ${g.fa}`, g.desc, "gallery", `/gallery#${g.id}`, g.tags.join(" ")));
  TRACKS.forEach(t => push(`tr-${t.id}`, `آهنگ — ${t.title}`, `${t.note} (سبک: ${t.style}، ${t.bpm} BPM) — «بازسازی هواداری با موتور سینت نکسوس»`, "track", `/music?track=${t.id}`, t.title));
  return docs;
}

export const KB_META = {
  horror: HORROR_COUNT, fun: FUN_COUNT, episodes: EPISODES.length,
  characters: CHARACTERS.length, tracks: TRACKS.length,
};

export const SUGGESTIONS = [
  "بیل سایفر کیست و سرگذشتش چیست؟",
  "خطرناک‌ترین موجودات جنگل گرانش فالز؟",
  "قسمت Not What He Seems چه پیچی داشت؟",
   "چه آهنگ‌هایی در سریال هست؟",
  "پشت‌صحنهٔ ساختِ تم اصلی؟",
  "فورد و استن چه رازی داشتند؟",
  "ژورنال ۳ واقعی رو کجا بخرم؟",
  "ویردمگدون چطور شروع شد؟",
  "چرا سریال در ۴۰ قسمت تمام شد؟",
  "کتاب بیل چیست؟",
];
