// Service Worker برای PWA رزرو وقت
const CACHE_NAME = 'booking-v2'; // Version updated to force cache refresh
const RUNTIME_CACHE = 'booking-runtime-v2';

// فایل‌های استاتیک که باید کش شوند (HTML files excluded for fresh content)
const STATIC_CACHE_URLS = [
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png'
];

// نصب Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// فعال‌سازی Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// استراتژی Cache First برای فایل‌های استاتیک
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // فقط درخواست‌های GET را کش کنیم
  if (request.method !== 'GET') {
    return;
  }

  // FormSpree و CDN ها را از کش مستثنی کنیم
  if (
    url.hostname.includes('formspree') ||
    url.hostname.includes('cdn.tailwindcss') ||
    url.hostname.includes('cdnjs.cloudflare') ||
    url.hostname.includes('cdn.jsdelivr') ||
    url.hostname.includes('unpkg.com')
  ) {
    // Network First برای منابع خارجی
    event.respondWith(
      fetch(request)
        .then((response) => {
          // اگر موفق بود، یک کپی برای استفاده بعدی ذخیره کن
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // اگر شبکه در دسترس نبود، از کش استفاده کن
          return caches.match(request);
        })
    );
    return;
  }

  // Network First برای HTML files - همیشه از سرور بگیر
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // HTML را cache نکن - همیشه از سرور بگیر
          return response;
        })
        .catch(() => {
          // فقط در صورت عدم دسترسی به شبکه، از cache استفاده کن
          return caches.match(request) || caches.match('/index.html');
        })
    );
    return;
  }

  // Cache First برای فایل‌های استاتیک (تصاویر، فونت‌ها)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // فقط پاسخ‌های موفق را کش کن
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // اگر فایل در کش نیست و شبکه در دسترس نیست، null برگردان
            return null;
          });
      })
  );
});

// مدیریت پس‌زمینه و همگام‌سازی
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  // در آینده می‌توان داده‌های آفلاین را همگام‌سازی کرد
});

// مدیریت اعلان‌ها
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  // در آینده می‌توان اعلان‌های push را اضافه کرد
});

