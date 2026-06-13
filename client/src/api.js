import axios from "axios";

export const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return "/api";
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "localhost";
    const isAndroid = /android/i.test(navigator.userAgent) ||
                      (window.Capacitor && window.Capacitor.getPlatform?.() === "android");

    if (isAndroid && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return "http://10.0.2.2:5000/api";
    }

    return `http://${hostname}:5000/api`;
  }

  return "http://localhost:5000/api";
};

// SC-24: withCredentials ensures httpOnly cookies are sent on every request.
// The JWT is no longer stored in localStorage (inaccessible to JavaScript).
export const api = axios.create({ withCredentials: true });

api.interceptors.request.use((request) => {
  request.baseURL = getApiUrl();
  // SC-24: No Authorization header — the httpOnly cookie is sent automatically by the browser.
  return request;
});
