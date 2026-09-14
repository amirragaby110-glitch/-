// 🎛 موتور نکسوس‌سوند: ملودی‌گراف → آدیوبافر کامل (آفلاین، با روریب، دیلی و درامز سبک‌محور)
import type { TrackDef, Style } from "@/data/types";

const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

const MIN = [0, 2, 3, 5, 7, 8, 10], MAJ = [0, 2, 4, 5, 7, 9, 11];
interface Ch { tones: number[]; root: number }
function chordAt(def: TrackDef, bar: number): Ch {
  const [off, q] = def.prog[bar % def.prog.length];
  const base = def.root + off;
  const tones =
    q === "M" ? [0, 4, 7] : q === "m" ? [0, 3, 7] : q === "7" ? [0, 4, 7, 10] :
    q === "m7" ? [0, 3, 7, 10] : q === "maj7" ? [0, 4, 7, 11] : q === "dim" ? [0, 3, 6] : q === "sus" ? [0, 5, 7] : [0, 4, 7];
  return { tones: tones.map(t => base + t), root: base };
}
interface Ev { t: number; d: number; m: number; v: number; kind: VoiceKind }
type VoiceKind = "bell" | "organ" | "saw" | "pluck" | "pad" | "bass" | "kick" | "snare" | "hat" | "rim" | "brass" | "wind";

// ── تولید رویدادهای موسیقایی بر اساس سبک ──
export function eventsFor(def: TrackDef): Ev[] {
  const rand = mulberry(hash(def.id));
  const beat = 60 / def.bpm, ts = def.timeSig ?? 4, bar = ts * beat;
  const scale = def.minor ? MIN : MAJ;
  const evs: Ev[] = [];
  const push = (t: number, d: number, m: number, kind: VoiceKind, v = 0.8) => {
    if (t < def.bars * bar - 0.05) evs.push({ t, d, m, v, kind });
  };
  const deg2midi = (deg: number, ch: Ch) => {
    const s = ((deg % 7) + 7) % 7, oct = Math.floor(deg / 7) * 12;
    let note = def.root + scale[s] + oct;
    if (s === 0) note = ch.tones[0] % 12 === note % 12 ? note : ch.tones[0] + oct + 12 * Math.round((note - ch.tones[0]) / 12);
    return note;
  };
  const drumsOn = !["ambient", "musicbox", "lullaby", "lofi", "waltz", "dark"].includes(def.style) || def.style === "waltz" ? true : false;
  const swing = def.style === "swing" || def.style === "jazznoir";
  const motif = def.motif.length ? def.motif : [0, 2, 4, 7, 4, 2, 0, -1];

  for (let b = 0; b < def.bars; b++) {
    const t0 = b * bar; const ch = chordAt(def, b);
    const ph = Math.floor(b / 4) % 4, half = b >= def.bars / 2;
    const trans = half ? (ph === 1 ? 12 : 0) : 0;

    // ملودی: موتیف ۱۶گامی با تنوع سِلد
    const melodyKind: VoiceKind =
      def.style === "circus" ? "organ" : def.style === "musicbox" || def.style === "lullaby" ? "bell" :
      def.style === "ambient" || def.style === "lofi" ? "bell" : def.style === "epic" ? "brass" :
      def.style === "disco" ? "pluck" : "saw";
    const melOn = ph !== 0 || b < 4 || rand() > 0.35;
    if (melOn) {
      const step = beat / 2;
      for (let i = 0; i < 16; i++) {
        const deg = motif[i % motif.length];
        if (deg < 0) continue;
        if (rand() < (def.style === "ambient" ? 0.62 : 0.18)) continue;
        let dd = deg;
        if (def.style === "swing" && rand() < 0.3) dd += rand() < 0.5 ? 1 : -1;
        const m = deg2midi(dd + trans, ch) + (def.style === "musicbox" || def.style === "lullaby" ? 12 : 12);
        const off = swing && i % 2 === 1 ? step * 0.16 : 0;
        push(t0 + i * step + off, Math.min(step * (rand() < 0.2 ? 3 : 1.4), bar), m, melodyKind, 0.55 + rand() * 0.4);
      }
    }
    if (b < 2 && def.style !== "ambient") continue; // اینترو

    // باس + هارمونی + درامز بر اساس سبک
    const st: Style = def.style;
    if (st === "circus" || st === "polka") {
      for (let k = 0; k < ts; k += 2) push(t0 + k * beat, beat * 1.6, ch.root - 12, "bass", 0.9);
      for (let k = 1; k < ts; k += 2) ch.tones.forEach(x => push(t0 + k * beat, beat * 0.9, x, "organ", 0.4));
      if (drumsOn) { push(t0, 0.1, 0, "rim", 0.5); if (rand() < 0.25) push(t0 + bar - beat / 2, 0.1, 0, "rim", 0.6); }
    } else if (st === "swing" || st === "jazznoir") {
      for (let k = 0; k < ts; k++) { const nn = k === 2 && rand() < 0.6 ? ch.tones[(rand() * 3) | 0] : ch.root; push(t0 + k * beat, beat * 0.9, nn - 12, "bass", 0.8); }
      if (rand() < 0.5) ch.tones.forEach(x => push(t0 + (1.75 + (rand() < 0.3 ? 0.25 : 0)) * beat, beat * 0.6, x, "pluck", 0.35));
      push(t0, 0.1, 0, "kick", 0.5); push(t0 + 2 * beat, 0.1, 0, "kick", 0.45);
      for (let k = 0; k < ts * 2; k++) push(t0 + (swing && k % 2 ? k * beat / 2 + beat * 0.12 : k * beat / 2), 0.05, 0, "hat", 0.18 + (k % 2 ? 0.08 : 0));
      if (rand() < 0.4) push(t0 + bar - beat, 0.1, 0, "rim", 0.5);
    } else if (st === "surf" || st === "anthem") {
      for (let k = 0; k < ts * 2; k++) push(t0 + k * (beat / 2), beat * 0.42, ch.root - 12, "bass", 0.85);
      if (st === "surf" && rand() < 0.7) ch.tones.forEach(x => push(t0 + beat / 2, beat * 2.4, x + 12, "pluck", 0.3));
      if (st === "anthem") ch.tones.forEach(x => push(t0, bar * 0.98, x, "pad", 0.3));
      push(t0, 0.1, 0, "kick", 0.95); push(t0 + 2 * beat, 0.12, 0, "snare", 0.9);
      if (st === "anthem") { push(t0 + ts - 1 >= 0 ? t0 + 2 * beat : t0, 0.1, 0, "kick", 0.8); }
      for (let k = 0; k < ts * 2; k++) push(t0 + k * beat / 2, 0.04, 0, "hat", 0.3);
      if (rand() < 0.3) { push(t0 + 3 * beat, 0.12, 0, "snare", 0.8); push(t0 + 3.5 * beat, 0.12, 0, "snare", 0.9); }
    } else if (st === "disco") {
      for (let k = 0; k < ts; k++) { push(t0 + k * beat + beat / 2, beat * 0.45, ch.root - 12 + 12, "bass", 0.8); push(t0 + k * beat + beat / 2, beat * 0.4, ch.root - 12, "bass", 0.9); }
      ch.tones.forEach(x => push(t0 + beat / 2, beat * 0.3, x + 12, "pluck", 0.35));
      push(t0, 0.1, 0, "kick", 0.9); push(t0 + beat, 0.1, 0, "kick", 0.75); push(t0 + 2 * beat, 0.1, 0, "kick", 0.9); push(t0 + 3 * beat, 0.1, 0, "kick", 0.75);
      push(t0 + 2 * beat, 0.13, 0, "snare", 0.7);
      for (let k = 0; k < ts * 2; k++) push(t0 + k * beat / 2 + beat / 4, 0.03, 0, "hat", k % 2 ? 0.24 : 0.4);
    } else if (st === "waltz" || st === "musicbox" || st === "lullaby" || st === "dark") {
      push(t0, bar * 0.9, ch.root - 12, st === "dark" ? "pad" : "bass", st === "musicbox" || st === "lullaby" ? 0.4 : 0.7);
      if (st !== "musicbox" && st !== "lullaby") ch.tones.forEach(x => push(t0 + beat, st === "dark" ? bar : beat * 1.8, x, st === "dark" ? "pad" : "pluck", 0.3));
      if (st === "waltz" && rand() < 0.5) push(t0 + 2 * beat, 0.1, 0, "rim", 0.45);
      if (st === "dark") push(t0 + beat / 2, bar * 0.4, ch.root - 24, "wind", 0.25);
    } else if (st === "epic") {
      for (let k = 0; k < ts; k += 2) push(t0 + k * beat, bar, ch.root - 24, "bass", 0.9);
      ch.tones.forEach(x => push(t0, bar * 0.95, x, "brass", 0.4));
      push(t0, 0.16, 0, "kick", 0.95); if (ts >= 4) push(t0 + 2 * beat, 0.16, 0, "snare", 0.8);
      if (rand() < 0.55) push(t0 + (ts - 1) * beat, 0.2, 0, "kick", 0.8);
      ch.tones.forEach(x => push(t0, bar * 0.95, x - 24, "pad", 0.25));
    } else if (st === "lofi") {
      for (let k = 0; k < ts; k++) if (rand() < 0.8) push(t0 + k * beat + (rand() - 0.5) * 0.02, beat * 0.9, ch.root - 12, "bass", 0.55);
      ch.tones.forEach((x, i) => push(t0 + beat + i * 0.01, beat * 2, x, "pluck", 0.3));
      push(t0 + beat, 0.1, 0, "kick", 0.4); push(t0 + 3 * beat, 0.1, 0, "snare", 0.25);
      for (let k = 0; k < ts * 2; k++) push(t0 + k * beat / 2, 0.03, 0, "hat", 0.1);
    } else { // ambient
      ch.tones.forEach(x => push(t0, bar * 1.05, x, "pad", 0.3));
      push(t0, bar, ch.root - 24, "pad", 0.22);
      if (rand() < 0.4) push(t0 + rand() * bar, 0.4, 45 + ((rand() * 12) | 0), "wind", 0.3);
    }
  }
  // اُترو: نت تونیک کشیده
  const last = (def.bars - 1.6) * bar;
  const chEnd = chordAt(def, def.bars - 1);
  push(last, def.bars * bar - last, chEnd.root + 12, def.style === "epic" || def.style === "anthem" ? "brass" : "pad", 0.5);
  evs.sort((a, b) => a.t - b.t);
  return evs;
}

// ── صدا‌سازها ──
function makeIR(ctx: BaseAudioContext, secs = 1.6, decay = 3): AudioBuffer {
  const b = ctx.createBuffer(2, ctx.sampleRate * secs, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, decay);
  }
  return b;
}
let noiseBuf: AudioBuffer | null = null;
function noise(ctx: BaseAudioContext): AudioBuffer {
  if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
  const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  if (ctx instanceof OfflineAudioContext) noiseBuf = b;
  return b;
}
function envGain(ctx: BaseAudioContext, t: number, dur: number, peak: number, a = 0.008, r = 0.08): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setValueAtTime(peak, t + Math.max(a, dur - r));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return g;
}
function osc1(ctx: BaseAudioContext, kind: OscillatorType, f: number, det = 0) {
  const o = ctx.createOscillator(); o.type = kind; o.frequency.value = f; o.detune.value = det; return o;
}

export function voice(ctx: BaseAudioContext, e: Ev, dest: AudioNode, wet: AudioNode) {
  const { t, d, m, v, kind } = e, f = midiHz(m);
  switch (kind) {
    case "kick": {
      const o = osc1(ctx, "sine", 150); const g = envGain(ctx, t, Math.max(0.12, d), v, 0.001, 0.1);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.09);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.15); break;
    }
    case "snare": case "hat": case "rim": {
      const s = ctx.createBufferSource(); s.buffer = noise(ctx);
      const bp = ctx.createBiquadFilter(); bp.type = kind === "hat" ? "highpass" : kind === "rim" ? "bandpass" : "bandpass";
      bp.frequency.value = kind === "hat" ? 8200 : kind === "rim" ? 1900 : 2300; bp.Q.value = kind === "hat" ? 0.8 : 2;
      const g = envGain(ctx, t, Math.max(0.03, kind === "hat" ? 0.05 : kind === "rim" ? 0.12 : 0.18), v * (kind === "hat" ? 0.5 : 0.8), 0.001, 0.04);
      s.connect(bp); bp.connect(g); g.connect(dest); if (kind === "snare") g.connect(wet); s.start(t); s.stop(t + 0.3); break;
    }
    case "bell": {
      for (const [ratio, mul, dec] of [[1, 1, 1], [2.76, 0.32, 0.7], [5.4, 0.12, 0.45]] as const) {
        const o = osc1(ctx, "sine", f * ratio);
        const g = envGain(ctx, t, d * dec + 0.2, v * mul * 0.5, 0.002, d * dec * 0.8);
        o.connect(g); g.connect(dest); if (ratio === 1) g.connect(wet);
        o.start(t); o.stop(t + d * dec + 0.5);
      } break;
    }
    case "organ": case "pluck": case "wind": {
      const g = envGain(ctx, t, d + (kind === "wind" ? 0.6 : 0.1), v * 0.5, kind === "wind" ? 0.15 : kind === "pluck" ? 0.002 : 0.02, kind === "pluck" ? Math.min(0.4, d * 0.6) : 0.15);
      if (kind === "wind") {
        const s = ctx.createBufferSource(); s.buffer = noise(ctx); s.loop = true;
        const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = 1.5;
        s.connect(bp); bp.connect(g); g.connect(dest); g.connect(wet); s.start(t); s.stop(t + d + 0.8);
      } else {
        for (const [type, amp, det, harm] of kind === "organ" ? [["sine", 1, 0, 1], ["square", 0.35, 4, 2], ["sine", 0.5, -3, 0.5]] as const : [["sawtooth", 1, 0, 1], ["sawtooth", 0.6, 7, 1]] as const) {
          const o = osc1(ctx, type as OscillatorType, f * (harm === 0.5 ? 2 : harm), det);
          const vg = envGain(ctx, t, d + 0.1, v * amp * 0.35, 0.004, kind === "pluck" ? 0.25 : 0.1);
          const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = kind === "pluck" ? 3200 : 2500;
          o.connect(vg); vg.connect(lp); lp.connect(g); g.connect(dest);
          o.start(t); o.stop(t + d + (kind === "pluck" ? 0.5 : 0.2));
        }
      } break;
    }
    case "bass": {
      const g = envGain(ctx, t, Math.min(d, 0.9) + 0.05, v * 0.6, 0.006, 0.1);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 620;
      for (const [type, amp, det] of [["triangle", 1, 0], ["sawtooth", 0.4, -5]] as const) {
        const o = osc1(ctx, type as OscillatorType, f, det); const vg = ctx.createGain(); vg.gain.value = amp;
        o.connect(vg); vg.connect(lp); lp.connect(g); g.connect(dest); o.start(t); o.stop(t + Math.min(d, 0.9) + 0.2);
      } break;
    }
    case "pad": {
      const g = envGain(ctx, t, d + 0.4, v * 0.4, Math.min(0.35, d / 3), Math.min(0.5, d / 4));
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500 + f * 3;
      const lfo = osc1(ctx, "sine", 0.13 + (m % 3) * 0.02); const lg = ctx.createGain(); lg.gain.value = 220;
      lfo.connect(lg); lg.connect(lp.frequency); lfo.start(t); lfo.stop(t + d + 1);
      for (const det of [-9, 0, 7, 14]) {
        const o = osc1(ctx, det % 7 === 0 ? "sawtooth" : "triangle", f, det);
        const vg = ctx.createGain(); vg.gain.value = 0.5;
        o.connect(vg); vg.connect(lp); lp.connect(g); g.connect(dest); g.connect(wet); o.start(t); o.stop(t + d + 0.9);
      } break;
    }
    case "saw": {
      const g = envGain(ctx, t, d + 0.06, v * 0.42, 0.01, 0.09);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2800;
      const vib = osc1(ctx, "sine", 5.4); const vg2 = ctx.createGain(); vg2.gain.value = 6;
      vib.connect(vg2); vib.start(t); vib.stop(t + d + 0.2);
      for (const det of [-6, 6]) { const o = osc1(ctx, "sawtooth", f, det); vg2.connect(o.detune); o.connect(lp); o.start(t); o.stop(t + d + 0.1); }
      lp.connect(g); g.connect(dest); break;
    }
    case "brass": {
      const g = envGain(ctx, t, d + 0.2, v * 0.45, 0.05, 0.2);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800; lp.Q.value = 1.2;
      for (const [type, det, amp] of [["sawtooth", 0, 1], ["sawtooth", -12, 0.5], ["square", 7, 0.3]] as const) {
        const o = osc1(ctx, type as OscillatorType, f, det); const og = ctx.createGain(); og.gain.value = amp;
        o.connect(og); og.connect(lp); o.start(t); o.stop(t + d + 0.3);
      }
      lp.connect(g); g.connect(dest); g.connect(wet); break;
    }
  }
}

// ── رندر نهایی ──
export async function renderTrack(def: TrackDef, opts?: { sampleRate?: number }): Promise<AudioBuffer> {
  const sr = opts?.sampleRate ?? 44100;
  const beat = 60 / def.bpm, ts = def.timeSig ?? 4;
  const dur = def.bars * ts * beat + 2.5;
  const ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  const master = ctx.createGain(); master.gain.value = 0.85;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 3.5; comp.attack.value = 0.003; comp.release.value = 0.18;
  const conv = ctx.createConvolver(); conv.buffer = makeIR(ctx, def.style === "ambient" || def.style === "epic" ? 3 : 1.6, def.style === "musicbox" || def.style === "lullaby" ? 5 : 2.6);
  const wetG = ctx.createGain(); wetG.gain.value = def.style === "musicbox" || def.style === "lullaby" || def.style === "ambient" || def.style === "dark" ? 0.5 : 0.2;
  const delay = ctx.createDelay(1); delay.delayTime.value = (60 / def.bpm) * 0.75;
  const fb = ctx.createGain(); fb.gain.value = def.style === "disco" || def.style === "epic" || def.style === "circus" ? 0.32 : 0.18;
  const dl = ctx.createGain(); dl.gain.value = 0.25;
  delay.connect(fb); fb.connect(delay); delay.connect(master);
  const wet = ctx.createGain(); wet.gain.value = 1; wet.connect(conv); conv.connect(wetG); wetG.connect(master);
  wet.connect(delay);
  master.connect(comp); comp.connect(ctx.destination);
  const evs = eventsFor(def);
  for (const e of evs) {
    let dest: AudioNode = master;
    if (e.kind === "saw" || e.kind === "bell" || e.kind === "pluck") dest = ctx.createGain(), (dest as GainNode).connect(master), (dest as GainNode).connect(delay);
    voice(ctx, e, dest, wet);
  }
  const buf = await ctx.startRendering();
  return buf;
}

export function peaks(buf: AudioBuffer, buckets = 700): number[] {
  const ch = buf.getChannelData(0), n = Math.min(ch.length, Math.floor(buf.sampleRate * 600));
  const size = Math.floor(ch.length / buckets), out: number[] = [];
  for (let b = 0; b < buckets; b++) {
    let mx = 0; const s = b * size;
    for (let i = 0; i < size; i += 8) { const a = Math.abs(ch[s + i] || 0); if (a > mx) mx = a; }
    out.push(mx);
  }
  return out;
}
