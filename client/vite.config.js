import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const manifest = JSON.stringify(
  {
    name: "SaathiCare",
    short_name: "SaathiCare",
    description: "Care companion booking platform for elderly people and their families.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff9f1",
    theme_color: "#f29f38",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  },
  null,
  2
);

const icon192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-label="SaathiCare icon">
  <rect width="192" height="192" rx="48" fill="#fff9f1"/>
  <rect x="24" y="24" width="144" height="144" rx="38" fill="#f29f38"/>
  <path d="M96 48c9 0 18 3 24 9 13 13 13 34 0 47L96 128 72 104c-13-13-13-34 0-47 6-6 15-9 24-9Z" fill="#fff9f1"/>
  <path d="M58 110c10-7 22-11 38-11s28 4 38 11" fill="none" stroke="#3f2a16" stroke-linecap="round" stroke-width="10"/>
</svg>`;

const icon512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="SaathiCare icon">
  <rect width="512" height="512" rx="128" fill="#fff9f1"/>
  <rect x="64" y="64" width="384" height="384" rx="104" fill="#f29f38"/>
  <path d="M256 128c25 0 47 8 64 25 35 35 35 92 0 127l-64 64-64-64c-35-35-35-92 0-127 17-17 39-25 64-25Z" fill="#fff9f1"/>
  <path d="M155 294c26-20 59-31 101-31s75 11 101 31" fill="none" stroke="#3f2a16" stroke-linecap="round" stroke-width="24"/>
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="SaathiCare favicon">
  <rect width="64" height="64" rx="16" fill="#f29f38"/>
  <path d="M32 16c6 0 12 2 16 6 9 9 9 22 0 31L32 48 16 48c-9-9-9-22 0-31 4-4 10-6 16-6Z" fill="#fff9f1"/>
</svg>`;

const serviceWorker = `const CACHE_NAME = "saathicare-v1";
const APP_SHELL = ["/", "/manifest.json", "/icons/icon-192.svg", "/icons/icon-512.svg", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => caches.match("/"));
    })
  );
});`;

const pwaAssetsPlugin = () => ({
  name: "saathicare-pwa-assets",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "manifest.json", source: manifest });
    this.emitFile({ type: "asset", fileName: "favicon.svg", source: favicon });
    this.emitFile({ type: "asset", fileName: "service-worker.js", source: serviceWorker });
    this.emitFile({ type: "asset", fileName: "icons/icon-192.svg", source: icon192 });
    this.emitFile({ type: "asset", fileName: "icons/icon-512.svg", source: icon512 });
  }
});

export default defineConfig({
  plugins: [react(), pwaAssetsPlugin()],
  publicDir: false,
  server: {
    host: true,
    port: 5173
  }
});
