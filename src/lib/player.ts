// 🔊 موتور پخش نکسوس: پخش/جستجو/ولوم/شافل/تکرار + تحلیل‌گر برای ویژوالایزر
"use client";
import type { TrackDef } from "@/data/types";
import { renderTrack, peaks } from "./synth";

type Listener = () => void;

class NexusPlayer {
  ctx: AudioContext | null = null;
  master!: GainNode; analyser!: AnalyserNode; comp!: DynamicsCompressorNode;
  freqData: Uint8Array = new Uint8Array(0);
  buffers = new Map<string, AudioBuffer>();
  peaksMap = new Map<string, number[]>();
  source: AudioBufferSourceNode | null = null;
  el: HTMLAudioElement | null = null;
  elSrc: MediaElementAudioSourceNode | null = null;
  startedAt = 0; offset = 0; currentId = ""; duration = 0;
  playing = false; rendering = false; progress = 0; level = 0;
  volume = 0.85; muted = false;
  private ls = new Set<Listener>();

  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC({ latencyHint: "interactive" });
    this.comp = this.ctx.createDynamicsCompressor();
    this.comp.threshold.value = -10; this.comp.ratio.value = 2.2;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048; this.analyser.smoothingTimeConstant = 0.78;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(this.comp); this.comp.connect(this.analyser); this.analyser.connect(this.ctx.destination);
    return this.ctx;
  }
  subscribe(fn: Listener) { this.ls.add(fn); return () => { this.ls.delete(fn); }; }
  emit() { this.ls.forEach(f => { try { f(); } catch {} }); }

  async prepare(def: TrackDef): Promise<AudioBuffer> {
    this.ensure();
    const cached = this.buffers.get(def.id);
    if (cached) return cached;
    this.rendering = true; this.emit();
    const buf = await renderTrack(def);
    this.buffers.set(def.id, buf);
    this.peaksMap.set(def.id, peaks(buf));
    this.rendering = false; this.emit();
    return buf;
  }
  getPeaks(id: string) { return this.peaksMap.get(id) ?? []; }

  async playDef(def: TrackDef) {
    const ctx = this.ensure(); await ctx.resume();
    this.stopSource();
    const buf = await this.prepare(def);
    this.currentId = def.id; this.duration = buf.duration; this.offset = 0;
    this.playBufferAt(buf, 0);
    this.playing = true; this.emit();
  }
  playBufferAt(buf: AudioBuffer, at: number) {
    const ctx = this.ensure();
    this.stopSource();
    const src = ctx.createBufferSource(); src.buffer = buf;
    src.connect(this.master);
    src.start(0, Math.max(0, Math.min(at, buf.duration - 0.02)));
    this.source = src; this.startedAt = ctx.currentTime; this.offset = at;
    src.onended = () => { if (this.source === src) { this.playing = false; this.emit(); this.onEnded?.(); } };
  }
  onEnded: (() => void) | null = null;

  async playElement(el: HTMLAudioElement, url: string) {
    const ctx = this.ensure(); await ctx.resume();
    this.stopSource();
    this.el = el; el.crossOrigin = "anonymous";
    if (!this.elSrc) { try { this.elSrc = ctx.createMediaElementSource(el); this.elSrc.connect(this.master); } catch { } }
    this.currentId = "user"; this.el = el;
    el.addEventListener("loadedmetadata", () => { this.duration = el.duration || 0; this.emit(); });
    el.addEventListener("ended", () => { this.playing = false; this.emit(); this.onEnded?.(); });
    await el.play().catch(() => {});
    this.playing = true; this.emit();
  }
  stopSource() {
    try { this.source?.stop(); } catch {}
    this.source = null;
    if (this.el) { try { this.el.pause(); } catch {} }
  }
  pause() {
    if (!this.ctx) return;
    if (this.el && this.currentId === "user") { this.el.pause(); this.playing = false; this.emit(); return; }
    if (this.playing && this.source) { this.offset = this.time(); this.stopSource(); }
    this.playing = false; this.emit();
  }
  resume() {
    const ctx = this.ensure(); ctx.resume();
    if (this.el && this.currentId === "user") { this.el.play(); this.playing = true; this.emit(); return; }
    const buf = this.buffers.get(this.currentId);
    if (buf && !this.playing) { this.playBufferAt(buf, this.offset); this.playing = true; this.emit(); }
  }
  toggle() { this.playing ? this.pause() : this.resume(); }
  seek(t: number) {
    if (this.el && this.currentId === "user") { this.el.currentTime = t; this.emit(); return; }
    const buf = this.buffers.get(this.currentId);
    if (!buf) return;
    t = Math.max(0, Math.min(t, buf.duration - 0.05));
    if (this.playing) this.playBufferAt(buf, t); else { this.offset = t; this.playing = false; }
    this.emit();
  }
  time() {
    if (!this.ctx) return 0;
    if (this.el && this.currentId === "user") return this.el.currentTime || 0;
    return this.playing ? this.offset + (this.ctx.currentTime - this.startedAt) : this.offset;
  }
  setVolume(v: number) {
    this.volume = v;
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : v, this.ctx.currentTime, 0.02);
    this.emit();
  }
  setMuted(m: boolean) { this.muted = m; this.setVolume(this.volume); }

  tick() {
    if (!this.ctx || !this.analyser) return;
    this.analyser.getByteFrequencyData(this.freqData as Uint8Array<ArrayBuffer>);
    let sum = 0; for (let i = 0; i < 48; i++) sum += this.freqData[i];
    this.level = sum / 48 / 255;
    this.progress = this.duration ? Math.min(1, this.time() / this.duration) : 0;
  }
}
export const player = new NexusPlayer();

export function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
}
