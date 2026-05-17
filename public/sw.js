const VERSION = 'v1'
const STATIC_CACHE = `civics-static-${VERSION}`
const RUNTIME_CACHE = `civics-runtime-${VERSION}`

const PRECACHE_URLS = ['/data/questions.json', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((u) =>
            cache.add(u).catch(() => {
              /* ignore individual failures */
            }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/data/')) return

  if (
    url.pathname === '/data/questions.json' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE))
    return
  }

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req))
    return
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE))
  }
})

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(req)
  if (cached) return cached
  try {
    const res = await fetch(req)
    if (res && res.ok) cache.put(req, res.clone())
    return res
  } catch (err) {
    if (cached) return cached
    throw err
  }
}

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE)
  try {
    const res = await fetch(req)
    if (res && res.ok) cache.put(req, res.clone())
    return res
  } catch {
    const cached = await cache.match(req)
    if (cached) return cached
    return new Response(
      `<!doctype html><meta charset="utf-8"><title>Offline</title>
       <style>body{background:#0f0f0f;color:#fff;font:16px system-ui;padding:32px}</style>
       <h1>You're offline</h1><p>Study questions are cached. Reconnect to sign in or save progress.</p>`,
      { headers: { 'content-type': 'text/html' }, status: 503 },
    )
  }
}
