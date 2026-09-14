"use client";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import BackgroundHint from "@/components/HomeBits";
import { Panel, Reveal, SectionTitle, Counter, Marquee, Tilt } from "@/components/ui";
import { useSettings } from "@/lib/store";
import { HORROR_COUNT } from "@/data/horror";
import { FUN_COUNT } from "@/data/fun";
import { EPISODES } from "@/data/episodes";
import { GALLERY } from "@/data/gallery";
import { TRACKS } from "@/data/tracks";
import { CHARACTERS } from "@/data/characters";

const FEATURES = [
  { href: "/music", icon: "🎵", t: "پخش موزیک ابشار جاذبه", d: `پلیر کامل با ${TRACKS.length} آهنگِ بازسازی‌شده (تم اصلی، بیل، سوس، میبل…)، ویژوالایزر زنده، موج صوتی، دانلود WAV، شافل و تکرار، و اتصال به یوتیوب/سوندکلاد/آپارات.` },
  { href: "/horror", icon: "🔦", t: "رازهای تاریک", d: `${HORROR_COUNT} فکت ترسناک: بیل سایفر، موجودات جنگل، نفرین‌ها، پشت‌صحنه‌های مرموز و تئوری‌ها — با «حالِ بیل»، افکت‌های پرش، صدای آمبینت و پچ‌پچ.` },
  { href: "/facts", icon: "🧩", t: "فکت‌های عمومی", d: `${FUN_COUNT} فکت جالب با کارت‌های فلیپ، دسته‌بندیِ شخصیت/ساخت/ایستراگ، جستجو و فیلتر، و حالت «کارت‌کشی تصادفی».` },
  { href: "/story", icon: "📖", t: "داستان سریال", d: "خلاصۀ هر ۴۰ قسمت، خط زمانیِ تعاملی، درخت قوس‌های داستانی، روایتِ صوتیِ فارسی، کتاب‌ها/کامیک‌ها و داستان‌های هواداری." },
  { href: "/watch", icon: "📺", t: "تماشا از همه‌جا", d: "پلیر یکپارچۀ یوتیوب، آپارات، ویمیو و دیلی‌موشن + پخش فایل محلی؛ پلی‌لیست کامل، ادامۀ آخرین قسمت، پخش خودکار بعدی و ثبت لینک اختصاصی هر قسمت." },
  { href: "/gallery", icon: "🖼️", t: "گالریِ حرفه‌ای", d: `${GALLERY.length}+ تصویر با لایت‌باکس (زوم/چرخش/جابه‌جایی)، اسلایدشو، جستجوی تصویری با هوش مصنوعی، دانلود و اشتراک‌گذاری.` },
  { href: "/cast", icon: "🎙️", t: "سازنده و سازندگان", d: "بیوِ الکس هیرش، صداپیشه‌ها (کریستن شال، جیسون ریتر، جی‌کی سیمونز…)، استودیو، تاریخچۀ ساخت، جوایز، آمار IMDb/RT و مصاحبه‌ها." },
  { href: "/ai", icon: "🤖", t: "هوش مصنوعی نکسوس", d: "چتِ استریمی با RAG روی همۀ دانشنامه + Tool-Calling؛ با Groq (Llama 3.3 70B) و حالت محلیِ آفلاین؛ حافظه و تاریخچۀ گفتگو." },
  { href: "/voice", icon: "🗣️", t: "آزمایشگاه صدا", d: "هر متنی را با صدای دیپر، میبل، استن، بیل، سوس، وندی… بشنوید؛ تنظیم پیچ/سرعت، لیپ‌سینک زنده و کتابخانۀ کلیپ‌ها." },
  { href: "/submit", icon: "✍️", t: "ثبت اطلاعات جدید", d: "فکت، تئوری، فن‌فیک، تصویر و لینکِ ویدیوی خودتان را ثبت کنید — با آپلود و فشرده‌سازی عکس، ذخیره در پایگاه‌دادهٔ محلی و خروجی JSON." },
  { href: "/quiz", icon: "🧠", t: "آزمون گرانش فالز", d: "۱۶ سؤالِ طبقه‌بندی‌شده از «توریست» تا «ژورنال‌خوانِ سطح سه» با زمان، پاسخ‌توضیحی و اشتراک نتیجۀ آزمون." },
  { href: "/settings", icon: "⚙️", t: "تنظیمات و PWA", d: "روز/شب، چگالیِ پس‌زمینه، حرکتِ کم، صدای رابط، نصب به‌عنوان اپ و مدیریتِ کامل داده‌ها." },
];

export default function Home() {
  const { theme, toggleTheme, horrorMode, set } = useSettings();
  const todayFact = useMemo(() => {
    const d = new Date(); const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    return { fun: FUN_COUNT, n: seed % FUN_COUNT };
  }, []);
  const arcs = EPISODES.filter(e => e.arc).slice(0, 6);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* هیرو */}
      <section className="relative py-10 sm:py-16">
        <BackgroundHint />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }} className="text-center">
          <div className="mb-3 text-[0.7rem] font-black tracking-[0.5em] text-gold/80">DISNEY&apos;S MOST MYSTERICAL ARCHIVE — FAN MADE</div>
          <h1 className="title-creep glow-gold select-none text-[3.1rem] leading-[1.05] text-gold sm:text-7xl lg:text-8xl">GRAVITY<span className="text-magic2 glow-magic"> FALLS</span></h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-8 opacity-80 sm:text-base">
            اولتی‌میت نکسوس: پایگاهِ دانشِ کاملِ آبشارِ جاذبه به فارسی.
            موزیک، رازهای تاریک، داستان، گالری، ویدیو، هوش مصنوعی و صدای شخصیت‌ها — همه در یک اپِ نصب‌شدنی.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/music?play=theme" className="btn btn-gold">▶ پخشِ تمِ اصلی</Link>
            <Link href="/horror" className="btn btn-magic">🔦 واردِ رازهایِ تاریک شو</Link>
            <button onClick={() => toggleTheme()} className="btn btn-ghost">{theme === "dark" ? "☀️ صبحِ شهر" : "🌙 شبِ شهر"}</button>
          </div>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 text-center sm:grid-cols-4">
          {[
            { n: FUN_COUNT + HORROR_COUNT, s: "+", l: "فکتِ راستی‌آزمایی‌شده" },
            { n: EPISODES.length, s: "", l: "قسمت با خلاصه و آمار" },
            { n: GALLERY.length, s: "+", l: "تصویر و پوستر" },
            { n: CHARACTERS.length, s: "", l: "شخصیتِ مستند" },
          ].map((x, i) => (
            <Reveal key={x.l} delay={i * 0.08}>
              <Panel className="p-4">
                <div className="title-creep text-3xl text-gold"><Counter to={x.n} suffix={x.s} /></div>
                <div className="mt-1 text-[0.68rem] font-bold opacity-65">{x.l}</div>
              </Panel>
            </Reveal>
          ))}
        </div>

        <Tilt max={7} className="mx-auto mt-12 max-w-xl">
          <Panel className="relative overflow-hidden p-6 text-right">
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-magic/20 blur-3xl" />
            <div className="mb-1 flex items-center justify-between text-[0.65rem] font-black tracking-widest opacity-60">
              <span>JOURNAL №3</span><span>فکتِ امروزِ نکسوس</span>
            </div>
            <p className="text-sm leading-8">
              «هر تابستان یک رمز دارد؛ رمزِ امروزِ شما در صفحۀ «فکت‌ها» ثبت شده — شمارهٔ {String(todayFact.n + 1).padStart(3, "0")} را پیدا کن.»
            </p>
            <div className="mt-4 flex gap-2">
              <Link href={`/facts?focus=${todayFact.n}`} className="btn btn-gold !py-1.5 !text-xs">خواندن فکتِ امروز</Link>
              <button onClick={() => set({ horrorMode: !horrorMode })} className={`btn !py-1.5 !text-xs ${horrorMode ? "btn-danger" : "btn-ghost ring-1 ring-white/10"}`}>
                {horrorMode ? "👁 حالتِ بیل: روشن" : "👁 حالتِ بیل: خاموش"}
              </button>
            </div>
          </Panel>
        </Tilt>
      </section>

      <Marquee items={["EYEBROWS", "F-331", "تو رؤیای من خوش آمدی", "3313", "نیمه‌شبِ ابدی", "CIPHER HUNT", "تابستان تمام نمی‌شود", "B-613", "WILL YOU LET ME IN?", "۱۹۸۲"]} />

      {/* فیچرها */}
      <section className="py-14">
        <SectionTitle kicker="دسترسی سریع" title="دوازده دروازه به یک شهر" sub="هر کارت یک بخشِ کاملِ اپ است — از پلیرِ موزیک تا موتورِ هوش مصنوعیِ RAG." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.href} delay={(i % 3) * 0.06}>
              <Link href={f.href}>
                <Panel hover className="group h-full p-5 transition hover:ring-1 hover:ring-gold/40">
                  <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold/20 to-magic/25 text-xl ring-1 ring-gold/30 transition group-hover:scale-110 group-hover:rotate-6">{f.icon}</div>
                  <h3 className="mb-1.5 font-black">{f.t}</h3>
                  <p className="text-[0.78rem] leading-6 opacity-70">{f.d}</p>
                  <div className="mt-3 text-[0.7rem] font-black tracking-widest text-gold opacity-0 transition group-hover:opacity-100">ورود ←</div>
                </Panel>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* قوس‌های داستانی */}
      <section className="pb-16">
        <SectionTitle kicker="نقشۀ تابستان" title="قسمت‌هایی که همه‌چیز را عوض کردند"
          right={<Link href="/story" className="btn btn-ghost ring-1 ring-white/10">همۀ ۴۰ قسمت →</Link>} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {arcs.map((ep, i) => (
            <Reveal key={`${ep.s}-${ep.e}`} delay={i * 0.05}>
              <Link href={`/story#ep-${ep.s}-${ep.e}`}>
                <Panel hover className="flex items-center gap-4 p-4">
                  <div className="title-creep grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-night/60 text-2xl text-gold ring-1 ring-gold/30">{ep.s}·{ep.e}</div>
                  <div className="min-w-0">
                    <div className="truncate font-black">{ep.tfa}</div>
                    <div className="truncate text-[0.68rem] font-mono opacity-50">{ep.ten} — {ep.air}</div>
                  </div>
                  <div className="mr-auto shrink-0 text-lg" title={`سطح ترس ${ep.sc}`}>{"🔥".repeat(Math.ceil(ep.sc / 2))}</div>
                </Panel>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
