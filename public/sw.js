/* Service Worker — گرانش فالز نکسوس (PWA آفلاین) */
const CACHE = "gf-nexus-v1";
const CORE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => { }));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // استراتژی: برای ناوبری → شبکه‌اول با فال‌بک کش؛ برای استاتیک/تصاویر → کش‌اول؛ بقیه → شبکه با کش‌کردن
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("/", cp)); return r; }).catch(() => caches.match("/").then(m => m || caches.match(req))));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; });
    }));
    return;
  }
  if (/\.(jpg|jpeg|png|webp|svg|woff2?)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && r.type === "basic") { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => Response.error())));
  }
});
