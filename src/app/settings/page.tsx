"use client";
// ⚙️ تنظیمات — پوسته، پس‌زمینهٔ سه‌بعدی، دسترسی‌پذیری، PWA، داده‌ها
import { useEffect, useState } from "react";
import { useSettings } from "@/lib/store";
import { Panel, SectionTitle, Chip, useToast } from "@/components/ui";
import { useInstallPrompt } from "@/components/Pwa";
import { HORROR_COUNT } from "@/data/horror";
import { FUN_COUNT } from "@/data/fun";
import { allEntries, exportAll, removeEntry, importJSON } from "@/lib/db";
import { download, faNum } from "@/lib/utils";
import { GnomeSpot } from "@/components/GnomeHunt";
import { CipherScroll } from "@/components/CipherScroll";
import { AmbientMixer } from "@/components/AmbientUI";
import { exportProgress, importProgress } from "@/lib/progress";

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 py-3 last:border-0">
      <div><div className="text-sm font-black">{label}</div>{sub && <div className="mt-0.5 max-w-md text-[0.68rem] leading-5 opacity-55">{sub}</div>}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={`relative h-7 w-12 rounded-full transition ${on ? "bg-gradient-to-l from-gold to-magic" : "bg-white/10"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "right-1" : "right-6"}`} />
    </button>
  );
}
export default function SettingsPage() {
  const st = useSettings();
  const toast = useToast();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [count, setCount] = useState(0);
  useEffect(() => { allEntries().then(r => setCount(r.length)); }, []);
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <GnomeSpot i={15} hue={60} />
      <CipherScroll id="s4" t={40} side="left" />
      <SectionTitle kicker="CONTROL ROOM — CABIN 1982" title="⚙️ تنظیماتِ نکسوس"
        sub="هر کلیدی که اینجا بچرخد، سراسرِ اپ را تغییر می‌دهد. تنظیمات در همین مرورگر ذخیره می‌شوند." />
      <Panel className="p-5">
        <Row label="🌙 حالتِ شب" sub="پوستۀ تاریکِ جاده‌ای + افکت‌هایِ شبانه. «خودکار» یعنی بین ۱۸ تا ۶ صبح، چراغ‌های شهر خاموش می‌شوند.">
          <Toggle on={st.theme === "dark"} onChange={v => st.set({ theme: v ? "dark" : "light" })} />
          <Chip on={st.autoNight} onClick={() => st.set({ autoNight: !st.autoNight })}>⏰ خودکار</Chip>
        </Row>
        <Row label="🌌 پس‌زمینۀ زنده (Three.js)" sub="ستاره، بارشِ برگ کاج، غبارِ بنفش و چشم‌های شناور. اگر باتری/عملکرد مهم است، خاموشش کنید.">
          <Toggle on={st.bgEnabled} onChange={v => st.set({ bgEnabled: v })} />
        </Row>
        {st.bgEnabled && (
          <Row label="چگالیِ ذرات" sub={`${faNum(Math.round(st.bgDensity * 100))}٪ — روی موبایل عددِ پایین‌تر روان‌تر است.`}>
            <input type="range" min={0.2} max={1.6} step={0.1} value={st.bgDensity} onChange={e => st.set({ bgDensity: +e.target.value })} className="w-40" />
          </Row>
        )}
        <Row label="👁 حالتِ بیل" sub="ویگنت، اسکن‌لاین، پچ‌پچ‌های تصادفی و چشم‌های غافلگیرکننده در سراسر اپ — برای شب‌های تابستان.">
          <Toggle on={st.horrorMode} onChange={v => st.set({ horrorMode: v })} />
        </Row>
        <Row label="✨ دنبالهٔ ماوس جادویی" sub="ذراتِ بنفش دنبالِ نشانگر (غیرفعال روی لمس).">
          <Toggle on={st.cursorTrail} onChange={v => st.set({ cursorTrail: v })} />
        </Row>
        <Row label="🔊 صداهای رابط" sub="کلیک‌هایِ ریزِ چوبی روی ناوبری.">
          <Toggle on={st.soundFX} onChange={v => st.set({ soundFX: v })} />
        </Row>
        <Row label="🍃 کاهشِ حرکت (دسترسی‌پذیری)" sub="حساسیتِ انیمیشن‌ها را کم می‌کند؛ مناسبِ حساسیتِ حرکتی و سردردها.">
          <Toggle on={st.reduceMotion} onChange={v => st.set({ reduceMotion: v })} />
        </Row>
        <Row label="🎚 صدایِ موسیقی" sub="والومِ اصلیِ موتورِ نکسوس‌سوند — روی همه‌جا اعمال می‌شود.">
          <input type="range" min={0} max={1} step={0.01} value={st.musicVolume} onChange={e => { st.set({ musicVolume: +e.target.value }); }} className="w-40" />
        </Row>
      </Panel>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Panel className="p-5">
          <h3 className="mb-1 font-black">📲 نصب به‌عنوان اپ (PWA)</h3>
          <p className="mb-3 text-[0.7rem] leading-6 opacity-65">نکسوس آفلاین کار می‌کند: بخش‌های دانشنامه و موزیک بعد از بار اول بدون اینترنت هم در دسترس‌اند (مگر ویدیوهای بیرونی).</p>
          {installed ? <div className="chip !text-xs">✓ نصب است</div> : <button disabled={!canInstall} onClick={promptInstall} className={`btn btn-magic !text-xs ${canInstall ? "" : "opacity-50"}`}>⬇️ نصب {canInstall ? "" : "(از منوی مرورگر: Add to Home screen)"}</button>}
        </Panel>
        <Panel className="p-5">
          <h3 className="mb-1 font-black">🗄 داده‌هایِ شما</h3>
          <p className="mb-3 text-[0.7rem] leading-6 opacity-65">{faNum(count)} رکوردِ ثبت‌شده در IndexedDB + {faNum(HORROR_COUNT + FUN_COUNT)} فکتِ اصلیِ دیتابیس. خروجی بگیرید تا هیچ‌چیز گم نشود.</p>
          <div className="flex gap-2">
            <button className="btn btn-gold !text-xs" onClick={async () => download(new Blob([await exportAll()], { type: "json" }), "gf-nexus-export.json")}>⬇️ خروجی JSON</button>
            <label className="btn btn-ghost ring-1 ring-white/10 !text-xs">⬆️ ایمپورت
              <input type="file" accept="application/json" className="hidden" onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                try { const n = await importJSON(await f.text()); toast.show(`${faNum(n)} ورود ✓`); allEntries().then(r => setCount(r.length)); } catch { toast.show("فایل نامعتبر"); }
              }} /></label>
            <button className="btn btn-danger !text-xs" onClick={async () => { if (confirm("حذفِ همۀ رکوردهای محلی؟")) { (await allEntries()).forEach(r => removeEntry(r.id!)); allEntries().then(r => setCount(r.length)); toast.show("پاک شد"); } }}>🧹</button>
          </div>
        </Panel>
      </div>

      <div className="mt-5"><AmbientMixer /></div>

      <Panel className="mt-5 p-5 text-[0.72rem] leading-7 opacity-75">
        <h3 className="mb-2 font-black text-sm">⌨️ میان‌بُرهایِ نکسوس</h3>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <div><kbd className="chip !cursor-default">۶۱۸</kbd> تایپِ این عدد… اگر جرات دارید</div>
          <div><kbd className="chip !cursor-default">Ctrl/⌘ + K</kbd> جستجویِ سراسری + ناوبری سریع</div>
          <div><kbd className="chip !cursor-default">→ / ←</kbd> گشت‌وگذار در لایت‌باکس گالری</div>
          <div><kbd className="chip !cursor-default">Enter</kbd> ارسال در چت هوش مصنوعی (Shift+Enter = خط جدید)</div>
          <div><kbd className="chip !cursor-default">Esc</kbd> بستنِ مودال‌ها</div>
        </div>
      </Panel>
      <Panel className="mt-5 p-5">
        <h3 className="mb-1 font-black text-sm">🏅 بازیکنِ مخفیِ نکسوس</h3>
        <p className="mb-3 text-[0.7rem] leading-6 opacity-65">خروجی گرفتن از «پیشرفتِ بازیکن» (سطح، XP، دستاوردها) کارِ همین‌جاست؛ اما آرشیوِ کاملش در صفحۀ پروفایل است.</p>
        <div className="flex flex-wrap gap-2">
          <a href="/profile" className="btn btn-gold !text-xs">🏅 پروفایل و دستاوردها</a>
          <a href="/cipher" className="btn btn-ghost ring-1 ring-white/10 !text-xs">🗝 شکارِ طومار</a>
          <a href="/games" className="btn btn-ghost ring-1 ring-white/10 !text-xs">🕹 تالارِ بازی</a>
          <button className="btn btn-ghost ring-1 ring-white/10 !text-xs" onClick={() => download(new Blob([exportProgress()], { type: "application/json" }), "gf-nexus-progress.json")}>⬇️ خروجیِ پیشرفت</button>
          <label className="btn btn-ghost ring-1 ring-white/10 !text-xs">⬆️ بازگردانیِ پیشرفت
            <input type="file" accept="application/json" className="hidden" onChange={async e => {
              const f = e.target.files?.[0]; if (!f) return;
              try { toast.show(importProgress(await f.text()) ? "✓ پیشرفت بازگردانی شد" : "فایل نامعتبر"); } catch { toast.show("فایل نامعتبر"); }
            }} /></label>
        </div>
      </Panel>
      {toast.node}
    </div>
  );
}
