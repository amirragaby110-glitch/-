// 🔍 موتور جستجوی مشترک (پالت فرمان + RAG هوش مصنوعی) — BM25 سبک با نرمال‌سازی فارسی
export interface Doc { id: string; title: string; text: string; type: string; href: string; tags?: string }
const STOP = new Set(["و", "در", "به", "با", "از", "که", "این", "است", "را", "برای", "خود", "یا", "آن", "یک", "the", "a", "an", "of", "and", "to", "in", "is", "for", "on"]);
export function normalize(s: string): string {
  return s.replace(/ی/g, "ی").replace(/ك/g, "ک").replace(/ي/g, "ی").replace(/ٔ|ّ|ٰ|ْ/g, "")
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/[‌\u200c]/g, " ")
    .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .toLowerCase();
}
export function tokens(s: string): string[] {
  return normalize(s).split(/[^\p{L}\p{N}]+/u).filter(t => t.length > 1 && !STOP.has(t));
}
export class BM25 {
  private df = new Map<string, number>();
  private docs: { d: Doc; tf: Map<string, number>; len: number }[] = [];
  constructor(private raw: Doc[], k1 = 1.4, b = 0.72) {
    const N = raw.length;
    const seenPerDoc: Set<string>[] = [];
    for (const d of raw) {
      const tf = new Map<string, number>();
      const toks = [...tokens(d.title + " " + d.title), ...tokens(d.text), ...tokens(d.tags || "")];
      for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
      const s = new Set(toks);
      seenPerDoc.push(s);
      s.forEach(t => this.df.set(t, (this.df.get(t) || 0) + 1));
      this.docs.push({ d, tf, len: toks.length || 1 });
    }
    this.avg = this.docs.reduce((a, x) => a + x.len, 0) / (N || 1);
    this.N = N; this.k1 = k1; this.b = b;
  }
  private avg = 1; private N = 0; private k1 = 1.4; private b = 0.72;
  search(q: string, top = 8): { doc: Doc; score: number }[] {
    const qt = [...new Set(tokens(q))];
    if (!qt.length) return [];
    const scores = this.docs.map(({ d, tf, len }) => {
      let s = 0;
      for (const t of qt) {
        const df = this.df.get(t) || 0; if (!df) continue;
        const idf = Math.log(1 + (this.N - df + 0.5) / (df + 0.5));
        const f = tf.get(t) || 0;
        s += idf * (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * (len / this.avg)));
      }
      return { doc: d, score: s };
    }).filter(x => x.score > 0.35).sort((a, b) => b.score - a.score);
    // بونوس تطابق کامل عنوان
    const nq = normalize(q).trim();
    for (const x of scores) if (nq.length > 2 && normalize(x.doc.title).includes(nq)) x.score *= 1.8;
    return scores.slice(0, top);
  }
  fuzzy(q: string, top = 8) {
    const res = this.search(q, top);
    if (res.length) return res;
    const pre = normalize(q).slice(0, 4);
    if (pre.length < 3) return [];
    return this.docs.filter(x => x.d.title && normalize(x.d.title).includes(pre)).slice(0, top).map(x => ({ doc: x.d, score: 1 }));
  }
}
