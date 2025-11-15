// src/components/WeatherBackground.jsx
import React from "react";
import Thunderstorm from "../assets/Thunderstorm.gif";
import Rain from "../assets/Rain.gif";
import SnowDay from "../assets/Snow.gif";
import ClearDay from "../assets/ClearDay.gif";
import ClearNight from "../assets/ClearNight.gif";
import CloudsDay from "../assets/CloudsDay.gif";
import CloudsNight from "../assets/CloudsNight.gif";
import Haze from "../assets/Haze.gif";
import video from "../assets/video1.mp4";

/**
 * Enhanced WeatherBackground
 * - Accepts either the full OpenWeather `weather` object OR the minimal `{ main, isDay }`
 * - Picks a GIF or video depending on condition, chooses day/night frames where available
 * - Adds animated gradient, drifting cloud overlay, floating particles, and sun/moon glow
 */

const gifs = {
  Thunderstorm,
  Drizzle: Rain,
  Rain,
  Snow: SnowDay,
  Clear: { day: ClearDay, night: ClearNight },
  Clouds: { day: CloudsDay, night: CloudsNight },
  Mist: Haze,
  Smoke: Haze,
  Haze,
  Fog: Haze,
  default: video,
};

const SunSVG = ({ size = 72 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    className="drop-shadow-[0_6px_18px_rgba(255,200,80,0.12)]"
  >
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1.4">
      <path d="M12 1v2" />
      <path d="M12 21v2" />
      <path d="M4.22 4.22l1.42 1.42" />
      <path d="M18.36 18.36l1.42 1.42" />
      <path d="M1 12h2" />
      <path d="M21 12h2" />
      <path d="M4.22 19.78l1.42-1.42" />
      <path d="M18.36 5.64l1.42-1.42" />
    </g>
  </svg>
);

const MoonSVG = ({ size = 72 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    className="drop-shadow-[0_6px_18px_rgba(160,180,255,0.08)]"
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
  </svg>
);

const WeatherBackground = ({ condition }) => {
  // Accept either:
  // - Full openweather object (has weather[0].main, sys, dt...)
  // - Minimal { main, isDay }
  const weatherMain =
    condition?.main ??
    condition?.weather?.[0]?.main ??
    (Array.isArray(condition?.weather) && condition.weather[0]?.main) ??
    null;

  // Decide if day: prefer explicit boolean, then icon letter, then sys/dt if available
  let isDay = null;
  if (typeof condition?.isDay === "boolean") {
    isDay = condition.isDay;
  } else if (condition?.weather && condition.weather[0]?.icon) {
    isDay = condition.weather[0].icon.endsWith("d");
  } else if (
    typeof condition?.dt === "number" &&
    condition?.sys?.sunrise &&
    condition?.sys?.sunset
  ) {
    // compare local times (assumes unix seconds)
    isDay =
      condition.dt >= condition.sys.sunrise &&
      condition.dt < condition.sys.sunset;
  } else if (typeof condition?.isDay === "undefined") {
    // if nothing available, default to true for nicer visual
    isDay = true;
  }

  // pick asset
  const asset = weatherMain ? gifs[weatherMain] ?? gifs.default : gifs.default;

  const pickAsset = () => {
    if (!asset) return gifs.default;
    if (typeof asset === "object" && ("day" in asset || "night" in asset)) {
      return isDay === false
        ? asset.night ?? asset.day
        : asset.day ?? asset.night;
    }
    return asset;
  };

  const background = pickAsset();
  const isVideo =
    typeof background === "string" && background.toLowerCase().endsWith(".mp4");

  // dynamic opacities / tints to keep content readable
  const bgImgOpacity = isDay ? "opacity-40" : "opacity-25";
  const gradientFrom = isDay
    ? "from-[rgba(255,255,255,0.06)]"
    : "from-[rgba(8,12,30,0.6)]";
  const gradientTo = isDay ? "to-[rgba(0,0,0,0.18)]" : "to-[rgba(0,0,0,0.6)]";
  const skyTint = isDay ? "bg-gradient-to-b" : "bg-gradient-to-b";

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* animated background media */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${bgImgOpacity}`}
      >
        {isVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            aria-hidden
          >
            <source src={background} type="video/mp4" />
          </video>
        ) : (
          <img
            src={background}
            alt="weather background"
            className="w-full h-full object-cover"
            aria-hidden
          />
        )}
      </div>

      {/* subtle multi-layer overlays */}
      <div
        className={`absolute inset-0 ${skyTint} ${gradientFrom} ${gradientTo} mix-blend-multiply transition-opacity duration-700`}
        style={{ pointerEvents: "none" }}
      />

      {/* drifting cloud overlay (semi-transparent) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-10 w-[140%] h-[45%] opacity-20 animate-clouds" />
        <div className="absolute top-10 -right-20 w-[120%] h-[40%] opacity-12 animate-clouds-slow" />
      </div>

      {/* floating particles for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-4 top-1/4 w-1 h-1 rounded-full bg-white/30 animate-float delay-0" />
        <div className="absolute left-1/3 top-3/4 w-1.5 h-1.5 rounded-full bg-white/20 animate-float delay-200" />
        <div className="absolute right-[12%] top-[15%] w-2 h-2 rounded-full bg-white/16 animate-float delay-400" />
        <div className="absolute right-6 bottom-1/3 w-1 h-1 rounded-full bg-white/12 animate-float delay-600" />
      </div>

      {/* sun / moon with glow */}
      <div
        className={`absolute top-6 right-6 z-10 transform-gpu transition-all duration-700 ${
          isDay ? "text-amber-400" : "text-sky-300"
        }`}
        aria-hidden
      >
        <div
          className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
            isDay
              ? "bg-gradient-to-br from-amber-300/30 to-amber-400/10"
              : "bg-gradient-to-br from-sky-700/20 to-slate-900/10"
          }`}
          style={{
            boxShadow: isDay
              ? "0 10px 40px rgba(255,170,60,0.18)"
              : "0 10px 40px rgba(80,110,255,0.08)",
            backdropFilter: "blur(6px)",
          }}
        >
          {isDay ? <SunSVG size={56} /> : <MoonSVG size={56} />}
        </div>
      </div>

      {/* top vignette for extra contrast */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 to-transparent" />
      </div>

      {/* embedded CSS keyframes used by the component */}
      <style>{`
        /* drifting cloud pseudo layers (using radial-gradients to keep self-contained) */
        .animate-clouds {
          background: radial-gradient(40% 40% at 10% 30%, rgba(255,255,255,0.12), transparent 30%),
                      radial-gradient(35% 35% at 70% 60%, rgba(255,255,255,0.10), transparent 30%),
                      radial-gradient(25% 25% at 40% 20%, rgba(255,255,255,0.08), transparent 30%);
          transform: translateX(0);
          animation: cloudsMove 28s linear infinite;
          filter: blur(18px);
        }
        .animate-clouds-slow {
          background: radial-gradient(40% 40% at 30% 30%, rgba(255,255,255,0.08), transparent 30%),
                      radial-gradient(35% 35% at 80% 40%, rgba(255,255,255,0.06), transparent 30%);
          transform: translateX(0);
          animation: cloudsMove 44s linear infinite reverse;
          filter: blur(26px);
        }

        @keyframes cloudsMove {
          0% { transform: translateX(-6%); }
          50% { transform: translateX(6%); }
          100% { transform: translateX(-6%); }
        }

        /* floating tiny particles */
        .animate-float {
          transform: translateY(0) translateX(0);
          animation: floatY 6s ease-in-out infinite;
          border-radius: 9999px;
        }
        .animate-float.delay-0 { animation-delay: 0s; }
        .animate-float.delay-200 { animation-delay: 0.2s; }
        .animate-float.delay-400 { animation-delay: 0.4s; }
        .animate-float.delay-600 { animation-delay: 0.6s; }

        @keyframes floatY {
          0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 1; }
          50% { transform: translateY(-14px) translateX(6px) scale(0.96); opacity: 0.8; }
          100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 1; }
        }

        /* slight bounce for the sun/moon for life */
        .transform-gpu > div {
          animation: gentlePulse 6s ease-in-out infinite;
        }
        @keyframes gentlePulse {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default WeatherBackground;
