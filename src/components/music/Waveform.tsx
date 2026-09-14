"use client";
// 〰️ موج صوتیِ قابل‌اسکراب با نشانگرِ پخش
import { useEffect, useRef } from "react";

export default function Waveform({ peaks, progress, onSeek, height = 74 }: {
  peaks: number[]; progress: number; onSeek?: (p: number) => void; height?: number;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const prog = useRef(progress);
  prog.current = progress;
  useEffect(() => {
    const el = cv.current!;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const w = (el.width = el.clientWidth * devicePixelRatio);
      const h = (el.height = height * devicePixelRatio);
      const ctx = el.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      const n = Math.max(peaks.length, 1);
      const step = w / n;
      const mid = h / 2;
      const px = w * prog.current;
      for (let i = 0; i < n; i++) {
        const v = Math.max(0.02, Math.pow(peaks[i] || 0, 0.72));
        const bh = v * (h * 0.86);
        const x = i * step;
        const played = x < px;
        ctx.fillStyle = played ? "rgba(224,182,79,0.9)" : "rgba(159,212,138,0.22)";
        ctx.fillRect(x, mid - bh / 2, Math.max(1, step * 0.66), bh);
        if (v > 0.5) { ctx.fillStyle = played ? "rgba(244,217,139,0.9)" : "rgba(199,165,255,0.3)"; ctx.fillRect(x, mid - bh, Math.max(1, step * 0.66), 2 * devicePixelRatio); ctx.fillRect(x, mid + bh - 2 * devicePixelRatio, Math.max(1, step * 0.66), 2 * devicePixelRatio); }
      }
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(px - 1, 0, 2, h);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [peaks, height]);
  const seek = (e: React.PointerEvent) => {
    if (!onSeek) return;
    const b = (e.target as HTMLElement).getBoundingClientRect();
    const ratio = 1 - Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)); // RTL
    onSeek(ratio);
  };
  return (
    <div dir="ltr" className={`group relative select-none ${onSeek ? "cursor-pointer" : ""}`} onPointerDown={e => { (e.target as HTMLElement).setPointerCapture(e.pointerId); seek(e); }} onPointerMove={e => e.buttons === 1 && seek(e)}>
      <canvas ref={cv} className="w-full rounded-xl bg-black/15 transition group-hover:bg-black/25 dark:bg-white/5" style={{ height }} />
    </div>
  );
}
