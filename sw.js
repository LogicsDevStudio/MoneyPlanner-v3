/* MoneyPlanner service worker — เก็บตัวแอปไว้ในเครื่องให้เปิดได้แม้ไม่มีเน็ต
   ข้อมูลการเงินไม่ถูกเก็บที่นี่ (แอปเก็บแคชข้อมูลแยกเองและล้างเมื่อล็อกแอป) */
const VERSION = '3.1.0';
const CACHE = 'mp-shell-' + VERSION;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'vendor/bootstrap.min.css', 'vendor/bootstrap.bundle.min.js', 'vendor/chart.umd.js',
  'vendor/sweetalert2.min.css', 'vendor/sweetalert2.all.min.js',
  'vendor/fa/css/all.min.css', 'vendor/fa/webfonts/fa-solid-900.woff2', 'vendor/fa/webfonts/fa-regular-400.woff2',
  'vendor/fonts/fonts.css',
  'vendor/fonts/prompt-thai-400-normal.woff2', 'vendor/fonts/prompt-thai-500-normal.woff2', 'vendor/fonts/prompt-thai-600-normal.woff2', 'vendor/fonts/prompt-thai-700-normal.woff2',
  'vendor/fonts/prompt-latin-400-normal.woff2', 'vendor/fonts/prompt-latin-500-normal.woff2', 'vendor/fonts/prompt-latin-600-normal.woff2', 'vendor/fonts/prompt-latin-700-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // คำขอไป Apps Script/ภายนอก ไม่ยุ่ง

  if (req.mode === 'navigate') {                      // หน้าแอป: ออนไลน์ใช้ของใหม่ ออฟไลน์ใช้ที่เก็บไว้
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); }
      return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
