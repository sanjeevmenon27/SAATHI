import axios from "axios";

const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
const defaultApiUrl = import.meta.env.PROD
  ? "/api"
  : `http://${hostname}:5000/api`;

export const getApiUrl = () => {
  if (typeof window !== "undefined") {
    let customUrl = localStorage.getItem("saathicare_api_url");
    if (customUrl) {
      customUrl = customUrl.trim();
      if (!customUrl.endsWith("/api") && !customUrl.endsWith("/api/")) {
        customUrl = customUrl.replace(/\/$/, "") + "/api";
      }
      return customUrl;
    }
  }

  const baseApiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;

  // Auto-detect if running on Android (webview / emulator) and trying to access localhost
  if (typeof window !== "undefined" && baseApiUrl.includes("localhost")) {
    const isAndroid = /android/i.test(navigator.userAgent) || 
                      (window.Capacitor && window.Capacitor.getPlatform?.() === "android");
    if (isAndroid) {
      return baseApiUrl.replace("localhost", "10.0.2.2");
    }
  }

  return baseApiUrl;
};

export const api = axios.create({});

api.interceptors.request.use((request) => {
  request.baseURL = getApiUrl();
  const token = localStorage.getItem("saathicare_token");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

