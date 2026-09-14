// 📺 منابع تماشای ویدیو: یوتیوب / آپارات / ویمیو / دیلی‌موشن + تبدیل لینک به embed
export const EMBEDS = {
  themeYt: "https://www.youtube.com/embed/xr6WClFQfuY",
  themeFull: "https://www.youtube.com/embed/AaCFLJdFB8I",
  weirdOpen: "https://www.youtube.com/embed/6_t-aOeiFa0",
};
export const ytSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
export const aparatSearch = (q: string) => `https://www.aparat.com/result/${encodeURIComponent(q)}`;
export const vimeoSearch = (q: string) => `https://vimeo.com/search?q=${encodeURIComponent(q)}`;
export const dailymotionSearch = (q: string) => `https://www.dailymotion.com/search/${encodeURIComponent(q)}/videos`;
export const ytClip = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;
export const soundcloud = (q: string) => `https://soundcloud.com/search?q=${encodeURIComponent(q)}`;

export type Provider = "youtube" | "aparat" | "vimeo" | "dailymotion" | "soundcloud" | "file" | "unknown";
export function providerOf(url: string): Provider {
  const u = url.toLowerCase();
  if (u.includes("youtu")) return "youtube";
  if (u.includes("aparat")) return "aparat";
  if (u.includes("vimeo")) return "vimeo";
  if (u.includes("dailymotion") || u.includes("dai.li")) return "dailymotion";
  if (u.includes("soundcloud")) return "soundcloud";
  if (u.startsWith("blob:") || u.startsWith("data:") || /\.(mp4|webm|ogg|mov)(\?|$)/.test(u)) return "file";
  return "unknown";
}
export function toEmbed(url: string): { embed: string; provider: Provider } | null {
  const p = providerOf(url);
  if (p === "youtube") {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{6,})/);
    if (m) return { embed: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&autoplay=1`, provider: p };
  }
  if (p === "aparat") {
    const m = url.match(/video(?:embed)?\/(?:video\/)?([a-zA-Z0-9]+)/);
    const id = url.includes("/embed/") ? url : m ? `https://www.aparat.com/video/video/embed/videohash/${m[1]}/vt/frame?autoPlay=true` : null;
    if (id) return { embed: id as string, provider: p };
  }
  if (p === "vimeo") {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, provider: p };
  }
  if (p === "dailymotion") {
    const m = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (m) return { embed: `https://www.dailymotion.com/embed/video/${m[1]}?autoplay=1`, provider: p };
  }
  if (p === "soundcloud") return { embed: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23e0b64f&auto_play=true`, provider: p };
  if (p === "file") return { embed: url, provider: p };
  return null;
}
export const PROVIDER_LABEL: Record<Provider, { fa: string; emoji: string }> = {
  youtube: { fa: "یوتیوب", emoji: "▶️" },
  aparat: { fa: "آپارات", emoji: "🟠" },
  vimeo: { fa: "ویمیو", emoji: "🎞️" },
  dailymotion: { fa: "دیلی‌موشن", emoji: "🌀" },
  soundcloud: { fa: "ساندکلاد", emoji: "☁️" },
  file: { fa: "فایل محلی", emoji: "📁" },
  unknown: { fa: "لینک دلخواه", emoji: "🔗" },
};
