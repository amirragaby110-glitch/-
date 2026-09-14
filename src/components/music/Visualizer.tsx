"use client";
// 📊 ویژوالایزرِ زنده — بارهای فرکانسی + حلقۀ پالس + ذرات، همگام با Web Audio API
import { useEffect, useRef } from "react";
import { player } from "@/lib/player";

export default function Visualizer({ height = 150 }: { height?: number }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const el = cv.current!;
    const ctx = el.getContext("2d")!;
    const W = () => (el.width = el.clientWidth * devicePixelRatio);
    const H = () => (el.height = height * devicePixelRatio);
    W(); H();
    addEventListener("resize", () => { W(); H(); });
    let t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.016;
      const w = el.width, h = el.height;
      ctx.clearRect(0, 0, w, h);
      player.tick();
      const fd = player.freqData;
      const n = Math.floor(w / (6 * devicePixelRatio));
      const cx = w / 2, cy = h / 2;
      const lvl = player.level;
      // حلقۀ مرکزی
      const base = Math.min(w, h) * 0.16;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const bi = Math.floor((i / 64) * 96);
        const v = (fd[bi] || 0) / 255;
        const r = base * (1 + v * 0.9 + lvl * 0.25);
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, base * 2);
      g.addColorStop(0, `rgba(157,92,255,${0.28 + lvl * 0.4})`); g.addColorStop(1, "rgba(224,182,79,0.08)");
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = `rgba(224,182,79,${0.5 + lvl * 0.5})`; ctx.lineWidth = 1.5 * devicePixelRatio; ctx.stroke();
      // چشمِ مرکزی
      ctx.fillStyle = "#f5f0e6";
      ctx.beginPath(); ctx.ellipse(0, 0, base * 0.42, base * (0.26 + lvl * 0.18), 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#140a05"; ctx.beginPath(); ctx.arc(0, 0, base * 0.12 + lvl * 5, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-base * 0.1, -base * 0.08, base * 0.035, 0, 6.283); ctx.fill();
      ctx.restore();
      // بارها
      for (let i = 0; i < n; i++) {
        const v = (fd[Math.floor((i / n) * fd.length * 0.72)] || 0) / 255;
        const bh = Math.pow(v, 1.5) * (h * 0.42);
        const x = (i / n) * w;
        const hue = 48 - v * 20 + (i % 2 ? 218 : 0);
        ctx.fillStyle = `hsla(${hue} 90% 62% / ${0.55 + v * 0.4})`;
        ctx.fillRect(x + 1, h - bh, Math.max(1, (w / n) * 0.62), bh);
        ctx.fillRect(x + 1, 0, Math.max(1, (w / n) * 0.62), bh * 0.6);
      }
      // ذرات شناور در سکوت
      if (!player.playing) {
        ctx.fillStyle = "rgba(224,182,79,0.5)";
        for (let i = 0; i < 24; i++) {
          const x = (Math.sin(t * 0.4 + i * 2.7) * 0.45 + 0.5) * w;
          const y = (Math.cos(t * 0.3 + i * 1.9) * 0.4 + 0.5) * h;
          ctx.beginPath(); ctx.arc(x, y, 1.2 * devicePixelRatio, 0, 6.283); ctx.fill();
        }
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [height]);
  return <canvas ref={cv} className="w-full rounded-2xl" style={{ height }} aria-hidden />;
}
