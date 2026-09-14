"use client";
// 🏅 موتورِ پیشرفتِ بازیکن: XP، سطح، رتبه، شمارشگرها و دستاوردها — ذخیره در localStorage
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENTS, type PView } from "@/data/achievements";

export interface AwardEvent {
  xp: number;
  label: string;
  kind: "xp" | "ach" | "level" | "scroll" | "gnome";
  icon?: string;
  title?: string;
}
function fire(ev: AwardEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AwardEvent>("gf-award", { detail: ev }));
}

/* سطح و رتبه */
export const levelOf = (xp: number) => 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 36));
export const xpForLevel = (lvl: number) => Math.round(Math.pow(lvl - 1, 2) * 36);
export const RANKS: [number, string][] = [
  [1, "توریستِ تازه‌وارد"], [2, "داوطلبِ کلبۀ رمز و راز"], [3, "کارآموزِ ژورنال ۳"],
  [4, "کاوشگرِ نیمه‌شب"], [5, "پاککنندۀ ردپا"], [6, "نگهبانِ آبشار"],
  [7, "رازدارِ شهر"], [8, "دوستِ (بد) بیل"], [9, "فرزندِ جنگل"], [10, "استادِ گرانش فالز"],
];
export const rankOf = (lvl: number) => [...RANKS].reverse().find(([l]) => lvl >= l)?.[1] ?? RANKS[0][1];
export function levelInfo(xp: number) {
  const lvl = levelOf(xp);
  const base = xpForLevel(lvl), next = xpForLevel(lvl + 1);
  const pct = next > base ? Math.min(1, (xp - base) / (next - base)) : 1;
  return { lvl, pct, toNext: Math.max(0, next - xp), rank: rankOf(lvl) };
}

export interface PState extends PView {
  earned: Record<string, number>; // idِ دستاورد → زمانِ باز شدن
  addXp: (n: number, label: string, kind?: AwardEvent["kind"], icon?: string) => void;
  bump: (key: string, n?: number, label?: string, xp?: number) => void;
  setBest: (key: string, v: number, label?: string, xp?: number) => void;
  collectGnome: (gid: string) => boolean;
  solveScroll: (sid: string, xp: number) => void;
  markTrack: (tid: string, title: string) => void;
  visitPage: (path: string) => void;
  resetAll: () => void;
}

const fresh = () => ({
  xp: 0, gnomes: [] as string[], scrolls: [] as string[], tracks: [] as string[],
  pages: [] as string[], c: {} as Record<string, number>, earned: {} as Record<string, number>,
});

/** دستاوردهایِ تازه را بررسی و «آنلاک» می‌کند؛ xpِ جایزه را اضافه می‌نماید */
function checkAch(s: PState): PState {
  let changed = false, xp = s.xp;
  const earned = { ...s.earned };
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (earned[a.id]) continue;
    if (a.cur(s) >= a.target) { earned[a.id] = Date.now(); xp += 15; changed = true; newly.push(a.id); }
  }
  if (!changed) return s;
  for (const id of newly) {
    const a = ACHIEVEMENTS.find(x => x.id === id)!;
    setTimeout(() => fire({ xp: 15, label: "دستاورد باز شد", kind: "ach", icon: a.icon, title: a.title }), 380);
  }
  return { ...s, earned, xp };
}

export const useProgress = create<PState>()(
  persist(
    (set, get) => {
      /** یک تغییرِ state + جایزۀ XP + رویدادِ شناور + بازبینیِ دستاوردها */
      const apply = (patch: (s: PState) => PState | null, ev?: { xp?: number; label: string; kind?: AwardEvent["kind"]; icon?: string; title?: string }) => {
        const prev = get();
        const lvlBefore = levelOf(prev.xp);
        const next = patch(prev);
        if (!next) return;
        const final = checkAch(next);
        set(final);
        if (ev) fire({ xp: ev.xp ?? 0, label: ev.label, kind: ev.kind ?? "xp", icon: ev.icon, title: ev.title });
        const lvlAfter = levelOf(final.xp);
        if (lvlAfter > lvlBefore)
          setTimeout(() => fire({ xp: 0, label: `سطحِ ${lvlAfter} — ${rankOf(lvlAfter)}`, kind: "level", icon: "⬆️" }), 520);
      };
      return {
        ...fresh(),
        addXp: (n, label, kind = "xp", icon) =>
          apply(s => ({ ...s, xp: s.xp + n }), { xp: n, label, kind, icon }),
        bump: (key, n = 1, label, xp = 1) =>
          apply(s => ({ ...s, c: { ...s.c, [key]: (s.c[key] ?? 0) + n }, xp: s.xp + xp }),
            label ? { xp, label } : undefined),
        setBest: (key, v, label, xp) =>
          apply(s => v <= (s.c[key] ?? 0) ? null : {
            ...s, c: { ...s.c, [key]: v }, xp: s.xp + (xp ?? Math.min(20, Math.max(4, Math.round(v / 2)))),
          }, label ? { xp: xp ?? 0, label } : undefined),
        collectGnome: gid => {
          if (get().gnomes.includes(gid)) return false;
          apply(s => ({ ...s, gnomes: [...s.gnomes, gid], xp: s.xp + 3 }), { xp: 3, label: "گنوم پیدا شد!", kind: "gnome", icon: "🍄" });
          return true;
        },
        solveScroll: (sid, xp) =>
          apply(s => s.scrolls.includes(sid) ? null : { ...s, scrolls: [...s.scrolls, sid], xp: s.xp + xp },
            { xp, label: "طومارِ رمز باز شد!", kind: "scroll", icon: "🗝" }),
        markTrack: (tid, title) =>
          apply(s => s.tracks.includes(tid) ? null : { ...s, tracks: [...s.tracks, tid], xp: s.xp + 3 },
            { xp: 3, label: `اولین پخشِ «${title}»` }),
        visitPage: path =>
          apply(s => s.pages.includes(path) ? null : { ...s, pages: [...s.pages, path], xp: s.xp + 1 }),
        resetAll: () => set({ ...fresh() } as PState),
      };
    },
    { name: "gf-nexus-progress", version: 1 }
  )
);

/* شیم‌هایِ راحت برای صدا زدن از سراسرِ اپ */
export const addXp = (n: number, label: string, kind: AwardEvent["kind"] = "xp", icon?: string) => {
  if (typeof window !== "undefined") useProgress.getState().addXp(n, label, kind, icon);
};
export const bumpCounter = (key: string, n = 1, label?: string, xp = 1) => {
  if (typeof window !== "undefined") useProgress.getState().bump(key, n, label, xp);
};
export const bestCounter = (key: string, v: number, label?: string, xp?: number) => {
  if (typeof window !== "undefined") useProgress.getState().setBest(key, v, label, xp);
};
export const collectGnome = (gid: string) => typeof window !== "undefined" && useProgress.getState().collectGnome(gid);
export const solveScroll = (sid: string, xp: number) => { if (typeof window !== "undefined") useProgress.getState().solveScroll(sid, xp); };
export const markTrackPlayed = (tid: string, title: string) => { if (typeof window !== "undefined") useProgress.getState().markTrack(tid, title); };
export const exportProgress = () => JSON.stringify(useProgress.getState(), (k, v) => (typeof v === "function" ? undefined : v), 2);
export function importProgress(json: string): boolean {
  try {
    const o = JSON.parse(json);
    if (typeof o?.xp !== "number") throw 0;
    useProgress.setState({ xp: o.xp, gnomes: o.gnomes ?? [], scrolls: o.scrolls ?? [], tracks: o.tracks ?? [], pages: o.pages ?? [], c: o.c ?? {}, earned: o.earned ?? {} });
    return true;
  } catch { return false; }
}
export const isScrollSolved = (sid: string) => typeof window !== "undefined" && useProgress.getState().scrolls.includes(sid);
