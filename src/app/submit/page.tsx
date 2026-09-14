"use client";
// ✍️ ثبتِ اطلاعاتِ جدید — فکت/تئوری/فن‌فیک/تصویر/لینک ویدیو + خروجی و ورودی JSON
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Panel, SectionTitle, Chip, useToast, Counter } from "@/components/ui";
import { FUN_CATS, type FunCat } from "@/data/types";
import { HORROR_CATS, type HorrorCat } from "@/data/types";
import { addEntry, allEntries, removeEntry, compressImage, dominantHue, exportAll, importJSON, type UserEntry, type EntryType } from "@/lib/db";
import { bumpCounter } from "@/lib/progress";
import { GnomeSpot } from "@/components/GnomeHunt";
import { download, faNum, uid } from "@/lib/utils";
import { sfx } from "@/components/Shell";

const TYPES: { k: EntryType; fa: string; emoji: string; d: string }[] = [
  { k: "fun", fa: "فکتِ جالب", emoji: "🧩", d: "یک حقیقتِ شگفت‌انگیز دربارهٔ سریال — به صفحۀ «فکت‌ها» اضافه می‌شود." },
  { k: "horror", fa: "فکتِ ترسناک", emoji: "🔦", d: "رازِ تاریک، تئوریِ دلهره‌آور — به «رازهای تاریک» اضافه می‌شود." },
  { k: "theory", fa: "تئوری هواداری", emoji: "🧠", d: "تحلیلِ شخصی‌تان از دنیای سریال." },
  { k: "fanfic", fa: "داستانِ هواداری", emoji: "🖋", d: "تابستانِ خودتان را بنویسید." },
  { k: "gallery", fa: "تصویر/فن‌آرت", emoji: "🖼", d: "عکسِ خودتان یا فن‌آرت — در گالریِ «محلی‌های من»." },
  { k: "watchlink", fa: "لینکِ ویدیو", emoji: "📺", d: "لینک آپارات/یوتیوب برای یک قسمت مشخص." },
];

export default function SubmitPage() {
  const [type, setType] = useState<EntryType>("fun");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [cat, setCat] = useState<string>("prod");
  const [lvl, setLvl] = useState(3);
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  useEffect(() => { try { setAuthor(localStorage.getItem("gf-author") || ""); } catch {} }, []);
  const [img, setImg] = useState<string>("");
  const [imgHue, setImgHue] = useState(260);
  const [ep, setEp] = useState("1-1");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<UserEntry[]>([]);
  const [filter, setFilter] = useState<EntryType | "all">("all");
  const toast = useToast();

  const refresh = () => allEntries().then(rs => setRows(rs.filter(r => filter === "all" || r.type === filter)));
  useEffect(() => { refresh(); }, [filter]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const pick = (f: File) => {
    setBusy(true);
    compressImage(f, 1100, 0.7).then(async d => {
      setImg(d); const h = await dominantHue(d); setImgHue(h.hue);
      toast.show("تصویر فشرده و ذخیرۀ محلی آماده شد ✓"); setBusy(false);
    }).catch(() => { toast.show("خطا در پردازش تصویر"); setBusy(false); });
  };

  const canSubmit = text.trim().length >= 8 && (type === "fun" || type === "gallery" ? true : title.trim().length >= 2);
  const submit = async () => {
    sfx("open");
    try { localStorage.setItem("gf-author", author); } catch { }
    await addEntry({
      type, title: title.trim() || (type === "fun" ? "فکتِ بدون‌عنوان" : "بی‌نام"), text: text.trim(),
      cat: type === "horror" ? "theories" : type === "fun" ? cat : type,
      tags: tags.trim(), img: img || undefined, author: author.trim() || "گردشگرِ ناشناس",
      meta: JSON.stringify({ lvl, ep: type === "watchlink" ? ep : undefined, uid: uid() }),
    });
    setTitle(""); setText(""); setImg(""); setTags("");
    refresh(); bumpCounter("subs", 1, "✓ رکوردِ تازه در آرشیو ✍️", 8); toast.show("✓ ثبت شد — فقط روی دستگاهِ شما ذخیره گردید (IndexedDB)");
  };

  const exp = async () => { const j = await exportAll(); download(new Blob([j], { type: "application/json" }), "gf-nexus-export.json"); toast.show("خروجی JSON دانلود شد"); };
  const imp = async (f: File) => {
    try { const n = await importJSON(await f.text()); toast.show(`${faNum(n)} رکورد وارد شد ✓`); refresh(); } catch { toast.show("فایل نامعتبر است"); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <GnomeSpot i={7} />
      <SectionTitle kicker="NEW ENTRY PROTOCOL — LOCAL DATABASE" title="✍️ ثبتِ اطلاعاتِ جدید"
        sub="دانشنامۀ خودتان را بسازید: فکت، تئوری، داستان، تصویر یا لینکِ ویدیو. همه‌چیز با IndexedDB در همین مرورگر ذخیره می‌شود — امن، آفلاین، بدون سرور — و هر زمان خواستید خروجیِ JSON بگیرید تا با دیگران به اشتراک بگذارید." />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Panel className="p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {TYPES.map(t => (
              <Chip key={t.k} on={type === t.k} onClick={() => { setType(t.k); setCat(t.k === "fun" ? cat : "user"); }}>{t.emoji} {t.fa}</Chip>
            ))}
          </div>
          <p className="mb-3 rounded-xl bg-magic/10 px-3 py-2 text-[0.7rem] leading-6 opacity-85 ring-1 ring-magic/25">
            {TYPES.find(t => t.k === type)?.d}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[0.66rem] font-black opacity-70">عنوان</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder={type === "fun" ? "(اختیاری)" : "مثلاً: «نقشۀ دوقلوهای گلیفل»"} />
            </div>
            <div>
              <label className="mb-1 block text-[0.66rem] font-black opacity-70">نامِ ثبت‌کننده</label>
              <input className="input" value={author} onChange={e => setAuthor(e.target.value)} placeholder="مثلاً: امانوئل" />
            </div>
          </div>
          <label className="mb-1 mt-3 block text-[0.66rem] font-black opacity-70">{type === "gallery" ? "توضیحِ تصویر" : "متنِ اصلی *"}</label>
          <textarea className="input min-h-36" value={text} onChange={e => setText(e.target.value)} placeholder={type === "fun" ? "یک فکتِ جالبِ راستی‌آزمایی‌شده بنویسید…" : type === "horror" ? "رازِ تاریک را شرح دهید… (چراغ‌قوه دستِ چپ)" : "بیشتر بنویسید؛ بیل از محتوایِ کم بدش می‌آید…"} />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {type === "fun" && (
              <div>
                <label className="mb-1 block text-[0.66rem] font-black opacity-70">دسته</label>
                <select className="input" value={cat} onChange={e => setCat(e.target.value)}>
                  {(Object.keys(FUN_CATS) as FunCat[]).map(c => <option key={c} value={c}>{FUN_CATS[c].emoji} {FUN_CATS[c].fa}</option>)}
                </select>
              </div>
            )}
            {type === "horror" && (
              <div>
                <label className="mb-1 block text-[0.66rem] font-black opacity-70">دسته</label>
                <select className="input" value={cat} onChange={e => setCat(e.target.value)}>
                  {(Object.keys(HORROR_CATS) as HorrorCat[]).map(c => <option key={c} value={c}>{HORROR_CATS[c].emoji} {HORROR_CATS[c].fa}</option>)}
                </select>
              </div>
            )}
            {(type === "horror" || type === "theory") && (
              <div>
                <label className="mb-1 block text-[0.66rem] font-black opacity-70">شدتِ ترس: {faNum(lvl)} 🕯</label>
                <input type="range" min={1} max={5} value={lvl} onChange={e => setLvl(+e.target.value)} className="w-full" />
              </div>
            )}
            {type === "watchlink" && (
              <div>
                <label className="mb-1 block text-[0.66rem] font-black opacity-70">کدام قسمت؟ (فصل-شماره)</label>
                <input className="input" value={ep} onChange={e => setEp(e.target.value)} placeholder="2-11" dir="ltr" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-[0.66rem] font-black opacity-70">برچسب‌ها (با ویرگول)</label>
              <input className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="بیل، ۱۹۸۲، رمز" />
            </div>
            <div>
              <label className="mb-1 block text-[0.66rem] font-black opacity-70">تصویر (اختیاری)</label>
              <label className={`btn btn-ghost ring-1 ring-white/15 w-full ${busy ? "opacity-60" : ""}`}>
                {img ? "تصویرِ دیگری انتخاب کنید 📷" : "📷 انتخاب تصویر"}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && pick(e.target.files[0])} />
              </label>
            </div>
          </div>
          {img && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-2" dir="ltr">
              <img src={img} alt="" className="h-20 w-28 rounded-lg object-cover" style={{ outline: `2px solid hsl(${imgHue} 70% 60%)` }} />
              <div className="text-[0.66rem] opacity-60">تصویر فشرده شد و در دیتابیسِ محلی ذخیره می‌گردد (هیچ‌جا آپلود نمی‌شود).</div>
              <button className="mr-auto text-blood opacity-70 hover:opacity-100" onClick={() => setImg("")}>✕</button>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="btn btn-gold !px-8" disabled={!canSubmit || busy} onClick={submit}>{busy ? "…" : "ثبت در پایگاهِ محلی"}</button>
            {!canSubmit && <span className="text-[0.66rem] opacity-55">حداقلِ ۸ کاراکتر متن {type !== "fun" && type !== "gallery" ? "و یک عنوان" : ""} لازم است.</span>}
            <span className="mr-auto flex items-center gap-1 text-[0.66rem] opacity-55"><Counter to={rows.length} /> رکورد در آرشیوِ شما</span>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-4">
            <h3 className="mb-2 text-sm font-black">🧳 جابه‌جاییِ داده‌ها</h3>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-magic !text-xs" onClick={exp}>⬇️ خروجی JSON</button>
              <label className="btn btn-ghost ring-1 ring-white/15 !text-xs">⬆️ واردکردن JSON
                <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && imp(e.target.files[0])} /></label>
              <button className="btn btn-danger !text-xs" onClick={async () => { if (confirm("همۀ رکوردهای محلی حذف شوند؟")) { const rs = await allEntries(); await Promise.all(rs.map(r => removeEntry(r.id!))); refresh(); toast.show("پاک شد"); } }}>🧹 خالی‌کردن آرشیو</button>
            </div>
            <p className="mt-2 text-[0.64rem] leading-6 opacity-55">فایلِ خروجی را می‌توانید در هر دستگاهی ایمپورت کنید — روشِ «انتشار» آرشیوِ شخصی. اگر خواستید فکت‌هایتان به نسخۀ عمومی سایت اضافه شود، فایل را برای سازندۀ سایت بفرستید تا در data/commit کنیم.</p>
          </Panel>

          <Panel className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-black">🗃 آرشیوِ من</h3>
              <select className="input !w-auto !py-1 !text-[0.7rem]" value={filter} onChange={e => setFilter(e.target.value as any)}>
                <option value="all">همه</option>
                {TYPES.map(t => <option key={t.k} value={t.k}>{t.emoji} {t.fa}</option>)}
              </select>
            </div>
            <div className="max-h-[44vh] space-y-1.5 overflow-auto">
              {!rows.length && <div className="p-6 text-center text-[0.7rem] opacity-50">هنوز رکوردی ثبت نکرده‌اید.</div>}
              {rows.map(r => (
                <motion.div key={r.id} layout initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl bg-white/5 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 truncate text-[0.78rem] font-black">{TYPES.find(t => t.k === r.type)?.emoji} {r.title}</div>
                    <div className="flex shrink-0 items-center gap-1.5 text-[0.6rem] opacity-50">
                      {new Date(r.createdAt).toLocaleDateString("fa-IR")}
                      <button className="hover:text-gold" title="پسند" onClick={async () => { const { likeEntry } = await import("@/lib/db"); await likeEntry(r.id!); refresh(); }}>♥ {faNum(r.likes || 0)}</button>
                      <button className="hover:text-blood" onClick={() => { removeEntry(r.id!).then(refresh); }}>🗑</button>
                    </div>
                  </div>
                  {r.img && <img src={r.img} alt="" className="mt-1.5 max-h-24 rounded-lg" />}
                  <div className="mt-1 line-clamp-2 text-[0.72rem] leading-6 opacity-75">{r.text}</div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      {toast.node}
    </div>
  );
}
