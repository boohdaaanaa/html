const CACHE_NAME = "pwa-cache-v1";

// Масив файлів, які будуть закешовані для роботи офлайн
const ASSETS = [
  "/",  
  "/index.html",       
  "/styles.css",       
  "/scripts.js",         
  "/students.html",   
  "/manifest.json",    
  "/messages.html",    
  "/scrin1.png",
  "/scrin2.png",
  "/scrin3.png",
  "/tasks.html",       
  "/bell.png",
  "/delete.png",
  "/edit.png",
  "/logo.png",
  "/profile.png", 
  "/profile-icon-png-898.png",  
];

// Встановлення Service Worker та кешування файлів
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(console.error); // Додаємо файли до кешу
    })
  );
});

// Обробка запитів (отримання файлів)
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Якщо запит не є HTTP/HTTPS або це Chrome Extension - ігноруємо його
  if (!url.startsWith("http") || url.startsWith("chrome-extension")) {
    console.warn("SW: Пропускаю запит", url);
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse; // Якщо файл є в кеші, повертаємо його

      return fetch(event.request) // Інакше завантажуємо з мережі
        .then((networkResponse) => {
          // Перевіряємо, чи отримано коректну відповідь
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()).catch((err) => {
              console.warn("SW: Не вдалося кешувати", event.request.url, err);
            });
            return networkResponse; // Повертаємо відповідь клієнту
          });
        })
        .catch(() => caches.match("/offline.html")); // Якщо немає мережі, повертаємо офлайн-сторінку
    })
  );
});

// Видалення старих кешів при активації нового Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // Відбираємо всі кеші, крім актуального
          .map((key) => caches.delete(key)) // Видаляємо застарілі кеші
      );
    })
  );
});