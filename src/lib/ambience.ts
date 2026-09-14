"use client";
// 🌫 میکسرِ صداهایِ شب — باد، باران، آتشِ کمپ و جیرجیرک؛ کاملاً سنتزشده با Web Audio
import { create } from "zustand";

export type AmbChan = "wind" | "rain" | "fire" | "night";
export const AMB_CHANNELS: { id: AmbChan; fa: string; icon: string }[] = [
  { id: "wind", fa: "بادِ کاج‌زار", icon: "🌬" },
  { id: "rain", fa: "بارانِ روی شیروانی", icon: "🌧" },
  { id: "fire", fa: "هیزمِ آتش", icon: "🔥" },
  { id: "night", fa: "جیرجیرکِ نیمه‌شب", icon: "🦗" },
];

interface AmbState {
  vols: Record<AmbChan, number>;
  master: number;
  running: boolean;
  setVol: (ch: AmbChan, v: number) => void;
  setMaster: (v: number) => void;
}
export const useAmb = create<AmbState>((set, get) => ({
  vols: { wind: 0, rain: 0, fire: 0, night: 0 },
  master: 0.7, running: false,
    setVol: (ch, v) => {
      set(s => ({ vols: { ...s.vols, [ch]: v } }));
      ambEngine.sync();
      if (v > 0) { ambEngine.ensureRunning(); markAmbUsed(); }
    },
    setMaster: v => { set({ master: v }); ambEngine.sync(); },
}));
let ticked = false;
function markAmbUsed() {
  if (ticked) return; ticked = true;
  import("./progress").then(m => m.bumpCounter("ambOn", 1, "صداهایِ جنگل روشن شد 🌫", 5));
}

function noiseBuffer(ctx: AudioContext, seconds: number, kind: "white" | "brown" | "crackle" | "drips"): AudioBuffer {
  const sr = ctx.sampleRate, len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  if (kind === "brown") {
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
  } else if (kind === "crackle") {
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 1.6; }
    let pos = 0;
    while (pos < len) {
      const l = 180 + ((Math.random() * 520) | 0);
      const amp = 0.15 + Math.random() * 0.85;
      for (let i = 0; i < l && pos + i < len; i++) d[pos + i] += (Math.random() * 2 - 1) * amp * Math.pow(1 - i / l, 5.5);
      pos += l + ((Math.random() * sr * 0.28) | 0);
    }
  } else if (kind === "drips") {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    let pos = 0;
    while (pos < len) {
      const l = 500 + ((Math.random() * 900) | 0);
      for (let i = 0; i < l && pos + i < len; i++) d[pos + i] *= 1 + 2.4 * Math.sin((i / l) * Math.PI) * Math.exp(-i / (l * 0.35));
      pos += l + ((Math.random() * sr * 0.7) | 0);
    }
  } else {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return buf;
}

class AmbEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  gains = new Map<AmbChan, GainNode>();
  started = false;
  ensureRunning() {
    if (this.started) { this.sync(); return; }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = (this.ctx = this.ctx || new AC());
    ctx.resume();
    this.master = ctx.createGain(); this.master.connect(ctx.destination);
    const mkLoop = (ch: AmbChan, buf: AudioBuffer, filter: (f: BiquadFilterNode) => void, extra?: (src: AudioBufferSourceNode, g: GainNode) => void) => {
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ctx.createBiquadFilter(); filter(f);
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(this.master!); src.start();
      this.gains.set(ch, g);
      extra?.(src, g);
    };
    // باد: قهوه‌ای + لوپس متحرک (گوست + بريم)
    {
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 6, "brown"); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 300; f.Q.value = 0.7;
      const gust = ctx.createOscillator(); gust.frequency.value = 0.07;
      const gustAmt = ctx.createGain(); gustAmt.gain.value = 190;
      gust.connect(gustAmt); gustAmt.connect(f.frequency); gust.start();
      const g = ctx.createGain(); g.gain.value = 0;
      const breath = ctx.createOscillator(); breath.frequency.value = 0.05;
      const breathAmt = ctx.createGain(); breathAmt.gain.value = 0.35;
      breath.connect(breathAmt); breathAmt.connect(g.gain); breath.start();
      src.connect(f); f.connect(g); g.connect(this.master!); src.start();
      this.gains.set("wind", g);
    }
    mkLoop("rain", noiseBuffer(ctx, 7, "white"), f => { f.type = "highpass"; f.frequency.value = 850; });
    mkLoop("fire", noiseBuffer(ctx, 8, "crackle"), f => { f.type = "lowpass"; f.frequency.value = 2600; });
    // جیرجیرک: نویزِ باندپس باریک با tremolo سریع (روی nodِ جدا تا در حالتِ خاموش صدا نشت نکند)
    {
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 6, "drips"); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 4300; f.Q.value = 14;
      const trem = ctx.createGain(); trem.gain.value = 0.55;
      const g = ctx.createGain(); g.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 26;
      const lg = ctx.createGain(); lg.gain.value = 0.4;
      lfo.connect(lg); lg.connect(trem.gain); lfo.start();
      src.connect(f); f.connect(trem); trem.connect(g); g.connect(this.master!); src.start();
      this.gains.set("night", g);
    }
    this.started = true;
    this.sync();
  }
  sync() {
    if (!this.ctx || !this.master) return;
    const st = useAmb.getState();
    this.master.gain.setTargetAtTime(st.running ? st.master * 0.9 : 0, this.ctx.currentTime, 0.15);
    (Object.keys(st.vols) as AmbChan[]).forEach(ch => {
      const g = this.gains.get(ch);
      if (g) g.gain.setTargetAtTime(st.vols[ch], this.ctx!.currentTime, 0.25);
    });
  }
  stop() {
    useAmb.setState({ vols: { wind: 0, rain: 0, fire: 0, night: 0 }, running: false });
    this.sync();
  }
}
export const ambEngine = new AmbEngine();

// همگام‌سازیِ «running» با مجموعِ والوم‌ها
useAmb.subscribe(s => {
  const any = Object.values(s.vols).some(v => v > 0.001);
  if (any !== s.running) { useAmb.setState({ running: any }); ambEngine.sync(); }
});
