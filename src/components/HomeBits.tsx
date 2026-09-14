"use client";
// المان‌های تزئینیِ صفحۀ اصلی: درخت‌های SVGِ پارالاکس + مه + نورِ ماه
import { motion, useScroll, useTransform } from "framer-motion";

export default function HomeBits() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -70]);
  const y2 = useTransform(scrollY, [0, 600], [0, -130]);
  const y3 = useTransform(scrollY, [0, 600], [0, 50]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden">
      <motion.svg viewBox="0 0 1200 400" className="absolute bottom-0 w-[160%] max-w-none opacity-25" style={{ y: y3 }}>
        <path d="M0 320 L60 240 110 320 170 210 240 320 310 250 370 320 420 230 490 320 560 260 620 320 690 220 760 320 830 250 890 320 950 230 1020 320 1090 250 1150 320 1200 260 1200 400 0 400Z" fill="#0c1a10" />
      </motion.svg>
      <motion.div className="absolute left-[8%] top-8 h-64 w-64 rounded-full bg-gold/10 blur-3xl" style={{ y: y1 }} />
      <motion.div className="absolute right-[6%] top-24 h-72 w-72 rounded-full bg-magic/15 blur-3xl" style={{ y: y2 }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </div>
  );
}
