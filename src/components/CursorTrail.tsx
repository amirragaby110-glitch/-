"use client";
// ✨ دنبالۀ جادوییِ ماوس — ذراتِ بنفشِ بیل
import { useEffect, useRef } from "react";
import { useSettings } from "@/lib/store";

export default function CursorTrail() {
  const cv = useRef<HTMLCanvasElement>(null);
  const enabled = useSettings(s => s.cursorTrail && !s.reduceMotion);
  useEffect(() => {
    if (!enabled) return;
    const el = cv.current!;
    const ctx = el.getContext("2d")!;
    let W = innerWidth, H = innerHeight; el.width = W; el.height = H;
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; hue: number };
    const ps: P[] = [];
    let last = { x: W / 2, y: H / 2 }, mx = W / 2, my = H / 2, raf = 0;
    const move = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      const n = 1 + Math.hypot(mx - last.x, my - last.y) / 26;
      for (let i = 0; i < Math.min(5, n); i++) {
        ps.push({ x: mx + (Math.random() - 0.5) * 8, y: my + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 0.9, life: 0, max: 40 + Math.random() * 40, s: 1.4 + Math.random() * 3.4, hue: Math.random() < 0.75 ? 265 + Math.random() * 30 : 45 });
      }
      if (ps.length > 320) ps.splice(0, ps.length - 320);
      last = { x: mx, y: my };
    };
    const down = (e: PointerEvent) => {
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 2.6;
        ps.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 50, s: 2 + Math.random() * 3, hue: Math.random() < 0.5 ? 272 : 46 });
      }
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    const rs = () => { W = innerWidth; H = innerHeight; el.width = W; el.height = H; };
    addEventListener("resize", rs);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.life++;
        if (p.life > p.max) { ps.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.vy *= 0.98; p.vx *= 0.98;
        const t = 1 - p.life / p.max;
        ctx.globalAlpha = t * 0.9;
        ctx.fillStyle = `hsl(${p.hue} 90% ${60 + t * 25}%)`;
        ctx.shadowColor = `hsl(${p.hue} 95% 65%)`; ctx.shadowBlur = 12 * t;
        ctx.beginPath();
        const sz = p.s * t;
        ctx.moveTo(p.x, p.y - sz * 1.7); ctx.quadraticCurveTo(p.x + sz, p.y - sz, p.x + sz * 1.7, p.y);
        ctx.quadraticCurveTo(p.x + sz, p.y + sz, p.x, p.y + sz * 1.7); ctx.quadraticCurveTo(p.x - sz, p.y + sz, p.x - sz * 1.7, p.y);
        ctx.quadraticCurveTo(p.x - sz, p.y - sz, p.x, p.y - sz * 1.7);
        ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      // هالۀ ماوس
      ctx.strokeStyle = "rgba(224,182,79,0.55)";
      ctx.beginPath(); ctx.arc(mx, my, 9 + Math.sin(performance.now() / 240) * 2.4, 0, 6.283); ctx.stroke();
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", move); removeEventListener("pointerdown", down); removeEventListener("resize", rs); };
  }, [enabled]);
  if (!enabled) return null;
  return <canvas ref={cv} className="pointer-events-none fixed inset-0 z-[80]" aria-hidden />;
}
