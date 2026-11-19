/* Service worker of the web app: keeps every file on the device so the app opens with no connection.
   The cache name changes whenever any file changes (tools/web.mjs writes the version), which replaces the old copy. */
const C = 'rl-084c18436e', FONTS = 'rlfonts';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'logo.webp', 'u1.html', 'u2.bin', 'u3.bin', 'u4.bin', 'u5.bin', 'u6.bin', 'u7.bin', 'u8.bin', 'u9.bin', 'English-is-fun.html', 'parent.html',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
  ...Array.from({ length: 10 }, (_, i) => ['medals/m' + (i + 1) + '.webp', 'medals/t' + (i + 1) + '.webp']).flat()];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith('rl-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    /* the licence list and the one-file app (which carries the list): the newest one when there is a connection (so a new or cancelled code takes effect), the saved one when there is none */
    const f = u.pathname.split('/').pop();
    if (f === 'lic.json' || f === 'English-is-fun.html') {
      e.respondWith(fetch(r).then(x => { if (x.ok) { const y = x.clone(); caches.open(C).then(c => c.put(f, y)); } return x; })
        .catch(() => caches.match(f).then(x => x || Response.error())));
      return;
    }
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(x => x || fetch(r)));
    return;
  }
  /* the web fonts, kept after the first time they load */
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))
    e.respondWith(caches.open(FONTS).then(c => c.match(r).then(x => x || fetch(r).then(y => { c.put(r, y.clone()); return y; }))));
});
