"use client";
// 🖨 کارتِ اشتراک — رندرِ متن روی canvas با حال‌وهوایِ جنگل (بدون کتابخانه)
const W = 1200, H = 675;
const wrap = (ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines = 6) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = []; let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    if (lines.length === maxLines - 1 && ctx.measureText(cur + " …").width > maxW) { cur += "…"; break; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
};
function stars(ctx: CanvasRenderingContext2D) {
  let s = 1982;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.08 + rnd() * 0.5;
    const r = rnd() * 1.7 + 0.4;
    ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H * 0.62, r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function pines(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#04170c";
  let s = 618;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let x = -20;
  while (x < W + 40) {
    const w = 70 + rnd() * 90, h = 90 + rnd() * 150;
    ctx.beginPath(); ctx.moveTo(x, H - 120); ctx.lineTo(x + w / 2, H - 120 - h); ctx.lineTo(x + w, H - 120); ctx.closePath(); ctx.fill();
    x += w * 0.55;
  }
}
export async function renderShareCard(opts: { tag: string; title: string; body: string; accent?: "gold" | "magic" | "blood" }): Promise<{ dataUrl: string; blob: Blob }> {
  const { tag, title, body, accent = "gold" } = opts;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const cols = accent === "magic" ? ["#170a2c", "#2a1054", "#9d5cff"] : accent === "blood" ? ["#1c0608", "#420d10", "#ff5b4d"] : ["#04100a", "#0d2415", "#e0b64f"];
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, cols[0]); g.addColorStop(0.62, cols[1]); g.addColorStop(1, cols[0]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W - 260, 140, 10, W - 260, 140, 420);
  glow.addColorStop(0, cols[2] + "33"); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  stars(ctx); pines(ctx);
  // قابِ طلایی
  ctx.strokeStyle = cols[2]; ctx.globalAlpha = 0.55; ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.globalAlpha = 0.22; ctx.strokeRect(32, 32, W - 64, H - 64); ctx.globalAlpha = 1;
  // چشمِ بیل‌طورِ انتزاعی گوشه
  ctx.save(); ctx.translate(W - 120, H - 118);
  ctx.fillStyle = cols[2]; ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(58, 0); ctx.lineTo(0, 46); ctx.lineTo(-58, 0); ctx.closePath(); ctx.globalAlpha = 0.16; ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = cols[2]; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 7); ctx.fill();
  ctx.fillStyle = "#060400"; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); ctx.restore();
  // متن
  try { await (document as any).fonts?.ready; } catch { }
  ctx.direction = "rtl"; ctx.textAlign = "right";
  ctx.fillStyle = cols[2];
  ctx.font = "800 26px Vazirmatn, sans-serif";
  ctx.fillText(tag, W - 70, 108);
  ctx.fillStyle = "#fff7e6";
  ctx.font = "900 52px Vazirmatn, sans-serif";
  const tl = wrap(ctx, title, W - 160, 2);
  tl.forEach((l, i) => ctx.fillText(l, W - 70, 178 + i * 68));
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "500 30px Vazirmatn, sans-serif";
  const bl = wrap(ctx, body, W - 160, 6);
  const startY = 178 + tl.length * 68 + 26;
  bl.forEach((l, i) => ctx.fillText(l, W - 70, startY + i * 50));
  // امضا
  ctx.direction = "ltr"; ctx.textAlign = "left";
  ctx.fillStyle = cols[2]; ctx.font = "400 30px Creepster, cursive";
  ctx.fillText("GRAVITY FALLS · ULTIMATE NEXUS", 70, H - 68);
  ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "500 18px Vazirmatn, sans-serif";
  ctx.fillText(location.origin, 70, H - 40);
  const dataUrl = c.toDataURL("image/png");
  const blob: Blob = await new Promise(res => c.toBlob(b => res(b!), "image/png", 0.95));
  return { dataUrl, blob };
}
export async function shareCardBlob(blob: Blob, title: string): Promise<"shared" | "clipboard" | "none"> {
  const file = new File([blob], "gravity-falls-nexus.png", { type: "image/png" });
  try {
    const nav = navigator as any;
    if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file], title }); return "shared"; }
  } catch { }
  try {
    await nav_clipboard_image(blob);
    return "clipboard";
  } catch { }
  return "none";
}
async function nav_clipboard_image(blob: Blob) {
  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
}
