// vite.config.js
import { defineConfig } from "file:///C:/pdd/node_modules/vite/dist/node/index.js";
import react from "file:///C:/pdd/node_modules/@vitejs/plugin-react/dist/index.js";
var manifest = JSON.stringify(
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
var icon192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-label="SaathiCare icon">
  <rect width="192" height="192" rx="48" fill="#fff9f1"/>
  <rect x="24" y="24" width="144" height="144" rx="38" fill="#f29f38"/>
  <path d="M96 48c9 0 18 3 24 9 13 13 13 34 0 47L96 128 72 104c-13-13-13-34 0-47 6-6 15-9 24-9Z" fill="#fff9f1"/>
  <path d="M58 110c10-7 22-11 38-11s28 4 38 11" fill="none" stroke="#3f2a16" stroke-linecap="round" stroke-width="10"/>
</svg>`;
var icon512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="SaathiCare icon">
  <rect width="512" height="512" rx="128" fill="#fff9f1"/>
  <rect x="64" y="64" width="384" height="384" rx="104" fill="#f29f38"/>
  <path d="M256 128c25 0 47 8 64 25 35 35 35 92 0 127l-64 64-64-64c-35-35-35-92 0-127 17-17 39-25 64-25Z" fill="#fff9f1"/>
  <path d="M155 294c26-20 59-31 101-31s75 11 101 31" fill="none" stroke="#3f2a16" stroke-linecap="round" stroke-width="24"/>
</svg>`;
var favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="SaathiCare favicon">
  <rect width="64" height="64" rx="16" fill="#f29f38"/>
  <path d="M32 16c6 0 12 2 16 6 9 9 9 22 0 31L32 48 16 48c-9-9-9-22 0-31 4-4 10-6 16-6Z" fill="#fff9f1"/>
</svg>`;
var serviceWorker = `const CACHE_NAME = "saathicare-v1";
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
var pwaAssetsPlugin = () => ({
  name: "saathicare-pwa-assets",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "manifest.json", source: manifest });
    this.emitFile({ type: "asset", fileName: "favicon.svg", source: favicon });
    this.emitFile({ type: "asset", fileName: "service-worker.js", source: serviceWorker });
    this.emitFile({ type: "asset", fileName: "icons/icon-192.svg", source: icon192 });
    this.emitFile({ type: "asset", fileName: "icons/icon-512.svg", source: icon512 });
  }
});
var vite_config_default = defineConfig({
  plugins: [react(), pwaAssetsPlugin()],
  publicDir: false,
  server: {
    host: true,
    port: 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxwZGRcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxwZGRcXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9wZGQvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcblxuY29uc3QgbWFuaWZlc3QgPSBKU09OLnN0cmluZ2lmeShcbiAge1xuICAgIG5hbWU6IFwiU2FhdGhpQ2FyZVwiLFxuICAgIHNob3J0X25hbWU6IFwiU2FhdGhpQ2FyZVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkNhcmUgY29tcGFuaW9uIGJvb2tpbmcgcGxhdGZvcm0gZm9yIGVsZGVybHkgcGVvcGxlIGFuZCB0aGVpciBmYW1pbGllcy5cIixcbiAgICBzdGFydF91cmw6IFwiL1wiLFxuICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxuICAgIGJhY2tncm91bmRfY29sb3I6IFwiI2ZmZjlmMVwiLFxuICAgIHRoZW1lX2NvbG9yOiBcIiNmMjlmMzhcIixcbiAgICBvcmllbnRhdGlvbjogXCJwb3J0cmFpdC1wcmltYXJ5XCIsXG4gICAgaWNvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgc3JjOiBcIi9pY29ucy9pY29uLTE5Mi5zdmdcIixcbiAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgICAgICB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIixcbiAgICAgICAgcHVycG9zZTogXCJhbnkgbWFza2FibGVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3JjOiBcIi9pY29ucy9pY29uLTUxMi5zdmdcIixcbiAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIixcbiAgICAgICAgcHVycG9zZTogXCJhbnkgbWFza2FibGVcIlxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAgbnVsbCxcbiAgMlxuKTtcblxuY29uc3QgaWNvbjE5MiA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDE5MiAxOTJcIiByb2xlPVwiaW1nXCIgYXJpYS1sYWJlbD1cIlNhYXRoaUNhcmUgaWNvblwiPlxuICA8cmVjdCB3aWR0aD1cIjE5MlwiIGhlaWdodD1cIjE5MlwiIHJ4PVwiNDhcIiBmaWxsPVwiI2ZmZjlmMVwiLz5cbiAgPHJlY3QgeD1cIjI0XCIgeT1cIjI0XCIgd2lkdGg9XCIxNDRcIiBoZWlnaHQ9XCIxNDRcIiByeD1cIjM4XCIgZmlsbD1cIiNmMjlmMzhcIi8+XG4gIDxwYXRoIGQ9XCJNOTYgNDhjOSAwIDE4IDMgMjQgOSAxMyAxMyAxMyAzNCAwIDQ3TDk2IDEyOCA3MiAxMDRjLTEzLTEzLTEzLTM0IDAtNDcgNi02IDE1LTkgMjQtOVpcIiBmaWxsPVwiI2ZmZjlmMVwiLz5cbiAgPHBhdGggZD1cIk01OCAxMTBjMTAtNyAyMi0xMSAzOC0xMXMyOCA0IDM4IDExXCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIjM2YyYTE2XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS13aWR0aD1cIjEwXCIvPlxuPC9zdmc+YDtcblxuY29uc3QgaWNvbjUxMiA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDUxMiA1MTJcIiByb2xlPVwiaW1nXCIgYXJpYS1sYWJlbD1cIlNhYXRoaUNhcmUgaWNvblwiPlxuICA8cmVjdCB3aWR0aD1cIjUxMlwiIGhlaWdodD1cIjUxMlwiIHJ4PVwiMTI4XCIgZmlsbD1cIiNmZmY5ZjFcIi8+XG4gIDxyZWN0IHg9XCI2NFwiIHk9XCI2NFwiIHdpZHRoPVwiMzg0XCIgaGVpZ2h0PVwiMzg0XCIgcng9XCIxMDRcIiBmaWxsPVwiI2YyOWYzOFwiLz5cbiAgPHBhdGggZD1cIk0yNTYgMTI4YzI1IDAgNDcgOCA2NCAyNSAzNSAzNSAzNSA5MiAwIDEyN2wtNjQgNjQtNjQtNjRjLTM1LTM1LTM1LTkyIDAtMTI3IDE3LTE3IDM5LTI1IDY0LTI1WlwiIGZpbGw9XCIjZmZmOWYxXCIvPlxuICA8cGF0aCBkPVwiTTE1NSAyOTRjMjYtMjAgNTktMzEgMTAxLTMxczc1IDExIDEwMSAzMVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiIzNmMmExNlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2Utd2lkdGg9XCIyNFwiLz5cbjwvc3ZnPmA7XG5cbmNvbnN0IGZhdmljb24gPSBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCA2NCA2NFwiIHJvbGU9XCJpbWdcIiBhcmlhLWxhYmVsPVwiU2FhdGhpQ2FyZSBmYXZpY29uXCI+XG4gIDxyZWN0IHdpZHRoPVwiNjRcIiBoZWlnaHQ9XCI2NFwiIHJ4PVwiMTZcIiBmaWxsPVwiI2YyOWYzOFwiLz5cbiAgPHBhdGggZD1cIk0zMiAxNmM2IDAgMTIgMiAxNiA2IDkgOSA5IDIyIDAgMzFMMzIgNDggMTYgNDhjLTktOS05LTIyIDAtMzEgNC00IDEwLTYgMTYtNlpcIiBmaWxsPVwiI2ZmZjlmMVwiLz5cbjwvc3ZnPmA7XG5cbmNvbnN0IHNlcnZpY2VXb3JrZXIgPSBgY29uc3QgQ0FDSEVfTkFNRSA9IFwic2FhdGhpY2FyZS12MVwiO1xuY29uc3QgQVBQX1NIRUxMID0gW1wiL1wiLCBcIi9tYW5pZmVzdC5qc29uXCIsIFwiL2ljb25zL2ljb24tMTkyLnN2Z1wiLCBcIi9pY29ucy9pY29uLTUxMi5zdmdcIiwgXCIvZmF2aWNvbi5zdmdcIl07XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcImluc3RhbGxcIiwgKGV2ZW50KSA9PiB7XG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICBjYWNoZXMub3BlbihDQUNIRV9OQU1FKS50aGVuKChjYWNoZSkgPT4gY2FjaGUuYWRkQWxsKEFQUF9TSEVMTCkpLnRoZW4oKCkgPT4gc2VsZi5za2lwV2FpdGluZygpKVxuICApO1xufSk7XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcImFjdGl2YXRlXCIsIChldmVudCkgPT4ge1xuICBldmVudC53YWl0VW50aWwoXG4gICAgY2FjaGVzXG4gICAgICAua2V5cygpXG4gICAgICAudGhlbigoa2V5cykgPT4gUHJvbWlzZS5hbGwoa2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSBDQUNIRV9OQU1FKS5tYXAoKGtleSkgPT4gY2FjaGVzLmRlbGV0ZShrZXkpKSkpXG4gICAgICAudGhlbigoKSA9PiBzZWxmLmNsaWVudHMuY2xhaW0oKSlcbiAgKTtcbn0pO1xuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJmZXRjaFwiLCAoZXZlbnQpID0+IHtcbiAgaWYgKGV2ZW50LnJlcXVlc3QubWV0aG9kICE9PSBcIkdFVFwiKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZXZlbnQucmVzcG9uZFdpdGgoXG4gICAgY2FjaGVzLm1hdGNoKGV2ZW50LnJlcXVlc3QpLnRoZW4oKGNhY2hlZFJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoY2FjaGVkUmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlZFJlc3BvbnNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmV0Y2goZXZlbnQucmVxdWVzdClcbiAgICAgICAgLnRoZW4oKG5ldHdvcmtSZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlVG9DYWNoZSA9IG5ldHdvcmtSZXNwb25zZS5jbG9uZSgpO1xuICAgICAgICAgIGNhY2hlcy5vcGVuKENBQ0hFX05BTUUpLnRoZW4oKGNhY2hlKSA9PiBjYWNoZS5wdXQoZXZlbnQucmVxdWVzdCwgcmVzcG9uc2VUb0NhY2hlKSk7XG4gICAgICAgICAgcmV0dXJuIG5ldHdvcmtSZXNwb25zZTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IGNhY2hlcy5tYXRjaChcIi9cIikpO1xuICAgIH0pXG4gICk7XG59KTtgO1xuXG5jb25zdCBwd2FBc3NldHNQbHVnaW4gPSAoKSA9PiAoe1xuICBuYW1lOiBcInNhYXRoaWNhcmUtcHdhLWFzc2V0c1wiLFxuICBnZW5lcmF0ZUJ1bmRsZSgpIHtcbiAgICB0aGlzLmVtaXRGaWxlKHsgdHlwZTogXCJhc3NldFwiLCBmaWxlTmFtZTogXCJtYW5pZmVzdC5qc29uXCIsIHNvdXJjZTogbWFuaWZlc3QgfSk7XG4gICAgdGhpcy5lbWl0RmlsZSh7IHR5cGU6IFwiYXNzZXRcIiwgZmlsZU5hbWU6IFwiZmF2aWNvbi5zdmdcIiwgc291cmNlOiBmYXZpY29uIH0pO1xuICAgIHRoaXMuZW1pdEZpbGUoeyB0eXBlOiBcImFzc2V0XCIsIGZpbGVOYW1lOiBcInNlcnZpY2Utd29ya2VyLmpzXCIsIHNvdXJjZTogc2VydmljZVdvcmtlciB9KTtcbiAgICB0aGlzLmVtaXRGaWxlKHsgdHlwZTogXCJhc3NldFwiLCBmaWxlTmFtZTogXCJpY29ucy9pY29uLTE5Mi5zdmdcIiwgc291cmNlOiBpY29uMTkyIH0pO1xuICAgIHRoaXMuZW1pdEZpbGUoeyB0eXBlOiBcImFzc2V0XCIsIGZpbGVOYW1lOiBcImljb25zL2ljb24tNTEyLnN2Z1wiLCBzb3VyY2U6IGljb241MTIgfSk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgcHdhQXNzZXRzUGx1Z2luKCldLFxuICBwdWJsaWNEaXI6IGZhbHNlLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHBvcnQ6IDUxNzNcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStOLFNBQVMsb0JBQW9CO0FBQzVQLE9BQU8sV0FBVztBQUVsQixJQUFNLFdBQVcsS0FBSztBQUFBLEVBQ3BCO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxTQUFTO0FBQUEsSUFDVCxrQkFBa0I7QUFBQSxJQUNsQixhQUFhO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUVBLElBQU0sVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPaEIsSUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU9oQixJQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFLaEIsSUFBTSxnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBd0N0QixJQUFNLGtCQUFrQixPQUFPO0FBQUEsRUFDN0IsTUFBTTtBQUFBLEVBQ04saUJBQWlCO0FBQ2YsU0FBSyxTQUFTLEVBQUUsTUFBTSxTQUFTLFVBQVUsaUJBQWlCLFFBQVEsU0FBUyxDQUFDO0FBQzVFLFNBQUssU0FBUyxFQUFFLE1BQU0sU0FBUyxVQUFVLGVBQWUsUUFBUSxRQUFRLENBQUM7QUFDekUsU0FBSyxTQUFTLEVBQUUsTUFBTSxTQUFTLFVBQVUscUJBQXFCLFFBQVEsY0FBYyxDQUFDO0FBQ3JGLFNBQUssU0FBUyxFQUFFLE1BQU0sU0FBUyxVQUFVLHNCQUFzQixRQUFRLFFBQVEsQ0FBQztBQUNoRixTQUFLLFNBQVMsRUFBRSxNQUFNLFNBQVMsVUFBVSxzQkFBc0IsUUFBUSxRQUFRLENBQUM7QUFBQSxFQUNsRjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQztBQUFBLEVBQ3BDLFdBQVc7QUFBQSxFQUNYLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
