import { X, Globe, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { getApiUrl } from "../api";

export const ApiSettingsModal = ({ isOpen, onClose }) => {
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getApiUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiUrl.trim()) {
      localStorage.setItem("saathicare_api_url", apiUrl.trim());
      // Reload the page to apply the new base URL immediately
      window.location.reload();
    }
  };

  const handleReset = () => {
    localStorage.removeItem("saathicare_api_url");
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-xl ring-1 ring-saffron-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl hover:bg-cream-50 transition text-cocoa-750"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-saffron-100 text-saffron-700 rounded-2xl">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cocoa-900">API Settings</h2>
            <p className="text-xs text-cocoa-700">Configure connection to the server</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-cocoa-900 mb-2">
              Server API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. http://192.168.1.100:5000/api"
              className="w-full rounded-2xl border border-saffron-200 bg-cream-50 px-4 py-3.5 text-base text-cocoa-900 outline-none transition focus:border-saffron-500 focus:bg-white focus:ring-4 focus:ring-saffron-100"
            />
            <p className="mt-2 text-xs text-cocoa-700 leading-relaxed">
              If running the server locally, enter your computer's IP address (e.g. <code>http://192.168.1.X:5000/api</code>). If deployed, enter the production API URL.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 inline-flex min-h-12 items-center justify-center rounded-full bg-saffron-500 text-base font-semibold text-white transition hover:bg-saffron-700 active:scale-[0.98]"
            >
              Save & Reload
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-12 w-12 items-center justify-center rounded-full border border-saffron-200 bg-cream-50 text-cocoa-750 transition hover:bg-cream-100 active:scale-[0.98]"
              title="Reset to Default"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
