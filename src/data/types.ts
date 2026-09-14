// ===== تایپ‌های مشترک دانشنامهٔ گرانش فالز =====

export type HorrorCat = "bill" | "creatures" | "curses" | "behind" | "theories" | "codes";

export interface HorrorFact {
  id: number;
  t: string; // عنوان
  x: string; // متن فکت
  c: HorrorCat; // دسته
  lvl: 1 | 2 | 3 | 4 | 5; // شدت ترس
}

export const HORROR_CATS: Record<HorrorCat, { fa: string; emoji: string }> = {
  bill: { fa: "بیل سایفر و بُعد دوم", emoji: "🔺" },
  creatures: { fa: "موجودات خطرناک جنگل", emoji: "🌲" },
  curses: { fa: "نفرین‌ها و اتفاق‌های لعنتی", emoji: "🕯️" },
  behind: { fa: "پشت‌صحنهٔ مرموز", emoji: "🎬" },
  theories: { fa: "تئوری‌های ترسناک طرفداران", emoji: "🧠" },
  codes: { fa: "رمزها و پشت‌بست‌ها", emoji: "🔣" },
};

export type FunCat =
  | "prod" | "insp" | "easter" | "goofs" | "hidden"
  | "voices" | "awards" | "cameo" | "numbers" | "music" | "endings";

export interface FunFact {
  id: number;
  x: string;
  c: FunCat;
  tags?: string[];
}

export const FUN_CATS: Record<FunCat, { fa: string; emoji: string; color: string }> = {
  prod: { fa: "پشت‌صحنهٔ ساخت", emoji: "🛠️", color: "#c08a4e" },
  insp: { fa: "الهام‌گیری‌ها", emoji: "💡", color: "#e0b64f" },
  easter: { fa: "ایستر اگ‌ها", emoji: "🥚", color: "#7fb069" },
  goofs: { fa: "اشتباهات سریال", emoji: "🎭", color: "#d96c4f" },
  hidden: { fa: "پیام‌های مخفی", emoji: "🔍", color: "#9d7bd8" },
  voices: { fa: "صداپیشه‌ها", emoji: "🎙️", color: "#5aa0c9" },
  awards: { fa: "جوایز و تحسین", emoji: "🏆", color: "#d4af37" },
  cameo: { fa: "حضورهای افتخاری", emoji: "⭐", color: "#e88fb2" },
  numbers: { fa: "آمار و ارقام", emoji: "🔢", color: "#8fa8c8" },
  music: { fa: "موسیقی", emoji: "🎵", color: "#c58fd8" },
  endings: { fa: "پایان و آینده", emoji: "🌌", color: "#b06ad8" },
};

export interface Episode {
  s: 1 | 2;
  e: number;
  ten: string; // عنوان انگلیسی
  tfa: string; // عنوان فارسی
  sum: string; // خلاصه
  air: string; // تاریخ پخش
  sc: 1 | 2 | 3 | 4 | 5; // سطح ترس
  arc?: boolean; // قسمت کلیدی داستان اصلی
  chars: string[];
  moment?: string; // صحنه/دیالوگ ماندگار
  d?: string; // کارگردان
  v?: number; // بینندگان آمریکایی (میلیون)
}

export interface Character {
  id: string;
  name: string;
  fa: string;
  role: string;
  desc: string;
  emoji: string;
  color: string;
  first?: string; // اولین حضور
  powers?: string[];
  voice?: string; // صداپیشه
  quote?: string;
}

export interface TimelineEvent {
  y: string;
  t: string;
  x: string;
  kind: "show" | "story";
}

export interface TrackDef {
  id: string;
  title: string;
  artist: string;
  note: string;
  bpm: number;
  root: number; // میدی نت تونیک
  minor: boolean;
  bars: number;
  timeSig?: number;
  prog: [number, "M" | "m" | "7" | "m7" | "maj7" | "dim" | "sus"][];
  motif: number[]; // درجه‌های گام؛ -1 = سکوت
  style: Style;
  embed?: { type: "youtube" | "soundcloud" | "aparat"; src: string; label: string }[];
}

export type Style =
  | "circus" | "swing" | "surf" | "anthem" | "disco" | "ambient"
  | "waltz" | "polka" | "musicbox" | "lullaby" | "jazznoir" | "epic" | "lofi" | "dark";

export interface GalleryItem {
  id: string;
  title: string;
  fa: string;
  cat: GalleryCat;
  desc: string;
  img?: string; // فایل تولیدشده در public/g
  hue: number; // برای پوستر رویه‌ای + جستجوی تصویری
  sat: number;
  year: string;
  tags: string[];
  aspect?: number; // نسبت ابعاد (ارتفاع/عرض)
}

export type GalleryCat = "chars" | "places" | "scenes" | "fanart" | "bts" | "posters";

export const GALLERY_CATS: Record<GalleryCat, { fa: string; emoji: string }> = {
  chars: { fa: "شخصیت‌ها", emoji: "👥" },
  places: { fa: "مکان‌ها", emoji: "🏕️" },
  scenes: { fa: "صحنه‌های معروف", emoji: "🎬" },
  fanart: { fa: "فن‌آرت", emoji: "🎨" },
  posters: { fa: "پوسترها", emoji: "🖼️" },
  bts: { fa: "پشت‌صحنه", emoji: "📼" },
};

export interface Quiz {
  q: string;
  a: string[];
  c: number;
  why: string;
}
