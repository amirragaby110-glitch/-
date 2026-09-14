"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";
export interface Settings {
  theme: Theme;
  autoNight: boolean; // ساعت شهر: ۱۸ تا ۶ شب خودکار
  bgEnabled: boolean;
  bgDensity: number; // 0.2–1.6
  cursorTrail: boolean;
  soundFX: boolean; // صداهای ریزِ UI (کلیک، باز شدن در…)
  scaryAmbient: boolean; // هووم! صدای پس‌زمینهٔ ترسناک
  horrorMode: boolean; // افکت‌های ترس سراسری: ویگنت، اسکن‌لاین، چشم‌های غافلگیر
  reduceMotion: boolean;
  musicVolume: number;
}
interface Store extends Settings {
  set: (p: Partial<Settings>) => void;
  toggleTheme: () => void;
}
export const useSettings = create<Store>()(
  persist(
    (set, get) => ({
      theme: "dark", autoNight: false, bgEnabled: true, bgDensity: 1, cursorTrail: true,
      soundFX: true, scaryAmbient: false, horrorMode: false, reduceMotion: false, musicVolume: 0.85,
      set: p => set(p),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
    }),
    { name: "gf-nexus-settings", version: 1 }
  )
);

// موسیقی: انتخاب/شافل/تکرار + فهرست پخشِ سفارشی
export type RepeatMode = "off" | "one" | "all";
interface MusicState {
  current: string; shuffle: boolean; repeat: RepeatMode;
  queueOpen: boolean; embedFor: string | null;
  setCurrent: (id: string) => void; next: (ids: string[]) => void; prev: (ids: string[]) => void;
  toggle: (k: "shuffle") => void; cycleRepeat: () => void; setQueueOpen: (b: boolean) => void;
  setEmbed: (id: string | null) => void;
}
export const useMusic = create<MusicState>()((set, get) => ({
  current: "theme", shuffle: false, repeat: "all", queueOpen: false, embedFor: null,
  setCurrent: id => set({ current: id }),
  next: ids => {
    const { shuffle, current } = get();
    if (shuffle && ids.length) { let n = current; while (n === current && ids.length > 1) n = ids[(Math.random() * ids.length) | 0]; set({ current: n }); }
    else set({ current: ids[(ids.indexOf(current) + 1) % ids.length] ?? ids[0] });
  },
  prev: ids => set({ current: ids[(ids.indexOf(get().current) - 1 + ids.length) % ids.length] ?? ids[0] }),
  toggle: k => set(s => ({ [k]: !s[k] } as any)),
  cycleRepeat: () => set(s => ({ repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off" })),
  setQueueOpen: b => set({ queueOpen: b }),
  setEmbed: id => set({ embedFor: id }),
}));

// وضعیت جهانیِ «چشم» (اثر تعاملی روی همه‌جا)
export interface UIState { paletteOpen: boolean; setPalette: (b: boolean) => void; }
export const useUI = create<UIState>()(set => ({ paletteOpen: false, setPalette: b => set({ paletteOpen: b }) }));
