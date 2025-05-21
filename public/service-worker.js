// Service Worker pour le mode hors ligne
const CACHE_NAME = "stock-dashboard-cache-v1"
const OFFLINE_PAGE = "/offline.html"

// Ressources à mettre en cache lors de l'installation
const PRECACHE_RESOURCES = [
  "/",
  "/offline.html",
  "/favicon.ico",
  "/manifest.json",
  "/static/css/main.css",
  "/static/js/main.js",
]

// Installation du Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installation en cours")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Mise en cache des ressources")
        return cache.addAll(PRECACHE_RESOURCES)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activation en cours")

  // Supprimer les anciens caches
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Suppression de l'ancien cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Interception des requêtes fetch
self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes POST ou autres méthodes non GET
  if (event.request.method !== "GET") return

  // Ne pas intercepter les requêtes vers des API externes
  if (event.request.url.includes("/api/")) {
    // Stratégie network-first pour les API
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Mettre en cache la réponse
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // En cas d'échec, essayer de récupérer depuis le cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Si pas en cache, retourner la page hors ligne
            return caches.match(OFFLINE_PAGE)
          })
        }),
    )
    return
  }

  // Stratégie cache-first pour les ressources statiques
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retourner la ressource du cache si elle existe
      if (cachedResponse) {
        return cachedResponse
      }

      // Sinon, faire la requête réseau
      return fetch(event.request)
        .then((response) => {
          // Vérifier si la réponse est valide
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Mettre en cache la réponse
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })

          return response
        })
        .catch(() => {
          // En cas d'erreur réseau pour une page HTML, retourner la page hors ligne
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match(OFFLINE_PAGE)
          }
        })
    }),
  )
})

// Écouter les messages du client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
