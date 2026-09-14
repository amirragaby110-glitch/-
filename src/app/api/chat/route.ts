// 🤖 /api/chat — موتور هوش مصنوعی نکسوس
// • حالت Groq (Llama 3.3 70B) با RAG + Tool Calling (تابع search_kb روی دانشنامه)
// • حالت محلیِ آفلاین (بدون کلید): پاسخِ مستند بر پایهٔ بازیابی BM25، استریم‌شده
import { NextRequest } from "next/server";
import { buildKnowledge } from "@/data/knowledge";
import { BM25, type Doc } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYS = (ctx: string) => `تو «نکسوس»، دانشمندِ ديوانۀ «گرانش فالز اولتی‌میت نکسوس» هستی: راهنمای فارسیِ دایرةالمعارفِ سریال.
قواعد:
- فقط بر اساس «پرونده‌های بازیابی‌شده» پاسخ بده؛ اگر اطلاعات کافی نبود، صادقانه بگو و تئوری‌های هواداران را از واقعیت جدا کن.
- فارسی روان، لحنِ مرموزِ دوستانه (گاهی با یک شوخی از زبان بیل سایفر). پاسخ‌ها کوتاه ولی پرمغز باشند؛ از بولت‌پوینت استفاده کن.
- در انتها در یک خط بنویس: «منبع: …» و شماره/عنوان پرونده‌های استفاده‌شده را بیاور.
اگر ابزار search_kb در دسترس داری، برای جزئیات بیشتر (قسمت‌ها، فکت‌ها، آهنگ‌ها، صداپیشه‌ها) حتماً قبل از پاسخ یکی دو بار جستجو کن.
=== پرونده‌های بازیابی‌شدۀ اولیه ===
${ctx || "(چیزی یافت نشد — با ابزار جستجو کن)"}`;

let _bm: BM25 | null = null;
const bm = () => (_bm ??= new BM25(buildKnowledge()));

const TYPE_W: Record<string, number> = {
  horror: 1.35, fun: 1.25, episode: 1.3, character: 1.3, cast: 1.2, award: 1.1, crew: 1.05,
  book: 1.1, timeline: 1.05, track: 1.15, gallery: 0.45,
};
function retrieve(question: string, k = 6): Doc[] {
  const wantsImg = /عکس|تصویر|پوستر|گالری|gallery|wallpaper/i.test(question);
  const r = bm().fuzzy(question, Math.max(k * 3, 18)).map(x => ({ ...x, s: x.score * (wantsImg && x.doc.type === "gallery" ? 2 : TYPE_W[x.doc.type] ?? 1) }));
  r.sort((a, b) => b.s - a.s);
  return r.slice(0, k).map(x => x.doc);
}
function formatDocs(docs: Doc[]): string {
  return docs.map((d, i) => `[پروندۀ ${i + 1} | ${d.type}${d.href ? " | لینک: " + d.href : ""}] ${d.title}: ${d.text.slice(0, 460)}`).join("\n---\n");
}
const norm = (s: string) => s.replace(/[«»"'.,،؛;:!?]/g, " ").toLowerCase();
function localAnswer(question: string, docs: Doc[]): string {
  const nq = norm(question);
  const wants = (re: RegExp) => re.test(nq);
  let lead = "از میانِ پرونده‌هایِ آرشیو، این‌ها را بیرون کشیدم:";
  if (wants(/بیل|bill|سایفر/)) lead = "هوا بویِ «معامله» می‌دهد… بیل دوست دارد بپرسید؛ بفرمایید:";
  else if (wants(/قسمت|اپیزود|episode|خلاصه/)) lead = "نوارِ کاست مربوطه را پیدا کردم:";
  else if (wants(/آهنگ|موسیقی|تم|song|track/)) lead = "ارکسترِ زیرزمین کوک است:";
  else if (wants(/ترسناک|وحشت|نفرین|مرگ/)) lead = "چراغ‌قوه را روشن کنید… این‌ها در قفسۀ تاریک هستند:";
  else if (wants(/صداپیشه|voice|کریستن|جیسون|هیرش|سیمونز/)) lead = "اتن ضبطِ صدا می‌گوید:";
  const top = docs.filter(d => !wants(/خیلی|همه|بگو/));
  const bullets = (top.length ? top : docs).slice(0, 5).map(d =>
    `• **${d.title}** — ${d.text.slice(0, 240)}${d.text.length > 240 ? "…" : ""}`);
  const srcLine = docs.slice(0, 4).map(d => d.title.replace(/^[^—]*— ?/, "")).join(" ｜ ");
  const none = "در پرونده‌هایِ نکسوس ردّی پیدا نکردم — شاید بیل آن را قایم کرده! سؤال دیگری بپرس یا با «ابزارِ جستجو» کلماتِ کلیدی (بیل، قسمت، فکت، گیدئون، موسیقی…) امتحان کن.";
  return `${docs.length || top.length ? lead : none}\n\n${bullets.join("\n")}\n\n${docs.length ? "ℹ️ این پاسخ با موتورِ محلیِ «نکسوس RAG» ساخته شده (آفلاین، بدون سرور). برای پاسخِ مولدِ کامل، کلید GROQ_API_KEY را در تنظیماتِ دیپلوی اضافه کنید." : ""}\nمنبع: ${srcLine || "ژورنالِ نکسوس"}${docs.length ? "\n«بینوایِ من، جستجویِ بعدی مالِ خودت» — بیل" : ""}`;
}

async function streamText(text: string, encoder: TextEncoder, ctrl: ReadableStreamDefaultController<Uint8Array>) {
  const chunks = text.match(/[\s\S]{1,36}(\s|$)/g) ?? [text];
  for (const c of chunks) { ctrl.enqueue(encoder.encode(c)); await new Promise(r => setTimeout(r, 14)); }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const messages: { role: string; content: string }[] = Array.isArray(body.messages) ? body.messages.slice(-9) : [];
  const lastUser = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  if (!lastUser) return Response.json({ error: "پیامی نیست" }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(ctrl) {
      const sendMeta = (mode: string) => ctrl.enqueue(encoder.encode(`\u0000META:${mode}\u0000`));
      const docs = retrieve(lastUser, 7);
      const ctx = formatDocs(docs);
      const key = process.env.GROQ_API_KEY?.trim();
      const hfKey = process.env.HUGGINGFACE_API_KEY?.trim();
      if (!key && !hfKey) {
        sendMeta("local");
        await streamText(localAnswer(lastUser, docs), encoder, ctrl);
        ctrl.close(); return;
      }
      if (!key && hfKey) {
        // حالت Hugging Face (رایگان) — بدون استریمِ توکنی؛ همان RAG + حافظه
        try {
          const convo = [{ role: "system", content: SYS(ctx) }, ...messages];
          const res = await fetch(process.env.HF_API_URL || "https://router.huggingface.co/v1/chat/completions", {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${hfKey}` },
            body: JSON.stringify({ model: process.env.HF_MODEL || "meta-llama/Llama-3.1-8B-Instruct", messages: convo, max_tokens: 900, temperature: 0.6 }),
          });
          if (!res.ok) throw new Error("HF " + res.status);
          const j: any = await res.json();
          const out = j?.choices?.[0]?.message?.content ?? j?.[0]?.generated_text ?? "";
          sendMeta("hf");
          await streamText(out || localAnswer(lastUser, docs), encoder, ctrl);
          ctrl.close(); return;
        } catch (e2) {
          sendMeta("local");
          ctrl.enqueue(encoder.encode(`⚠️ اتصال Hugging Face خطا داد (${(e2 as Error).message}) — حالتِ محلی:\n\n`));
          await streamText(localAnswer(lastUser, docs), encoder, ctrl);
          ctrl.close(); return;
        }
      }
      try {
        const tools = [{ type: "function", function: { name: "search_kb", description: "جستجو در دایرةالمعارف گرانش فالز (فکت‌ها، قسمت‌ها، شخصیت‌ها، آهنگ‌ها، صداپیشه‌ها).", parameters: { type: "object", properties: { query: { type: "string", description: "عبارت جستجوی فارسی یا انگلیسی" }, filter: { type: "string", description: "نوع: horror|fun|episode|character|cast|track|book|timeline|gallery" } }, required: ["query"] } } }];
        const call = async (msgs: any[], streamOut: boolean): Promise<Response> => {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", messages: msgs, tools, stream: streamOut, temperature: 0.55, max_tokens: 1100 }),
          });
          if (!res.ok || !res.body) throw new Error("groq " + res.status);
          return res;
        };
        const convo = [{ role: "system", content: SYS(ctx) }, ...messages];
        const resp1 = await call(convo, false);
        const j1: any = await resp1.json();
        const toolCalls = j1.choices?.[0]?.message?.tool_calls;
        sendMeta("groq");
        if (toolCalls?.length) {
          const toolMsgs: any[] = [{ role: "assistant", content: j1.choices[0].message.content ?? "", tool_calls: toolCalls }];
          for (const tc of toolCalls.slice(0, 3)) {
            let args: any = {}; try { args = JSON.parse(tc.function?.arguments || "{}"); } catch { }
            const extra = formatDocs(retrieve(`${args.query || ""} ${args.filter || ""}`, 5));
            toolMsgs.push({ role: "tool", tool_call_id: tc.id, content: extra || "نتیجه‌ای نبود" });
          }
          const finalResp = await call([...convo, ...toolMsgs], true);
          const rd = finalResp.body!.getReader(); const dec = new TextDecoder(); let bufTxt = "";
          for (;;) {
            const { done, value } = await rd.read(); if (done) break;
            bufTxt += dec.decode(value, { stream: true });
            const lines = bufTxt.split("\n"); bufTxt = lines.pop() ?? "";
            for (const ln of lines) {
              const t = ln.trim(); if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim(); if (payload === "[DONE]") continue;
              try { const j = JSON.parse(payload); const c = j.choices?.[0]?.delta?.content; if (c) ctrl.enqueue(encoder.encode(c)); } catch { }
            }
          }
        } else {
          const c = j1.choices?.[0]?.message?.content;
          if (c) await streamText(c, encoder, ctrl); else ctrl.enqueue(encoder.encode("اتصالِ بیل‌مانندِ Groq بی‌پاسخ ماند؛ موقتاً به آرشیوِ محلی برمی‌گردم.\n\n" + localAnswer(lastUser, docs)));
        }
      } catch (err) {
        ctrl.enqueue(encoder.encode(`\u0000META:local\u0000⚠️ خطا در اتصالِ Groq (${(err as Error).message}) — حالتِ محلی:

`));
        await streamText(localAnswer(lastUser, docs), encoder, ctrl);
      }
      ctrl.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" } });
}
