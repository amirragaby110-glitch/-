// 🎨 پوسترِ رویه‌ایِ SVG (برای آیتم‌های بدون عکسِ گالری + آواتار شخصیت‌ها) — آفلاین و دترمینیستیک
import type { GalleryItem } from "@/data/types";
import type { Character } from "@/data/types";

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

export function posterSVG(item: { hue: number; sat: number; fa: string; title: string }, seedStr: string, w = 640, h = 880) {
  const seed = hash(seedStr);
  const rnd = (i: number) => (((seed >> (i * 3)) & 1023) / 1023);
  const hue = item.hue, sat = Math.round(item.sat * 80 + 20);
  const sky = `hsl(${hue} ${sat}% 12%)`, sky2 = `hsl(${(hue + 30) % 360} ${sat}% 26%)`;
  const accent = `hsl(${(hue + 45) % 360} 90% 62%)`;
  const trees: string[] = [];
  const nTrees = 7 + ((seed % 5));
  for (let i = 0; i < nTrees; i++) {
    const x = (rnd(i * 2 + 1) * (w + 200) - 100) | 0;
    const th = (h * (0.22 + rnd(i * 5 + 2) * 0.3)) | 0;
    const tw = (th * 0.42) | 0;
    const base = h - 60 + rnd(i * 3) * 50;
    trees.push(`<path d="M${x},${base} L${x + tw},${base} L${x + tw * 0.55},${base - th * 0.35} L${x + tw * 0.75},${base - th * 0.35} L${x + tw * 0.4},${base - th * 0.72} L${x + tw * 0.6},${base - th * 0.72} L${x + tw * 0.28},${base - th} L${x - tw * 0.04},${base - th * 0.72} L${x + tw * 0.16},${base - th * 0.72} L${x - tw * 0.19},${base - th * 0.35} L${x + tw * 0.01},${base - th * 0.35} Z" fill="hsl(${(hue + 180) % 360} ${sat * 0.5}% ${5 + rnd(i) * 6}%)" opacity="${0.75 + rnd(i * 7) * 0.25}"/>`);
  }
  const eyeY = (h * (0.2 + rnd(3) * 0.16)) | 0, eyeR = (w * (0.1 + rnd(9) * 0.08)) | 0;
  const showEye = seed % 5 !== 0;
  const eye = showEye ? `<g transform="translate(${w / 2},${eyeY})">
    <polygon points="0,${-eyeR * 1.35} ${eyeR * 1.5},${eyeR} ${-eyeR * 1.5},${eyeR}" fill="${accent}" opacity="0.16"/>
    <ellipse rx="${eyeR}" ry="${eyeR * 0.66}" fill="#0b0b10" stroke="${accent}" stroke-width="${eyeR * 0.08}"/>
    <circle r="${eyeR * 0.3}" fill="${accent}"/><circle r="${eyeR * 0.12}" fill="#0b0b10"/></g>` : "";
  const lines = item.fa.split("·").slice(0, 2).map(s => s.trim()).filter(Boolean);
  const text = lines.map((ln, i) => `<text x="${w / 2}" y="${h - 118 + i * 64}" text-anchor="middle" font-family="vazir, Tahoma, sans-serif" direction="rtl" font-size="${44 - i * 8}" font-weight="800" fill="hsl(${hue} 30% 94%)">${esc(ln)}</text>`).join("");
  const stars = Array.from({ length: 26 }, (_, i) => `<circle cx="${(rnd(i * 11 + 4) * w) | 0}" cy="${(rnd(i * 13 + 5) * h * 0.5) | 0}" r="${(rnd(i * 17) * 2 + 0.4).toFixed(1)}" fill="#fff" opacity="${(0.2 + rnd(i * 19) * 0.7).toFixed(2)}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sk${seed % 999}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky2}"/><stop offset="1" stop-color="${sky}"/></linearGradient>
    <radialGradient id="gl${seed % 999}" cx="0.5" cy="${(eyeY / h).toFixed(2)}" r="0.7"><stop offset="0" stop-color="${accent}" stop-opacity="0.28"/><stop offset="1" stop-opacity="0"/></radialGradient>
    <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sk${seed % 999})"/>
  ${stars}
  <rect width="${w}" height="${h}" fill="url(#gl${seed % 999})"/>
  <circle cx="${(w * (0.72 + rnd(6) * 0.2)) | 0}" cy="${(h * 0.14) | 0}" r="${(w * 0.07) | 0}" fill="hsl(${(hue + 60) % 360} 60% 88%)" opacity="0.85"/>
  ${eye}${trees.join("")}
  <rect y="${h - 170}" width="${w}" height="170" fill="#000" opacity="0.34"/>
  ${text}
  <text x="${w / 2}" y="42" text-anchor="middle" font-family="monospace" font-size="15" fill="#fff" opacity="0.45">GRAVITY FALLS • NEXUS ARCHIVE ${item.title ? "" : ""}</text>
  <rect width="${w}" height="${h}" filter="url(#gr)" opacity="0.55"/>
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="hsl(${hue} 40% 70%)" stroke-opacity="0.25" stroke-width="2"/>
</svg>`;
}
export const posterUrl = (item: { hue: number; sat: number; fa: string; title: string }, seedStr: string, w = 640, h = 880) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(posterSVG(item, seedStr, w, h))}`;

export const galleryPoster = (g: GalleryItem, w = 640) => posterUrl(g, g.id, w, Math.round(w * (g.aspect ?? 0.72) + 240));
export const charPoster = (c: Character, w = 560) => {
  const hue = parseInt(c.color.slice(1), 16) % 360;
  return posterUrl({ hue, sat: 0.55, fa: c.fa, title: c.name }, c.id, w, Math.round(w * 1.15));
};
