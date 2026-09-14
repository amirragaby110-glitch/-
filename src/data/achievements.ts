// 🏅 دستاوردهایِ بازیکن — کاتالوگِ نشانه‌ها (روی هر state پیشرفت چک می‌شوند)
export interface PView {
  xp: number;
  gnomes: string[];
  scrolls: string[];
  tracks: string[];
  pages: string[];
  c: Record<string, number>;
}
export interface Ach {
  id: string;
  icon: string;
  title: string;
  desc: string;
  target: number;
  cur: (p: PView) => number;
  secret?: boolean;   // تا قبل از بازکردن، در فهرست «مرموز» می‌ماند
}
const len = (a: string[]) => a.length;
const cnt = (k: string) => (p: PView) => p.c[k] ?? 0;
const best = (k: string) => (p: PView) => p.c[k] ?? 0;

export const ACHIEVEMENTS: Ach[] = [
  { id: "welcome", icon: "🌲", title: "خوش‌آمدی، کارآگاه", desc: "اولین قدم‌هایت را در نکسوس بردار (۳ صفحه را باز کن)", target: 3, cur: p => len(p.pages) },
  { id: "wanderer", icon: "🗺️", title: "پرسه‌زنِ جنگل", desc: "همۀ صفحاتِ اصلیِ نکسوس را ببین (۱۲ صفحه)", target: 12, cur: p => len(p.pages) },
  { id: "gnome1", icon: "🍄", title: "اولین گنوم", desc: "یک گنومِ پنهان در صفحات پیدا کن", target: 1, cur: p => len(p.gnomes) },
  { id: "gnome8", icon: "🧙", title: "سرشماریِ نیمه‌کاره", desc: "۸ گنوم از ۱۶ گنومِ پنهان را پیدا کن", target: 8, cur: p => len(p.gnomes) },
  { id: "gnome16", icon: "👑", title: "پادشاهِ گنوم‌ها", desc: "همۀ ۱۶ گنومِ پنهانِ سایت را پیدا کن — آن‌ها همه‌جا هستند", target: 16, cur: p => len(p.gnomes) },
  { id: "scroll1", icon: "📜", title: "نامه‌رسانِ مرموز", desc: "اولین طومارِ رمز را پیدا و باز کن", target: 1, cur: p => len(p.scrolls) },
  { id: "scroll4", icon: "🗝", title: "استادِ رمزها", desc: "هر چهار طومارِ شکارِ رمز را حل کن", target: 4, cur: p => len(p.scrolls) },
  { id: "encode", icon: "✒️", title: "رمزگذارِ تمرین‌دوست", desc: "در کارگاهِ رمز، یک متنِ خودت را رمز کن", target: 1, cur: cnt("encodes") },
  { id: "crack", icon: "🧨", title: "رمزگشا", desc: "یک پیامِ سزار را با «شکّندهٔ خودکار» بشکن", target: 1, cur: cnt("cracks") },
  { id: "track1", icon: "🎧", title: "کوک کردنِ رادیو", desc: "اولین آهنگِ نکسوسوند را پخش کن", target: 1, cur: p => len(p.tracks) },
  { id: "track9", icon: "📻", title: "پلی‌لیستِ نیمه‌شب", desc: "نصفِ گنجینۀ آهنگ‌ها (۹ آهنگ) را پخش کن", target: 9, cur: p => len(p.tracks) },
  { id: "track18", icon: "💿", title: "دیسکوگرافیِ کامل", desc: "همۀ ۱۸ آهنگِ بازسازی‌شده را یک‌بار پخش کن", target: 18, cur: p => len(p.tracks) },
  { id: "flips", icon: "🃏", title: "دستِ تند", desc: "۲۵ کارتِ فکت را برگردان", target: 25, cur: cnt("flips") },
  { id: "quiz", icon: "🧠", title: "داوطلبِ آزمون", desc: "یک دورِ کاملِ آزمون را تمام کن", target: 1, cur: cnt("quizzes") },
  { id: "quiz12", icon: "🎖️", title: "سطحِ سه — ژورنال‌خوان", desc: "۱۲ یا بیشتر در آزمونِ ۱۶ سؤالی بگیر", target: 12, cur: best("quizBest") },
  { id: "roulette", icon: "🎲", title: "چرخندهٔ وحشت", desc: "یک بار رولتِ وحشتِ رازهایِ تاریک را بچرخان", target: 1, cur: cnt("roulettes") },
  { id: "mem", icon: "🧩", title: "حافظهٔ سنجابی", desc: "یک برد در بازیِ حافظه", target: 1, cur: cnt("memWins") },
  { id: "memPro", icon: "🌟", title: "حافظهٔ بی‌نقص", desc: "بازی حافظه را با ۱۲ حرکت یا کمتر ببر", target: 1, cur: cnt("memPerfect") },
  { id: "whack", icon: "🔨", title: "مشت‌زنی به گنوم", desc: "در «گنوم‌بزن» امتیاز ۱۲ یا بیشتر بگیر", target: 12, cur: best("whackBest") },
  { id: "amb", icon: "🌫", title: "صداهایِ جنگل", desc: "میکسرِ صدایِ شب (باد/باران/آتش) را روشن کن", target: 1, cur: cnt("ambOn") },
  { id: "card", icon: "🖨️", title: "پوستر‌ساز", desc: "یک کارتِ اشتراکِ گرافیکی بساز", target: 1, cur: cnt("cards") },
  { id: "submit", icon: "✍️", title: "بایگانِ نوپا", desc: "اولین اطلاعات را در آرشیو ثبت کن", target: 1, cur: cnt("subs") },
  { id: "voice", icon: "🗣️", title: "آینه‌صدایی", desc: "اولین کلیپِ صدایِ شخصیت را بساز", target: 1, cur: cnt("clips") },
  { id: "level5", icon: "🔥", title: "نیمهٔ تابستان", desc: "به سطحِ ۵ بازیکن برس", target: 5, cur: p => 1 + Math.floor(Math.sqrt(Math.max(0, p.xp) / 36)) },
  { id: "egg618", icon: "🎩", title: "چیزی که تایپ کردی…", desc: "رمزِ مخفیِ شهر را روی صفحه تایپ کن", target: 1, cur: cnt("eggs"), secret: true },
];

export const achById = (id: string) => ACHIEVEMENTS.find(a => a.id === id)!;
