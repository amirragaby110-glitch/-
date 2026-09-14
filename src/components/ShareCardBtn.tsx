"use client";
// 🖨 دکمۀ «کارتِ اشتراک» — تولیدِ تصویرِ گرافیکیِ فکت + دانلود یا اشتراک‌گذاری
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "./ui";
import { renderShareCard, shareCardBlob } from "@/lib/sharecard";
import { download } from "@/lib/utils";
import { bumpCounter } from "@/lib/progress";
import { sfx } from "@/components/Shell";

export default function ShareCardBtn({ tag, title, body, accent = "gold", label = "🖨 کارت", className = "chip !text-[0.62rem]" }: {
  tag: string; title: string; body: string; accent?: "gold" | "magic" | "blood"; label?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const make = async () => {
    sfx("open"); setBusy(true); setOpen(true); setNote(null);
    try {
      const c = await renderShareCard({ tag, title, body, accent });
      setCard(c); bumpCounter("cards", 1, "کارتِ اشتراک ساخته شد 🖨", 4);
    } catch { setNote("ساختِ کارت ناموفق بود (canvas در این مرورگر؟)"); }
    setBusy(false);
  };
  return (
    <>
      <button title="ساختِ کارتِ گرافیکی برای اشتراک" onClick={make} className={className}>{label}</button>
      <AnimatePresence>
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black">🖨 کارتِ اشتراکِ نکسوس</h3>
            <button className="btn btn-ghost !px-2.5 !py-1" onClick={() => setOpen(false)}>✕</button>
          </div>
          {busy && <div className="p-10 text-center text-sm opacity-60 animate-pulse">در حالِ رندرِ کارت روی بوم… ✨</div>}
          {card && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.dataUrl} alt="کارتِ اشتراک" className="w-full rounded-2xl ring-1 ring-gold/30" />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button className="btn btn-gold !text-xs" onClick={() => { download(card.blob, "gravity-falls-nexus-card.png"); setNote("دانلود شد ✓"); }}>⬇️ دانلود PNG</button>
                <button className="btn btn-magic !text-xs" onClick={async () => {
                  const r = await shareCardBlob(card.blob, title);
                  setNote(r === "shared" ? "در-app share باز شد ✓" : r === "clipboard" ? "تصویر در کلیپ‌بورد کپی شد ✓" : "اشتراک ناموفق — می‌توانید دانلود کنید");
                }}>📤 اشتراک / کپی تصویر</button>
              </div>
            </>
          )}
          {note && <div className="mt-3 text-center text-xs font-bold text-pine">{note}</div>}
          <p className="mt-3 text-center text-[0.62rem] leading-5 opacity-45">کارت به‌صورتِ محلی روی دستگاهِ شما رندر می‌شود — بدونِ سرور.</p>
        </Modal>
      </AnimatePresence>
    </>
  );
}
