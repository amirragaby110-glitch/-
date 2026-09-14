"use client";
// 🎧 میini-پلیرِ چسبان پایینِ صفحه در سراسر اپ
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { player } from "@/lib/player";
import { TRACKS } from "@/data/tracks";
import { useMusic } from "@/lib/store";

export default function MiniPlayer() {
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const current = useMusic(s => s.current);
  const track = TRACKS.find(t => t.id === current) ?? TRACKS[0];
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = !!(player.currentId || player.el);
      setShow(s); setPlaying(player.playing); setProg(player.progress);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 70 }} animate={{ y: 0 }} exit={{ y: 70 }} className="fixed bottom-4 left-1/2 z-[65] hidden -translate-x-1/2 md:block">
          <div className="glass card flex w-[520px] items-center gap-3 rounded-2xl px-3 py-2 shadow-2xl">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold/30 to-magic/30 text-lg">{playing ? "🎵" : "🎼"}</span>
            <Link href="/music" className="min-w-0 flex-1">
              <div className="truncate text-xs font-black hover:text-gold">{track.title}</div>
              <div className="mt-1 h-1 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-gradient-to-l from-gold to-magic transition-all" style={{ width: `${prog * 100}%` }} />
              </div>
            </Link>
            <button className="btn btn-ghost !px-2.5" onClick={() => { if (!player.currentId) { const { setCurrent } = useMusic.getState(); player.playDef(track); setCurrent(track.id); } else player.toggle(); }}>
              {playing ? "⏸" : "▶"}
            </button>
            <button className="btn btn-ghost !px-2.5" onClick={() => { const ids = TRACKS.map(t => t.id); const n = ids[(ids.indexOf(current) + 1) % ids.length]; useMusic.getState().setCurrent(n); player.playDef(TRACKS.find(t => t.id === n)!); }}>⏭</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
