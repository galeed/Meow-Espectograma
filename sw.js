/* ==========================================================================
   SERVICE WORKER - MEOW ESPECTOGRAMA
   ========================================================================== */

const CACHE_NAME = 'meow-espectrograma-v1';

// Recursos esenciales que se guardan en la caché del navegador
const ARCHIVOS_A_GUARDAR = [
  './',                  // Raíz del repositorio
  './index.html',        // Interfaz y script principal
  './manifest.json'      // Configuración PWA
  /* Si usas archivos JS/CSS por separado o fuentes locales, agrégalos aquí:
  , './style.css'
  , './app.js'
  , './icon.png'
  */
];

// 1. Instalación: Guarda los recursos en la caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('MEOW ESPECTOGRAMA: Archivos en caché correctamente.');
      return cache.addAll(ARCHIVOS_A_GUARDAR);
    })
  );
  self.skipWaiting();
});

// 2. Activación: Borra la caché antigua al cambiar la versión (ej. 'v2')
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('MEOW ESPECTOGRAMA: Limpiando caché anterior:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Intercepción Fetch (Cache-First): Carga al instante sin depender de la red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
