"use client";
// 🤖 چتِ نکسوس — استریم، RAG، حافظه، تاریخچه، TTS پاسخ‌ها
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUGGESTIONS } from "@/data/knowledge";
import { Panel, SectionTitle, useToast } from "@/components/ui";
import { speak, stopSpeak, VOICE_PRESETS, supported } from "@/lib/tts";
import { copyText, faNum } from "@/lib/utils";
import Link from "next/link";
import { GnomeSpot } from "@/components/GnomeHunt";

type Msg = { role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; messages: Msg[]; at: number };
const KEY = "gf-nexus-chat";

function Md({ text }: { text: string }) {
  const html = useMemo(() => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .split(/\n+/).map(p => {
        const lines = p.split(/\n(?=[•\-–*]|\d+[.)])/);
        if (lines.length > 1 || /^[•\-–*]|\d+[.)]/.test(p)) {
          const items = p.split(/\n/).filter(l => l.trim()).map(l => `<li>${l.replace(/^[•\-–*]\s*|\d+[.)]\s*/, "")}</li>`).join("");
          return `<ul>${items}</ul>`;
        }
        return `<p>${p}</p>`;
      }).join("");
  }, [text]);
  return <div dir="rtl" className="prose-chat text-[0.85rem] leading-8" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function AIPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sid, setSid] = useState<string>("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"groq" | "local" | "hf" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();
  const msgs = sessions.find(s => s.id === sid)?.messages ?? [];

  useEffect(() => {
    try {
      const list: Session[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      setSessions(list);
      if (list[0]) setSid(list[0].id); else { const s = mk(); setSessions([s]); setSid(s.id); }
    } catch { const s = mk(); setSessions([s]); setSid(s.id); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (sessions.length) { try { localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, 24))); } catch { } }
  }, [sessions]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: busy ? "auto" : "smooth" }); }, [msgs, busy]);

  function mk(): Session { return { id: "s" + Date.now(), title: "گفتگوی جدید", messages: [], at: Date.now() }; }
  const patch = (fn: (s: Session) => Session) => setSessions(ss => ss.map(s => (s.id === sid ? fn(s) : s)));

  const ask = async (text: string) => {
    const q = text.trim(); if (!q || busy) return;
    setInput(""); setErr(null); setBusy(true);
    const history = [...msgs, { role: "user", content: q } as Msg];
    patch(s => ({ ...s, messages: history, title: s.messages.length ? s.title : q.slice(0, 34) }));
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
      if (!res.ok || !res.body) throw new Error("HTTP " + res.status);
      const rd = res.body.getReader(); const dec = new TextDecoder();
      let raw = "", metaSeen = false;
      patch(s => ({ ...s, messages: [...history, { role: "assistant", content: "" }] }));
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        raw += dec.decode(value, { stream: true });
        if (!metaSeen) {
          const m = raw.match(/\u0000META:(\w+)\u0000/);
          if (m) { setMode(m[1] as any); raw = raw.replace(m[0], ""); metaSeen = true; }
          else if (raw.length > 20) { setMode("local"); metaSeen = true; }
        }
        const clean = raw.replace(/\u0000/g, "");
        patch(s => ({ ...s, messages: [...history, { role: "assistant", content: clean }] }));
      }
      if (!raw.trim()) throw new Error("پاسخ خالی");
    } catch (e: any) {
      setErr(String(e?.message || e));
      toast.show("خطا در گفتگو — اینترنت/GROQ را بررسی کنید");
    } finally { setBusy(false); }
  };

  const newChat = () => { const s = mk(); setSessions(ss => [s, ...ss]); setSid(s.id); };
  const del = (id: string) => { setSessions(ss => { const n = ss.filter(x => x.id !== id); return n.length ? n : [mk()]; }); };
  const [showHist, setShowHist] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);
  const SR: any = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  const toggleMic = () => {
    if (!SR) { toast.show("مرورگر شما گفتار→متن ندارد (کروم/اج دسکتاپ پیشنهاد می‌شود)"); return; }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = "fa-IR"; r.interimResults = true; r.continuous = false;
    let finalTxt = "";
    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        finalTxt += t;
        setInput(v => v.replace(/\s*$/, " ") + (e.results[i].isFinal ? "" : t));
        if (e.results[i].isFinal) setInput(() => (finalTxt || "").trim());
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); toast.show("میکروفون در دسترس نبود"); };
    recogRef.current = r; setListening(true); r.start();
    toast.show("🎙 گوش می‌کنم… حرف بزنید");
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col px-4 sm:px-6">
      <GnomeSpot i={5} hue={260} />
      <SectionTitle kicker="KNOWLEDGE ENTITY · GROQ + LOCAL RAG" title="🤖 گفتگو با «نکسوس»"
        sub="هوش مصنوعیِ این اپ روی همۀ دیتای گرانش فالز بازیابی (RAG) می‌کند؛ با Groq (Llama 3.3 70B) و ابزار search_kb — و اگر کلید نداشته باشید، موتورِ محلیِ آفلاین جواب می‌دهد." />

      <div className="grid flex-1 gap-4 lg:grid-cols-[240px_1fr]">
        {/* تاریخچه */}
        <div className={`${showHist ? "block" : "hidden"} lg:block`}>
          <button className="btn btn-gold mb-2 w-full" onClick={newChat}>+ گفتگویِ جدید</button>
          <div className="max-h-[54vh] space-y-1 overflow-auto lg:max-h-[62vh]">
            {sessions.map(s => (
              <div key={s.id} className={`flex items-center gap-1 rounded-xl px-2.5 py-2 text-[0.74rem] ${s.id === sid ? "bg-gold/15 ring-1 ring-gold/40" : "hover:bg-white/5"}`}>
                <button className="min-w-0 flex-1 truncate text-right font-bold" onClick={() => { setSid(s.id); setShowHist(false); }}>{s.title || "بدون نام"}</button>
                <button className="opacity-40 hover:text-blood" onClick={() => del(s.id)}>✕</button>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-xl bg-white/5 p-2.5 text-[0.62rem] leading-5 opacity-60">
            تاریخچه فقط در localStorage همین مرورگر است. حالتِ فعلی: <b className="text-gold">{mode === "groq" ? "Groq ✨" : mode === "hf" ? "HuggingFace ✨" : mode === "local" ? "موتورِ محلی (RAG آفلاین)" : "…"}</b>
          </div>
          <button className="btn btn-ghost ring-1 ring-white/10 mt-2 w-full !text-xs lg:hidden" onClick={() => setShowHist(false)}>بستنِ تاریخچه</button>
        </div>

        {/* گفتگو */}
        <Panel className="flex min-h-[60vh] flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm font-black">
              <motion.span animate={{ rotate: [0, 12, -8, 0] }} transition={{ repeat: Infinity, duration: 3.4 }} className="inline-block">🔺</motion.span>
              نکسوس • موجودِ دانش
            </div>
            <div className="flex items-center gap-2">
              <span className={`chip !text-[0.6rem] ${mode === "groq" || mode === "hf" ? "!text-pine" : "!text-gold"}`}>{mode === "groq" ? "● Groq متصل" : mode === "hf" ? "● HuggingFace متصل" : "● آرشیوِ محلی"}</span>
              <button className="btn btn-ghost !p-1.5 lg:hidden" onClick={() => setShowHist(v => !v)}>🗂</button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-auto p-4">
            {!msgs.length && (
              <div className="grid gap-2 py-6">
                <div className="text-center text-[0.72rem] opacity-50">یک سؤال بردار — مثل ژورنال ۳، هر درسی یک پاداش دارد:</div>
                {SUGGESTIONS.slice(0, 6).map(s => (
                  <button key={s} onClick={() => ask(s)} className="card glass mx-auto w-full max-w-md px-4 py-2.5 text-right text-[0.78rem] font-bold transition hover:ring-1 hover:ring-gold/50">
                    💡 {s}
                  </button>
                ))}
              </div>
            )}
            <AnimatePresence initial={false}>
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${m.role === "user" ? "bg-magic/15 ring-1 ring-magic/30" : "card"}`}>
                    {m.role === "assistant" && <div className="mb-1 flex items-center gap-1 text-[0.62rem] font-black tracking-wider text-gold/80">🔺 NEXUS · {mode === "groq" ? "GROQ" : mode === "hf" ? "HF" : "LOCAL-RAG"}</div>}
                    {m.role === "user" ? <div className="whitespace-pre-line text-[0.85rem] leading-8">{m.content}</div> : m.content ? <Md text={m.content} /> : <span className="animate-pulse text-sm">در حال ورق‌زدنِ ژورنال‌ها…</span>}
                    {m.role === "assistant" && m.content && (
                      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-white/10 pt-2">
                        <button className="chip !text-[0.6rem]" onClick={() => copyText(m.content)}>📋 کپی</button>
                        {supported() && <button className="chip !text-[0.6rem]" onClick={() => { stopSpeak(); speak(m.content.replace(/[*`]/g, ""), VOICE_PRESETS[2]); }}>🔊 با صدای استن بخوان</button>}
                        <Link href="/facts" className="chip !text-[0.6rem]">🧩 فکت‌ها</Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {err && <div className="rounded-xl bg-blood/20 p-3 text-[0.72rem] text-red-200 ring-1 ring-blood/40">⚠️ {err}</div>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
                rows={2} placeholder="بپرس… مثلاً: «سرگذشت معاملهٔ استن و بیل؟» (Shift+Enter = خط جدید)"
                className="input resize-none text-sm" />
              {SR && <button onClick={toggleMic} title="ورودیِ صوتی" className={`btn ring-1 !px-3 ${listening ? "btn-danger animate-pulse" : "ring-white/15 opacity-70"}`}>🎙</button>}
              <button disabled={busy || !input.trim()} onClick={() => ask(input)} className={`btn ${busy ? "opacity-60" : "btn-gold"} !px-5`}>
                {busy ? "…" : "📨"}
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[0.6rem] opacity-50">
              <span>حافظهٔ مکالمه: {faNum(Math.min(9, msgs.length + 1))} پیام اخیر ارسال می‌شود · منبع‌محور (RAG) · بدونِ داده‌هایِ شخصی</span>
              <span>{busy ? "پخشِ حروف در حال انجام…" : "برای توقفِ صوت: دکمۀ توقف در آزمایشگاه صدا"}</span>
            </div>
          </div>
        </Panel>
      </div>
      {toast.node}
    </div>
  );
}
