const CACHE_NAME = 'finanza-cache-v22';
const APP_SHELL = [
  './',
  './index.html',
  './terminos.html',
  './styles.css',
  './app.bundle.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './api-config.js',
  './vendor/jspdf.umd.min.js',
  './manual/index.html',
  './manual/img/01-resumen.png',
  './manual/img/02-formulario.png',
  './manual/img/03-descripcion.png',
  './manual/img/04-tipo-categoria.png',
  './manual/img/05-monto-fecha.png',
  './manual/img/06-moneda.png',
  './manual/img/07-guardado.png',
  './manual/img/08-ingreso.png',
  './manual/img/09-ingreso-guardado.png',
  './manual/img/10-moneda-extranjera.png',
  './manual/img/11-movimientos.png',
  './manual/img/12-movil.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
