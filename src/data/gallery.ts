// 🖼️ گالری — ۱۸ تصویرِ تولیدشده + پوسترهای رویه‌ایِ «فن‌آرتِ چاپی»
import type { GalleryItem } from "./types";

// تصاویر تولیدشده در public/g (توسط موتور تصویرسازی، استایلِ پوسترِ رترو)
export const FEATURED_IMGS = [
  "shack-dusk", "bill-triangle", "twins-forest", "waterfall", "misty-pines",
  "gnomes-night", "wax-museum", "summer-fest", "journal-glow", "lake-monster",
  "dream-dimension", "junkyard-bot", "weird-sky", "mystery-cabin", "disco-mabel",
  "soos-skate", "gideon-eyes", "station-fog",
];

const handNP = (img: string, title: string, fa: string, cat: GalleryItem["cat"], desc: string, hue: number, year: string, tags: string[], aspect = 0.66): GalleryItem =>
  ({ id: `g-${img}`, title, fa, cat, desc, hue, sat: 0.62, year, tags, aspect });

const hand = (img: string, title: string, fa: string, cat: GalleryItem["cat"], desc: string, hue: number, year: string, tags: string[], aspect = 0.66): GalleryItem =>
  ({ id: `g-${img}`, title, fa, cat, desc, img: `/g/${img}.jpg`, hue, sat: 0.62, year, tags, aspect });

const CURATED: GalleryItem[] = [
  hand("shack-dusk", "Mystery Shack at Dusk", "میستری‌شک در غروب", "places", "تابلوی نئون، کلبهٔ A-شکل و چمن‌های بی‌حوصله — قلبِ جادهٔ ۸.", 35, "2012", ["کلبه", "تابلو", "نئون", "غروب"]),
  hand("bill-triangle", "The All-Seeing One", "چشمِ بیل", "scenes", "مثلثِ زرد با چشمِ واحد که از پشتِ ابرها سرک می‌کشد؛ نمادِ تمامِ معاملات.", 48, "2013", ["بیل", "چشم", "مثلث", "آسمان"]),
  hand("twins-forest", "Into the Pines", "بچه‌ها در جنگل", "chars", "دو چراغ‌قوه در میانِ کاج‌های بلند؛ «ژورنال گفت نرو، کنجکاوی گفت برو».", 160, "2012", ["دیپپر", "میبل", "جنگل", "چراغ"]),
  hand("waterfall", "Gravity Falls Falls", "آبشار گرانش فالز", "places", "آبشارِ تیتراژ؛ یادآورِ مالتنوماه‌ی اورگان — دروازهٔ ورود به تابستان.", 195, "2012", ["آبشار", "تیتراژ", "اورگان", "مه"]),
  hand("misty-pines", "Forest of Whispers", "جنگلِ زمزمه‌ها", "places", "مه بینِ درخت‌ها چیزی را قایم می‌کند که سایه ندارد.", 150, "2014", ["مه", "جنگل", "شب", "حیاط"]),
  hand("gnomes-night", "Gnomes on Patrol", "گنوم‌های گشت", "scenes", "شب‌ها در باغچه، با کلیدِ انگلیسی و نقشه؛ اگر باغبان نبینی، دیر شده.", 120, "2012", ["گنوم", "باغ", "شب"]),
  hand("wax-museum", "Hall of Wax", "تالار موم", "places", "مجسمه‌هایی که شب‌ها «سردتر» می‌شوند؛ ادای دین به Double Dipper و Roadside Attraction.", 25, "2013", ["مومی", "موزه", "ادامه‌دار"]),
  handNP("summer-fest", "Summer Festival", "جشنوارۀ تابستانی", "scenes", "چرخ‌وفلک، سیب‌آبنبات و یک مسابقهٔ تخم‌قل که تاریخِ شهر را عوض کرد.", 320, "2013", ["جشنواره", "رکورد", "Irrational Treasure"]),
  hand("journal-glow", "Journal No. 3", "ژورنال ۳", "posters", "جلدِ چرمی، قفلِ برنجی و ۴۰ آنومالی؛ درهایش را با UV باز کنید.", 40, "2013", ["ژورنال", "کتاب", "رمز"]),
  handNP("lake-monster", "Something Rises", "چیزی در دریاچه", "scenes", "Gobblewonker پشتِ مه؛ «شهادت» هنوز در پروندهٔ مک‌گاکت است.", 200, "2012", ["دریاچه", "هیولا", "قایق"]),
  hand("dream-dimension", "The Second Dimension", "بُعد دوم", "places", "هندسه‌ای که نفس می‌کشد؛ چشم‌ها همه‌جا، زمان هیچ‌جا.", 275, "2015", ["رؤیا", "بُعد", "چشم", "بیل"]),
  handNP("junkyard-bot", "Soos and the Machine", "سوس و ماشین", "chars", "انبارِ آهن‌قراضه؛ جایی که زباله تبدیل به ربات می‌شود و ربات تبدیل به دوست.", 30, "2014", ["سوس", "ربات", "انبار"]),
  hand("weird-sky", "Weirdmageddon", "ویردمگدون", "scenes", "آسمانِ بنفش، جاذبهٔ بی‌کار و مردمِ فویلی؛ روزِ آخرِ تابستان.", 285, "2015", ["ویردمگدون", "آسمان", "فاجعه"]),
  handNP("mystery-cabin", "The Abandoned Lodge", "کلبهٔ متروکهٔ دریاچه", "places", "پنجره‌های تیره، صندلی‌های چیده‌شده برای رقصی که در ۱۹۸۲ تمام شد.", 15, "2012", ["کلبه", "InTheInconveniencing", "۱۹۸۲"]),
  handNP("disco-mabel", "Disco Girl", "دیسکو گرل", "fanart", "میبل زیرِ گویِ دیسکو؛ ژاکتِ نقره‌ای و یوزپلنگِ آینه‌ای.", 310, "2014", ["میبل", "دیسکو", "ژاکت"]),
  handNP("soos-skate", "Straight Blanchin'", "استریت بلنچین", "fanart", "سوس روی اسکیت‌بورد، کلاه‌ایمنیِ نقره و غبارِ غروبِ پارک.", 20, "2014", ["سوس", "اسکیت", "راک"]),
  handNP("gideon-eyes", "The Third Eye", "چشم سوم گیدئون", "fanart", "پیشانیِ کودک و چشمِ دروغین؛ «من بزرگ‌ترین موجودِ این شهرم».", 175, "2013", ["گیدئون", "چشم", "فریب"]),
  handNP("station-fog", "The Last Train", "قطارِ آخر", "scenes", "سکۀ مه‌آلود؛ خداحافظیِ ایستگاه، ژاکتِ سرخ و یک بوسهٔ خواهرانه.", 210, "2016", ["ایستگاه", "فینال", "خداحافظ"]),
];

// ── سازندهٔ پوسترهای فن‌آرت (برای پرشدن گالری تا ۲۰۰+ آیتم) ──
const SUBJECTS = [
  ["Bill Cipher", "بیل سایفر", 52], ["Dipper", "دیپپر", 205], ["Mabel", "میبل", 320], ["Grunkle Stan", "عمو استن", 25],
  ["Soos", "سوس", 30], ["Wendy", "وندی", 160], ["Gideon", "گیدئون", 175], ["Ford", "فورد", 265],
  ["Gnomes", "گنوم‌ها", 120], ["Mystery Shack", "میستری‌شک", 40], ["The Bunker", "واندۀ مخفی", 90], ["Weirdmageddon", "ویردمگدون", 280],
] as const;
const STYLES = [
  "پوسترِ مینیمال", "سایه‌روشنِ کنتراست‌بالا", "نئونِ شب", "چاپِ سیلکِ قدیمی", "آبرنگِ مرموز",
  "پوسترِ سینماییِ دهۀ ۸۰", "کلاژِ روزنامه‌ای", "پالتلِ پلکسی", "وینیلِ مومی", "موزاییکِ رازآلود",
] as const;
const SUBTITLES = [
  "همیشه زنده است", "تابستان تمام نمی‌شود", "حواست به درها باشد", "ژورنال باز ماند", "چشمِ سوم بیدار است",
  "ساعت را کوک نکن", "به بازتاب اعتماد نکن", "رقصِ ابدی", "ماه کامل نیست", "یادت هست؟",
] as const;

function buildProcedural(): GalleryItem[] {
  const out: GalleryItem[] = [];
  let n = 0;
  const cats: GalleryItem["cat"][] = ["fanart", "posters", "scenes", "bts"];
  for (let i = 0; i < SUBJECTS.length; i++) {
    for (let j = 0; j < STYLES.length; j++) {
      if (n >= 195) break;
      const [en, fa, hue] = SUBJECTS[(i + j) % SUBJECTS.length];
      const style = STYLES[(i * 3 + j) % STYLES.length];
      const sub = SUBTITLES[(i + j * 2) % SUBTITLES.length];
      const cat = cats[(i + j) % cats.length];
      out.push({
        id: `p-${n}`,
        title: `${en} — ${style} #${String(n + 1).padStart(3, "0")}`,
        fa: `${fa} · ${style}`,
        cat,
        desc: `«${sub}» — فن‌آرتِ شماره‌دار از مجموعهٔ «نسخهٔ محدودِ نکسوس»؛ چاپِ ${100 + n} از ${400 + n}. ${style} با پالتِ رنگیِ اختصاصیِ همین نسخه.`,
        hue: (hue + j * 23) % 360, sat: 0.55 + ((i * j) % 4) / 10,
        year: ["2016", "2019", "2021", "2024", "2025"][(i + j) % 5],
        tags: [fa, "فن‌آرت", style, en.toLowerCase()],
        aspect: 0.72 + ((i * 7 + j * 3) % 5) / 20,
      });
      n++;
    }
  }
  return out;
}

export const GALLERY: GalleryItem[] = [...CURATED, ...buildProcedural()];
