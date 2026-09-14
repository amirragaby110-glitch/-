"use client";
// 🖼️ گالریِ نکسوس — ۲۰۰+ آیتم، لایت‌باکس (زوم/پن/چرخش)، اسلایدشو، جستجوی تصویری، دانلود/اشتراک
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GALLERY } from "@/data/gallery";
import { GALLERY_CATS, type GalleryCat, type GalleryItem } from "@/data/types";
import { Panel, SectionTitle, Chip, ProceduralImg, useToast, FavBtn } from "@/components/ui";
import { GnomeSpot } from "@/components/GnomeHunt";
import { CipherScroll } from "@/components/CipherScroll";
import { galleryPoster } from "@/lib/poster";
import { allEntries, addEntry, removeEntry, compressImage, dominantHue } from "@/lib/db";
import { download, share, faNum } from "@/lib/utils";

type UserImg = { entryId: number; title: string; img: string; hue: number; sat: number };

export default function GalleryPage() {
  const [cat, setCat] = useState<GalleryCat | "all" | "mine" | "fav">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(60);
  const [idx, setIdx] = useState(-1);
  const [slideshow, setSlideshow] = useState(false);
  const [users, setUsers] = useState<UserImg[]>([]);
  const [queryHue, setQueryHue] = useState<{ hue: number; sat: number; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  // زوم/پن/چرخش
  const [zoom, setZoom] = useState(1); const [rot, setRot] = useState(0); const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    allEntries("gallery").then(es => Promise.all(es.map(async e => {
      const h = e.img ? await dominantHue(e.img) : { hue: 260, sat: 0.5 };
      return { entryId: e.id!, title: e.title, img: e.img!, hue: h.hue, sat: h.sat };
    }))).then(setUsers).catch(() => { });
  }, []);

  const all: GalleryItem[] = useMemo(() => [
    ...GALLERY,
    ...users.map(u => ({ id: `u-${u.entryId}`, title: u.title, fa: u.title, cat: "fanart" as GalleryCat, desc: "ثبت‌شدۀ شما در دستگاه", hue: u.hue, sat: u.sat, year: "اکنون", tags: ["شما", "آپلود"], img: u.img })),
  ], [users]);

  const list = useMemo(() => {
    const favs = new Set((typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("gf-fav") || "[]")) as string[]);
    let out = all;
    if (cat === "fav") out = out.filter(g => favs.has(`g:${g.id}`));
    if (cat === "mine") out = out.filter(g => g.id.startsWith("u-"));
    if (cat !== "all" && cat !== "fav" && cat !== "mine") out = out.filter(g => g.cat === cat);
    const nq = q.trim().toLowerCase();
    if (nq) out = out.filter(g => (g.fa + g.title + g.desc + g.tags.join(" ") + g.year).toLowerCase().includes(nq));
    if (queryHue) {
      const dh = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
      out = [...out].sort((a, b) => (dh(a.hue, queryHue.hue) + Math.abs(a.sat - queryHue.sat) * 90) - (dh(b.hue, queryHue.hue) + Math.abs(b.sat - queryHue.sat) * 90));
    }
    return out;
  }, [cat, q, all, queryHue]);

  const shown = list.slice(0, page);
  const cur = idx >= 0 ? list[idx] : null;

  const reset = () => { setZoom(1); setRot(0); setPan({ x: 0, y: 0 }); };
  const openAt = (i: number) => { setIdx(i); reset(); };
  const step = useCallback((d: number) => {
    setIdx(v => { const n = (v + d + list.length) % list.length; reset(); return n; });
  }, [list.length]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (idx < 0) return;
      if (e.key === "Escape") { setIdx(-1); setSlideshow(false); }
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, [idx, step]);
  useEffect(() => {
    if (!slideshow || idx < 0) return;
    const t = setInterval(() => step(1), 3200);
    return () => clearInterval(t);
  }, [slideshow, idx, step]);

  const onPick = async (f: File) => {
    setBusy(true);
    try {
      const data = await compressImage(f, 1300, 0.75);
      await addEntry({ type: "gallery", title: f.name.replace(/\.[^.]+$/, ""), text: "آپلودِ کاربر", cat: "fanart", tags: "شما", img: data, author: "شما" });
      const es = await allEntries("gallery");
      const rows: UserImg[] = [];
      for (const e of es) { const h = e.img ? await dominantHue(e.img) : { hue: 260, sat: 0.5 }; rows.push({ entryId: e.id!, title: e.title, img: e.img!, hue: h.hue, sat: h.sat }); }
      setUsers(rows);
      toast.show("به «محلّی‌های من» اضافه شد ✓");
    } catch { toast.show("خطا در پردازش تصویر"); }
    setBusy(false);
  };
  const aiSearch = async (f: File) => {
    setBusy(true);
    try {
      const data = await compressImage(f, 400, 0.7);
      const h = await dominantHue(data);
      setQueryHue({ ...h, name: f.name });
      setCat("all");
      toast.show("🤖 بر اساس رنگ/بافت تصویر جستجو شد");
    } catch { toast.show("خطا"); }
    setBusy(false);
  };
  const dl = async (g: GalleryItem) => {
    try {
      const src = g.img ?? galleryPoster(g, 1200);
      const r = await fetch(src); const b = await r.blob();
      download(b, `GF-Nexus-${g.id}.jpg`);
    } catch { toast.show("دانلود در این منبع ممکن نیست؛ دکمۀ راست‌کلیک → Save را امتحان کنید"); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <GnomeSpot i={12} hue={210} />
      <CipherScroll id="s3" t={34} />
      <SectionTitle kicker="ARCHIVE OF VISIONS" title="🖼️ گالریِ بزرگ آبشار"
        sub={`${faNum(list.length)} تصویر از صحنه‌ها، پوسترها، فن‌آرت‌های نکسوس و آپلودهای خودتان — با هوشِ رنگی برای «جستجوی تصویری».`}
        right={
          <div className="flex flex-wrap gap-2">
            <label className={`btn btn-magic !py-1.5 !text-xs ${busy ? "opacity-60" : ""}`}>📤 ثبت تصویر
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onPick(e.target.files[0])} /></label>
            <label className="btn btn-ghost ring-1 ring-white/15 !py-1.5 !text-xs">🤖 جستجوی تصویری
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && aiSearch(e.target.files[0])} /></label>
          </div>
        } />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>🗂 همه ({faNum(all.length)})</Chip>
        {(Object.keys(GALLERY_CATS) as GalleryCat[]).map(c => (
          <Chip key={c} on={cat === c} onClick={() => setCat(c)}>{GALLERY_CATS[c].emoji} {GALLERY_CATS[c].fa}</Chip>
        ))}
        <Chip on={cat === "mine"} onClick={() => setCat("mine")}>💾 محلی‌های من ({faNum(users.length)})</Chip>
        <Chip on={cat === "fav"} onClick={() => setCat("fav")}>★</Chip>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <Chip on={slideshow} onClick={() => { setSlideshow(true); if (idx < 0) openAt(0); }}>🎞 اسلایدشو</Chip>
        {queryHue && <button className="chip chip-on" onClick={() => setQueryHue(null)}>🤖 {queryHue.name.slice(0, 16)} ✕</button>}
        <input value={q} onChange={e => { setQ(e.target.value); setPage(60); }} placeholder="جستجو در برچسب‌ها…" className="input sm:max-w-52" />
      </div>

      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {shown.map((g, i) => (
          <motion.button key={g.id} layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4 }} onClick={() => openAt(i)} className="group relative block w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
            style={{ aspectRatio: `1 ${(g.img ? 0.72 : (g.aspect ?? 0.72)) + 0.3}` }}>
            {g.img ? <ProceduralImg item={g} alt={g.fa} className="h-full w-full object-cover" /> : (
              <img src={galleryPoster(g, 520)} alt={g.fa} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            <span className="absolute inset-x-2 bottom-2 translate-y-2 text-right opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
              <span className="block truncate text-[0.72rem] font-black text-white">{g.fa}</span>
              <span className="block truncate text-[0.6rem] text-white/70">{g.year} · {GALLERY_CATS[g.cat as GalleryCat]?.fa}</span>
            </span>
          </motion.button>
        ))}
      </div>
      {page < list.length && <div className="mt-6 text-center"><button className="btn btn-gold" onClick={() => setPage(p => p + 60)}>نمایش بیشتر ({faNum(list.length - page)} باقی‌مانده)</button></div>}
      {!list.length && <div className="py-16 text-center opacity-50">چیزی نیست — فیلترها را بردارید یا تصویری ثبت کنید.</div>}

      {/* لایت‌باکس */}
      <AnimatePresence>
        {cur && (
          <motion.div className="fixed inset-0 z-[96] bg-black/95 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setIdx(-1); setSlideshow(false); }}>
            <div className="absolute inset-0 grid place-items-center overflow-hidden" onClick={e => e.stopPropagation()}
              onWheel={e => { setZoom(z => Math.min(6, Math.max(1, z - e.deltaY / 420))); }}
              onPointerDown={e => { dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }}
              onPointerMove={e => { if (dragRef.current) setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y }); }}
              onPointerUp={() => (dragRef.current = null)}
              onDoubleClick={reset}
              style={{ cursor: zoom > 1 ? "grab" : "default", touchAction: "none" }}>
              <motion.img key={cur.id} src={cur.img ?? galleryPoster(cur, 1100)} alt={cur.fa} className="max-h-[82vh] max-w-[92vw] select-none rounded-xl shadow-[0_0_80px_rgba(157,92,255,0.25)]"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: zoom, rotate: rot, x: pan.x, y: pan.y, opacity: 1 }} transition={{ type: "spring", bounce: 0.25 }} draggable={false} />
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10 p-4" onClick={e => e.stopPropagation()}>
              <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl bg-gradient-to-t from-black/90 to-black/40 p-3 text-white">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black">{cur.fa}</div>
                  <div className="truncate text-[0.66rem] opacity-60">{cur.title} · {cur.year} · {cur.desc.slice(0, 80)}</div>
                </div>
                <button className="btn btn-ghost !p-2" onClick={() => step(-1)}>→</button>
                <button className="btn btn-ghost !p-2" onClick={() => step(1)}>←</button>
                <button className="btn btn-ghost !p-2" onClick={() => setZoom(z => Math.min(6, z + 0.4))}>➕</button>
                <button className="btn btn-ghost !p-2" onClick={() => setZoom(z => Math.max(1, z - 0.4))}>➖</button>
                <button className="btn btn-ghost !p-2" onClick={() => setRot(r => r - 90)}>⟲</button>
                <button className="btn btn-ghost !p-2" onClick={() => setRot(r => r + 90)}>⟳</button>
                <button className="btn btn-ghost !p-2" onClick={reset}>⤾</button>
                <button className="btn btn-ghost !p-2" onClick={() => setSlideshow(v => !v)}>{slideshow ? "⏸" : "🎞"}</button>
                <button className="btn btn-gold !py-1.5 !text-xs" onClick={() => dl(cur)}>⬇️</button>
                <button className="btn btn-ghost ring-1 ring-white/15 !py-1.5 !text-xs" onClick={() => share(cur.fa, cur.desc, cur.img ? location.origin + cur.img : location.origin + "/gallery").then(r => toast.show(r === "shared" ? "اشتراک ✓" : "کپی ✓"))}>📤</button>
                <FavBtn k={`g:${cur.id}`} className="!text-xl" />
                {cur.id.startsWith("u-") && <button className="btn btn-ghost !py-1.5 !text-xs text-blood" onClick={async () => { const id = +cur.id.replace("u-", ""); await removeEntry(id); setUsers(users.filter(u => u.entryId !== id)); setIdx(-1); toast.show("حذف شد"); }}>🗑</button>}
              </div>
            </div>
            <button className="absolute left-4 top-4 z-10 text-2xl text-white/70 hover:text-white" onClick={() => setIdx(-1)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      {toast.node}
    </div>
  );
}
