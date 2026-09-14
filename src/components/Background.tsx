"use client";
// 🌌 پس‌زمینۀ زندهٔ گرانش فالز — Three.js: ستارهٔ چشمک‌زن، باران برگ کاج، غبار بنفشِ بیل،
//    چشم‌های شناور، پارالاکسِ ماوس/اسکرول، روز⇔شب، و تنظیمات چگالی.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSettings } from "@/lib/store";

function starTexture(): THREE.Texture {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.25, "rgba(255,244,200,0.8)"); gr.addColorStop(1, "rgba(255,244,200,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); return t;
}
function needleTexture(): THREE.Texture {
  const c = document.createElement("canvas"); c.width = 128; c.height = 128;
  const g = c.getContext("2d")!;
  g.strokeStyle = "rgba(46,86,48,0.95)"; g.lineWidth = 5; g.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const y = 24 + i * 12;
    g.beginPath(); g.moveTo(64, y - 4); g.lineTo(64 + (i % 2 ? 34 : 30), y + 10); g.stroke();
    g.beginPath(); g.moveTo(64, y - 4); g.lineTo(64 - (i % 2 ? 30 : 34), y + 10); g.stroke();
  }
  g.strokeStyle = "rgba(30,58,34,0.95)"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(64, 16); g.lineTo(64, 116); g.stroke();
  return new THREE.CanvasTexture(c);
}
function eyeTexture(blink = false): THREE.Texture {
  const c = document.createElement("canvas"); c.width = 256; c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(8,6,14,0.9)"; g.beginPath(); g.ellipse(128, 128, 110, 68, 0, 0, Math.PI * 2); g.fill();
  if (!blink) {
    g.fillStyle = "#f5f0e6"; g.beginPath(); g.ellipse(128, 128, 100, 58, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(128, 128, 4, 128, 128, 46);
    gr.addColorStop(0, "#1a0f2e"); gr.addColorStop(0.55, "#e0b64f"); gr.addColorStop(0.72, "#9d5cff"); gr.addColorStop(1, "#2c1650");
    g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 44, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#05030a"; g.beginPath(); g.arc(128, 128, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(116, 114, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(157,92,255,0.55)"; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI + 0.3; g.beginPath(); g.moveTo(128 + Math.cos(a) * 60, 128 + Math.sin(a) * 34); g.lineTo(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 55); g.stroke(); }
  } else {
    g.strokeStyle = "#e0b64f"; g.lineWidth = 6; g.beginPath(); g.moveTo(28, 128); g.lineTo(228, 128); g.stroke();
  }
  return new THREE.CanvasTexture(c);
}
function moteTexture(): THREE.Texture {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  gr.addColorStop(0, "rgba(220,180,255,1)"); gr.addColorStop(0.4, "rgba(157,92,255,0.55)"); gr.addColorStop(1, "rgba(157,92,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export default function Background() {
  const ref = useRef<HTMLDivElement>(null);
  const settings = useSettings();
  const cfg = useRef({ density: 1, night: true, motion: true, volume: 0.85 });
  cfg.current = { density: settings.bgEnabled ? settings.bgDensity : 0, night: settings.theme === "dark", motion: !settings.reduceMotion, volume: settings.musicVolume };
  const anim = useRef<{ kick: (kind: string) => void } | null>(null);

  useEffect(() => {
    const mount = ref.current; if (!mount) return;
    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 140);
    cam.position.set(0, 0, 34);

    const daySky = new THREE.Color("#b9d3ea"), nightSky = new THREE.Color("#04090f");
    scene.background = nightSky.clone();
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.011);

    // ── ستاره‌ها ──
    const N = Math.floor(1400 * (cfg.current.density || 0.001));
    const sg = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3), phase = new Float32Array(N), size = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 170; pos[i * 3 + 1] = (Math.random() - 0.25) * 90; pos[i * 3 + 2] = -30 - Math.random() * 60;
      phase[i] = Math.random() * Math.PI * 2; size[i] = 0.7 + Math.random() * 2.1;
    }
    sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    sg.setAttribute("ph", new THREE.BufferAttribute(phase, 1));
    sg.setAttribute("sz", new THREE.BufferAttribute(size, 1));
    const starMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uTex: { value: starTexture() }, uOpacity: { value: 1.0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float ph; attribute float sz; uniform float uT; varying float vA;
        void main(){ vA = 0.55 + 0.45*sin(uT*1.35 + ph*3.1); vec4 mv = modelViewMatrix*vec4(position,1.0);
        gl_PointSize = sz * (140.0 / -mv.z) * (0.8+0.4*sin(uT+ph)); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D uTex; uniform float uOpacity; varying float vA;
        void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(t.rgb, t.a*vA*uOpacity); }`,
    });
    const stars = new THREE.Points(sg, starMat); scene.add(stars);

    // ── برگ‌های کاج ──
    const needleTex = needleTexture();
    const FN = Math.floor(240 * (cfg.current.density || 0.001));
    const needleGeo = new THREE.PlaneGeometry(1.15, 1.15);
    const needles = new THREE.InstancedMesh(needleGeo, new THREE.MeshBasicMaterial({ map: needleTex, transparent: true, depthWrite: false, opacity: 0.85 }), Math.max(FN, 1));
    const nd = new Float32Array(Math.max(FN, 1) * 8); // x,y,z, rot, spin, fall, sway, scale
    for (let i = 0; i < FN; i++) {
      nd[i * 8] = (Math.random() - 0.5) * 90; nd[i * 8 + 1] = Math.random() * 70 - 20; nd[i * 8 + 2] = 6 + Math.random() * 26;
      nd[i * 8 + 3] = Math.random() * 6.28; nd[i * 8 + 4] = (Math.random() - 0.5) * 1.4; nd[i * 8 + 5] = 0.7 + Math.random() * 1.6;
      nd[i * 8 + 6] = Math.random() * 6.28; nd[i * 8 + 7] = 0.5 + Math.random() * 0.8;
    }
    scene.add(needles);
    const dummy = new THREE.Object3D();

    // ── غبار جادویی (شفدر با وردپوسل) ──
    const PN = Math.floor(900 * (cfg.current.density || 0.001));
    const pg = new THREE.BufferGeometry();
    const pp = new Float32Array(Math.max(PN, 1) * 3), pz = new Float32Array(Math.max(PN, 1));
    for (let i = 0; i < PN; i++) {
      pp[i * 3] = (Math.random() - 0.5) * 120; pp[i * 3 + 1] = (Math.random() - 0.5) * 64; pp[i * 3 + 2] = (Math.random() - 0.5) * 60 + 4;
      pz[i] = Math.random() * 6.283;
    }
    pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    pg.setAttribute("seed", new THREE.BufferAttribute(pz, 1));
    const moteMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uTex: { value: moteTexture() }, uA: { value: 0.9 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float seed; uniform float uT; varying float vF;
        void main(){ vec3 p = position;
          p.x += sin(uT*0.22 + seed*9.0)*7.0 + cos(uT*0.11 + p.y*0.2)*3.0;
          p.y += cos(uT*0.17 + seed*6.0)*5.0 + sin(uT*0.07)*2.0;
          p.z += sin(uT*0.13 + seed*4.0)*4.0;
          vF = 0.35+0.65*abs(sin(uT*0.9 + seed*20.0));
          vec4 mv = modelViewMatrix*vec4(p,1.0);
          gl_PointSize = (1.2+2.6*fract(seed*7.0)) * (150.0 / -mv.z);
          gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D uTex; uniform float uA; varying float vF;
        void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(t.rgb, t.a*vF*uA); }`,
    });
    const motes = new THREE.Points(pg, moteMat); scene.add(motes);

    // ── چشم‌های شناور ──
    const eyes: THREE.Sprite[] = [];
    const openTex = eyeTexture(false), shutTex = eyeTexture(true);
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: openTex, transparent: true, depthWrite: false, opacity: 0 }));
      sp.position.set((Math.random() - 0.5) * 70, (Math.random() - 0.5) * 34, -4 - Math.random() * 18);
      const sc = 2.6 + Math.random() * 2.6; sp.scale.set(sc, sc * 0.62, 1);
      (sp.userData as any) = { base: sp.position.clone(), blink: Math.random() * 9, ph: Math.random() * 6.28, sc };
      eyes.push(sp); scene.add(sp);
    }

    // ── نور و ماه/خورشید ──
    const moon = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 24), new THREE.MeshBasicMaterial({ color: "#f2ecd8" }));
    moon.position.set(28, 16, -40); scene.add(moon);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(7.5, 40), new THREE.MeshBasicMaterial({ color: "#e0b64f", transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.position.copy(moon.position).z += 0.5; scene.add(halo);

    let mx = 0, my = 0, tmx = 0, tmy = 0, sy = 0;
    const onMove = (e: MouseEvent) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; };
    const onScroll = () => { sy = scrollY / (document.body.scrollHeight || 1); };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener("resize", onResize);

    // kick برای تعاملات (کلیک روی چشم و…)
    const onKick = ((e: Event) => { const k = (e as CustomEvent).detail as string; anim.current?.kick(k); }) as EventListener;
    window.addEventListener("gf-bg", onKick);
    anim.current = {
      kick(kind) {
        if (kind === "eye") {
          const e = eyes[(Math.random() * eyes.length) | 0]; if (!e) return;
          (e.userData as any).blink = -1.6; // پلک فوری
        } else if (kind === "mote") {
          (moteMat.uniforms.uA.value = 2.4);
        }
      },
    };

    let raf = 0, t = 0, running = true, nightMix = 1;
    const clock = new THREE.Clock();
    const loop = () => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      if (!running || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      t += cfg.current.motion ? dt : dt * 0.15;
      const density = cfg.current.density;
      starMat.uniforms.uT.value = t;
      moteMat.uniforms.uT.value = t * (cfg.current.motion ? 1 : 0.2);
      moteMat.uniforms.uA.value = THREE.MathUtils.lerp(moteMat.uniforms.uA.value, 0.55 + density * 0.5, dt * 1.5);
      nightMix = THREE.MathUtils.lerp(nightMix, cfg.current.night ? 1 : 0, dt * 1.6);
      const sky = daySky.clone().lerp(nightSky, nightMix);
      (scene.background as THREE.Color).copy(sky); (scene.fog as THREE.FogExp2).color.copy(sky);
      starMat.uniforms.uOpacity.value = nightMix;
      (moon.material as THREE.MeshBasicMaterial).color.set(nightMix > 0.5 ? "#f2ecd8" : "#ffd98a");
      (halo.material as THREE.MeshBasicMaterial).color.set(nightMix > 0.5 ? "#e0b64f" : "#ffb84f");
      (halo.material as THREE.MeshBasicMaterial).opacity = 0.06 + 0.08 * (1 - Math.abs(nightMix - 0.5) * 2);

      // برگ‌ها
      if (density > 0) {
        const vis = Math.floor(FN * Math.min(1, density));
        for (let i = 0; i < FN; i++) {
          const o = i * 8;
          if (cfg.current.motion) {
            nd[o + 1] -= nd[o + 5] * dt * 6.0; nd[o + 3] += nd[o + 4] * dt * 2.2; nd[o + 6] += dt * 1.3;
            nd[o] += Math.sin(nd[o + 6]) * dt * 2.2;
            if (nd[o + 1] < -26) { nd[o + 1] = 34 + Math.random() * 14; nd[o] = (Math.random() - 0.5) * 90; }
          }
          dummy.position.set(nd[o], nd[o + 1], nd[o + 2] - 18);
          dummy.rotation.set(nd[o + 3] * 0.6, nd[o + 3], 0);
          const s = nd[o + 7] * (0.4 + 0.6 * Math.min(1, density));
          dummy.scale.setScalar(i < vis ? s : 0.0001);
          dummy.updateMatrix(); needles.setMatrixAt(i, dummy.matrix);
        }
        needles.instanceMatrix.needsUpdate = true;
      } else for (let i = 0; i < FN; i++) { dummy.scale.setScalar(0.0001); dummy.position.set(0, -999, 0); dummy.updateMatrix(); needles.setMatrixAt(i, dummy.matrix); needles.instanceMatrix.needsUpdate = true; }

      // چشم‌ها
      eyes.forEach((e, i) => {
        const u = e.userData as any;
        u.blink += dt;
        const blinking = u.blink % 7 > 6.5;
        (e.material as THREE.SpriteMaterial).map = blinking || u.blink < -1.3 ? shutTex : openTex;
        if (u.blink < -1.3 && u.blink > -1.35) u.blink = 0;
        const wob = Math.sin(t * 0.5 + u.ph) * 1.6;
        e.position.y = u.base.y + wob; e.position.x = u.base.x + Math.cos(t * 0.33 + u.ph) * 2.2;
        const look = new THREE.Vector3(tmx * 4, -tmy * 2.5, 30).sub(e.position).normalize();
        const target = cfg.current.night && density > 0.05 ? (i % 2 ? 0.5 : 0.34) * Math.min(1, density) : 0.0;
        (e.material as THREE.SpriteMaterial).opacity = THREE.MathUtils.lerp((e.material as THREE.SpriteMaterial).opacity, target, dt * 1.2);
        void look;
      });

      // پارالاکس
      mx += (tmx - mx) * 0.03; my += (tmy - my) * 0.03;
      cam.position.x = mx * 7; cam.position.y = -my * 4 - sy * 8;
      cam.rotation.z = mx * 0.014;
      stars.rotation.y = t * 0.004 + mx * 0.02;
      motes.rotation.y = -t * 0.006;
      renderer.render(scene, cam);
    };
    loop();
    const vis = () => { running = !document.hidden; };
    document.addEventListener("visibilitychange", vis);
    return () => {
      disposed = true; cancelAnimationFrame(raf);
      window.removeEventListener("gf-bg", onKick);
      removeEventListener("pointermove", onMove); removeEventListener("scroll", onScroll); removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", vis);
      renderer.dispose(); mount.removeChild(renderer.domElement);
      scene.traverse(o => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[]; if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else mat?.dispose?.(); });
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("rm", settings.reduceMotion);
  }, [settings.reduceMotion]);

  return <div ref={ref} aria-hidden className="fixed inset-0 -z-10 [&>canvas]:block" />;
}

export const bgFx = {
  kick(kind: "eye" | "mote") { /* تزریق از طریق رویداد سراسری */ window.dispatchEvent(new CustomEvent("gf-bg", { detail: kind })); },
};
