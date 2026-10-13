import React, { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      style={{
        width: "clamp(55px, 8vw, 85px)",
        height: "clamp(55px, 8vw, 85px)",
      }}
      className="rounded-full bg-slate-700/80 hover:bg-slate-600 shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-white"
      aria-label="מסך מלא"
    >
      {isFullscreen ? (
        <Minimize className="w-[50%] h-[50%]" strokeWidth={2.5} />
      ) : (
        <Maximize className="w-[50%] h-[50%]" strokeWidth={2.5} />
      )}
    </button>
  );
}