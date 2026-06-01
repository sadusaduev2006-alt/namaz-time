const CACHE_NAME = 'namaz-dagestan-v2';
const API_CACHE_NAME = 'namaz-api-v2';

const urlsToCache = [
    '/namaz-time/',
    '/namaz-time/index.html',
    '/namaz-time/style.css',
    '/namaz-time/script.js',
    '/namaz-time/manifest.json',
    '/namaz-time/quran.html'
];

const surahsToPreload = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 36, 55, 67, 78, 112, 113, 114];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).then(() => caches.open(API_CACHE_NAME)).then(apiCache => {
            surahsToPreload.forEach(surah => {
                fetch(`https://api.alquran.cloud/v1/surah/${surah}/editions/ar.uthmani`)
                    .then(response => response.json())
                    .then(data => { if (data.code === 200) apiCache.put(`https://api.alquran.cloud/v1/surah/${surah}/editions/ar.uthmani`, new Response(JSON.stringify(data))); })
                    .catch(err => console.log(err));
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const url = event.request.url;
    if (url.includes('api.alquran.cloud')) {
        event.respondWith(caches.match(event.request).then(cachedResponse => cachedResponse || fetch(event.request)));
        return;
    }
    event.respondWith(
        fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => { cache.put(event.request, networkResponse.clone()); return networkResponse; });
        }).catch(() => caches.match(event.request).then(cachedResponse => cachedResponse || caches.match('/namaz-time/index.html')))
    );
});
