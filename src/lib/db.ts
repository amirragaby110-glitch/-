"use client";
// 🗄 پایگاه‌دادهٔ محلیِ کاربران — Dexie/IndexedDB (ثبت اطلاعات + تصاویر، آفلاین، روی گوشی و دسکتاپ)
import Dexie, { type Table } from "dexie";

export type EntryType = "fun" | "horror" | "fanfic" | "gallery" | "watchlink" | "theory";
export interface UserEntry {
  id?: number; type: EntryType;
  title: string; text: string;
  cat: string; tags: string;
  img?: string; // dataURL فشرده‌شده
  meta?: string; // json (قسمت/شخصیت/لینک ویدیو…)
  createdAt: number; author: string;
  likes: number;
}
class NexusDB extends Dexie {
  entries!: Table<UserEntry, number>;
  constructor() {
    super("gf-nexus");
    this.version(1).stores({ entries: "++id, type, createdAt, title, cat" });
  }
}
export const db = new NexusDB();

export async function addEntry(e: Omit<UserEntry, "id" | "createdAt" | "likes">) {
  return db.entries.add({ ...e, createdAt: Date.now(), likes: 0 });
}
export async function likeEntry(id: number) {
  const e = await db.entries.get(id);
  if (e) await db.entries.update(id, { likes: (e.likes || 0) + 1 });
}
export async function removeEntry(id: number) { return db.entries.delete(id); }
export async function allEntries(type?: EntryType) {
  const rows = type ? await db.entries.where("type").equals(type).toArray() : await db.entries.toArray();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}
export async function exportAll() {
  const rows = await db.entries.toArray();
  return JSON.stringify({ app: "gravity-falls-ultimate-nexus", exportedAt: new Date().toISOString(), entries: rows }, null, 2);
}
export async function importJSON(json: string) {
  const p = JSON.parse(json);
  if (!Array.isArray(p.entries)) throw new Error("ساختار نامعتبر است");
  let n = 0;
  for (const e of p.entries) { try { await db.entries.add({ ...e, id: undefined }); n++; } catch { } }
  return n;
}
// فشرده‌سازی تصویرِ آپلودی در مرورگر
export function compressImage(file: File, max = 1000, q = 0.72): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", q));
      };
      img.onerror = rej; img.src = fr.result as string;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
export function dominantHue(dataUrl: string): Promise<{ hue: number; sat: number }> {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = 32; c.height = 32;
      const g = c.getContext("2d")!; g.drawImage(img, 0, 0, 32, 32);
      const d = g.getImageData(0, 0, 32, 32).data;
      let r = 0, gr = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4; r /= n * 255; gr /= n * 255; b /= n * 255;
      const mx = Math.max(r, gr, b), mn = Math.min(r, gr, b), l = (mx + mn) / 2;
      let h = 0;
      if (mx !== mn) {
        const s = mx - mn;
        h = mx === r ? 60 * (((gr - b) / s) % 6) : mx === gr ? 60 * ((b - r) / s + 2) : 60 * ((r - gr) / s + 4);
        if (h < 0) h += 360;
        res({ hue: Math.round(h), sat: Math.min(1, s / (1 - Math.abs(2 * l - 1) || 1)) });
        return;
      }
      res({ hue: 0, sat: 0 });
    };
    img.onerror = () => res({ hue: 260, sat: 0.5 });
    img.src = dataUrl;
  });
}
