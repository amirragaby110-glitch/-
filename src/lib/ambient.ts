"use client";
// 🌫 موتورِ «هووم!» — صدای آمبینتِ ترسناکِ زنده: درون + باد + قطره + پینگِ جعبه‌موسیقی
class AmbientEngine {
  ctx: AudioContext | null = null; nodes: AudioNode[] = []; srcs: AudioBufferSourceNode[] = []; on = false;
  timer = 0;
  start(vol = 0.5) {
    if (this.on) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = (this.ctx = this.ctx || new AC());
    ctx.resume();
    this.on = true;
    const out = ctx.createGain(); out.gain.value = vol; out.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 300; lp.connect(out);
    for (const f of [55, 55 * 1.005, 82.5]) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = f > 60 ? 0.12 : 0.3;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06 + Math.random() * 0.08;
      const lg = ctx.createGain(); lg.gain.value = 0.07;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      o.connect(g); g.connect(lp); o.start();
      this.nodes.push(o, lfo, g, lp);
    }
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (0.4 + 0.6 * Math.sin(i / ctx.sampleRate));
    const wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = "bandpass"; wf.frequency.value = 420; wf.Q.value = 0.6;
    const wg = ctx.createGain(); wg.gain.value = 0.05;
    const wlfo = ctx.createOscillator(); wlfo.frequency.value = 0.09;
    const wlg = ctx.createGain(); wlg.gain.value = 260;
    wlfo.connect(wlg); wlg.connect(wf.frequency); wlfo.start();
    wind.connect(wf); wf.connect(wg); wg.connect(out); wind.start();
    this.srcs.push(wind);
    this.nodes.push(wlfo, wind, wf, wg, out);
    const ping = () => {
      if (!this.on) return;
      const t = ctx.currentTime + 0.05;
      const notes = [523.25, 587.33, 659.25, 783.99, 880];
      const f = notes[(Math.random() * notes.length) | 0];
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 2.6);
      this.timer = window.setTimeout(ping, 3500 + Math.random() * 7000);
    };
    this.timer = window.setTimeout(ping, 2000);
  }
  stop() {
    this.on = false;
    clearTimeout(this.timer);
    this.srcs.forEach(s => { try { s.stop(); } catch { } });
    this.nodes.forEach(n => { const nn = n as OscillatorNode; nn.stop && (async () => { try { nn.stop(); } catch { } })(); });
    this.nodes = []; this.srcs = [];
  }
  // صدای «پرش» برای جامپ‌اسکر
  jumpscare() {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = (this.ctx = this.ctx || new AC());
    const t = ctx.currentTime;
    const len = 0.8;
    const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.setValueAtTime(2400, t); bp.frequency.exponentialRampToValueAtTime(140, t + len); bp.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    s.connect(bp); bp.connect(g); g.connect(ctx.destination); s.start(t);
  }
}
export const ambient = new AmbientEngine();
