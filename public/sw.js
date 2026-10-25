/**
 * Collège Isaac Newton - Service Worker PWA & Offline Cache
 * Spécialement optimisé pour les conditions réseau instables (Port-au-Prince, Haïti)
 * 
 * Stratégies de mise en cache :
 * - Navigation / HTML : Réseau d'abord (Network-First) avec repli immédiat sur le cache hors-ligne
 * - CSS & JS : Stale-While-Revalidate pour un affichage instantané et mise à jour en arrière-plan
 * - Images (WebP, JPG, PNG, SVG) : Cache-First avec remplissage dynamique
 * - Données scolaires GET (/api/) : Network-First avec repli sur le cache pour consultation continue
 * - Polices (Google Fonts / CDN) : Cache-First longue durée
 */

const CACHE_VERSION = 'v1.1.0';
const CACHE_STATIC_NAME = `cin-static-${CACHE_VERSION}`;
const CACHE_IMAGES_NAME = `cin-images-${CACHE_VERSION}`;
const CACHE_API_NAME = `cin-api-${CACHE_VERSION}`;

// Ressources critiques indispensables au fonctionnement de base de l'application
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// Limite maximale d'images conservées en cache pour préserver le stockage local de l'appareil
const MAX_IMAGE_ENTRIES = 80;

// Nettoyage LRU simple pour les caches volumineux
async function limitCacheEntries(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      // Supprime les plus anciennes entrées
      const toDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(toDelete.map((key) => cache.delete(key)));
    }
  } catch (err) {
    console.warn('[SW] Erreur lors du nettoyage du cache:', err);
  }
}

// ==============================================================================
// 1. INSTALLATION : Pré-mise en cache des ressources critiques
// ==============================================================================
self.addEventListener('install', (event) => {
  // Force l'activation immédiate du nouveau Service Worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(async (cache) => {
      // Pré-mise en cache tolérante : chaque ressource est chargée indépendamment
      const precachePromises = PRECACHE_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn(`[SW Precache] Impossible de pré-charger ${url}:`, err.message);
        }
      });
      return Promise.all(precachePromises);
    })
  );
});

// ==============================================================================
// 2. ACTIVATION : Nettoyage des anciennes versions et prise de contrôle
// ==============================================================================
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_STATIC_NAME, CACHE_IMAGES_NAME, CACHE_API_NAME];

  event.waitUntil(
    (async () => {
      // Supprime tous les anciens caches incompatibles
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('[SW] Suppression de l\'ancien cache obsolète :', name);
            return caches.delete(name);
          })
      );

      // Prend immédiatement le contrôle des clients ouverts
      await self.clients.claim();
    })()
  );
});

// ==============================================================================
// 3. INTERCEPTION DES REQUÊTES (FETCH)
// ==============================================================================
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP/HTTPS (ex: chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les méthodes non-GET (POST, PUT, DELETE, PATCH doivent toujours aller au serveur)
  if (request.method !== 'GET') {
    return;
  }

  // Cas A : Navigation principale (Page HTML) -> Network-First avec repli sur le cache
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Tente le réseau avec un timeout de repli rapide si la connexion est instable
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_STATIC_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (err) {
          // Réseau hors ligne ou instable : on bascule sur le cache
        }

        // Tente de récupérer la page demandée ou le shell principal
        const cachedPage = await caches.match(request);
        if (cachedPage) return cachedPage;

        const cachedIndex = await caches.match('/index.html') || await caches.match('/');
        if (cachedIndex) return cachedIndex;

        // Écran de secours minimal hors-ligne si aucune page en cache
        return new Response(
          `<!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Collège Isaac Newton | Mode Hors Ligne</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 2rem; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
              .card { max-width: 480px; background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; }
              h1 { color: #f59e0b; margin-bottom: 0.5rem; font-size: 1.5rem; }
              p { color: #94a3b8; line-height: 1.5; font-size: 0.95rem; }
              button { background: #2563eb; color: #fff; border: 0; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Collège Isaac Newton</h1>
              <p>📡 Connexion internet instable ou interrompue (Port-au-Prince).</p>
              <p>La page demandée n'est pas encore en mémoire cache. Dès que le signal sera rétabli, vous pourrez reprendre votre consultation.</p>
              <button onclick="window.location.reload()">Réessayer la connexion</button>
            </div>
          </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })()
    );
    return;
  }

  // Cas B : Données de l'API scolaire en GET (/api/) -> Network-First avec repli sur cache
  if (url.pathname.startsWith('/api/')) {
    // Endpoints sûrs à mettre en cache pour consultation hors ligne (annonces, slides, articles, agenda, paramètres, documents)
    const isCacheableApi = 
      url.pathname.startsWith('/api/settings') ||
      url.pathname.startsWith('/api/hero-slides') ||
      url.pathname.startsWith('/api/news') ||
      url.pathname.startsWith('/api/events') ||
      url.pathname.startsWith('/api/gallery') ||
      url.pathname.startsWith('/api/content-blocks') ||
      url.pathname.startsWith('/api/official-documents') ||
      url.pathname.startsWith('/api/site-images') ||
      url.pathname.startsWith('/api/stats');

    if (isCacheableApi) {
      event.respondWith(
        (async () => {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(CACHE_API_NAME);
              cache.put(request, networkResponse.clone());
              return networkResponse;
            }
          } catch (err) {
            // Réseau en échec
          }

          // Repli sur le cache local
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fallback JSON vide sécurisé pour éviter un crash frontend
          return new Response(JSON.stringify({ offline: true, data: [] }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          });
        })()
      );
      return;
    }

    // Autres requêtes API non-mises en cache (ex: authentification, logs, audit) -> réseau pur
    return;
  }

  // Cas C : Polices Google Fonts et CDN de styles -> Cache-First
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            const cache = await caches.open(CACHE_STATIC_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cached || new Response('', { status: 408 });
        }
      })()
    );
    return;
  }

  // Cas D : Images & Médias -> Cache-First avec mise en cache dynamique
  const isImage = 
    request.destination === 'image' ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/assets/images/') ||
    url.pathname.startsWith('/src/assets/images/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|avif)$/i);

  if (isImage) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            const cache = await caches.open(CACHE_IMAGES_NAME);
            cache.put(request, networkResponse.clone());
            // Nettoyage régulier pour éviter la saturation mémoire
            limitCacheEntries(CACHE_IMAGES_NAME, MAX_IMAGE_ENTRIES);
          }
          return networkResponse;
        } catch (err) {
          // Si l'image n'est pas en cache et le réseau est coupé, renvoyer l'icône favicon ou logo si possible
          const fallbackIcon = await caches.match('/favicon.svg');
          if (fallbackIcon) return fallbackIcon;
          return new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // Cas E : Fichiers statiques CSS, JS, WOFF -> Stale-While-Revalidate
  const isStaticAsset = 
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        const fetchPromise = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(CACHE_STATIC_NAME);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Si présent en cache, on sert immédiatement, la mise à jour se fait en arrière-plan
        return cached || (await fetchPromise);
      })()
    );
    return;
  }

  // Pour toutes les autres requêtes : comportement réseau standard avec repli cache
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        return response;
      } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw err;
      }
    })()
  );
});

// ==============================================================================
// 4. MESSAGES ENTRE LE CLIENT ET LE SERVICE WORKER
// ==============================================================================
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }

  if (event.data.type === 'GET_CACHE_INFO') {
    caches.keys().then(async (names) => {
      let totalEntries = 0;
      for (const name of names) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        totalEntries += keys.length;
      }
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          version: CACHE_VERSION,
          cacheNames: names,
          totalEntries
        });
      }
    });
  }
});
