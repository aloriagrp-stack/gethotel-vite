'use client';

import React, { useCallback } from "react";

export default function AICopilot() {
  const handleOpenAIMode = useCallback(() => {
    if (typeof window === "undefined") return;
    const isProd = window.location.hostname === "gethotelstays.com" || window.location.hostname.endsWith(".gethotelstays.com");
    const targetBaseUrl = isProd ? "https://ai.gethotelstays.com" : "http://localhost:5185";
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const targetUrl = token ? `${targetBaseUrl}?token=${encodeURIComponent(token)}` : targetBaseUrl;

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <button
      onClick={handleOpenAIMode}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-12 rounded-full px-6 bg-brand-600 hover:bg-[#002f87] text-white text-[12px] font-bold uppercase tracking-wider shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
      title="Open GetHotelStays AI Assistant"
      aria-label="Open GetHotelStays AI Assistant"
    >
      AI Mode
    </button>
  );
}
