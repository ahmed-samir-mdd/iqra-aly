/* ============================================================
   عامل الخدمة لموقع «اقرأ عليَّ»
   يجعل الموقع قابلًا للتثبيت كتطبيق ويب، ويحفظ هيكل الصفحات
   لتعمل عند انقطاع الاتصال. لا يخزّن ملف APK في مجلد downloads/.
   ============================================================ */

const CACHE = 'iqraaly-shell-v1';

const SHELL = [
  './',
  './privacy',
  './terms',
  './assets/css/styles.css',
  './assets/js/config.js',
  './assets/js/main.js',
  './assets/img/logo.svg',
  './assets/img/logo.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* لا نخزّن ملف التطبيق ولا نعترض تنزيله. */
  if (url.pathname.indexOf('/downloads/') !== -1) return;

  /* الصفحات: الشبكة أولًا ثم النسخة المحفوظة. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./')))
    );
    return;
  }

  /* الأصول: الشبكة أولًا لضمان وصول التحديثات، ثم النسخة المحفوظة عند انقطاع الاتصال. */
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
