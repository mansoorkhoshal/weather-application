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

const gifs = {
  Thunderstorm: Thunderstorm,
  Drizzle: Rain,
  Rain: Rain,
  Snow: SnowDay,
  Clear: { day: ClearDay, night: ClearNight },
  Clouds: { day: CloudsDay, night: CloudsNight },
  Mist: Haze,
  Smoke: Haze,
  Haze: Haze,
  Fog: Haze,
  default: video,
};

const WeatherBackground = ({ condition }) => {
  // condition can be your API object or a simplified shape.
  // Try to determine weather main type and day/night info
  const weatherMain = condition?.main || condition?.weather?.[0]?.main || null;

  // Determine day/night: prefer provided flag, otherwise use icon ending (OpenWeather uses 'd' or 'n')
  const isDayFromIcon =
    condition?.weather && condition.weather[0]?.icon
      ? condition.weather[0].icon.endsWith("d")
      : null;

  // Fallback: if API provided sunrise/sunset + current dt, determine day/night
  let isDay = null;
  if (typeof condition?.isDay === "boolean") {
    isDay = condition.isDay;
  } else if (isDayFromIcon !== null) {
    isDay = isDayFromIcon;
  } else if (
    condition?.sys?.sunrise &&
    condition?.sys?.sunset &&
    condition?.dt
  ) {
    const localTime = condition.dt + (condition.timezone ?? 0); // seconds
    isDay =
      localTime >= condition.sys.sunrise && localTime < condition.sys.sunset;
  }

  const asset = weatherMain ? gifs[weatherMain] : null;

  const getBackground = () => {
    if (!asset) return gifs.default;
    // If asset is an object with day/night choose accordingly
    if (typeof asset === "object" && ("day" in asset || "night" in asset)) {
      // default to day if unknown
      return isDay === false
        ? asset.night ?? asset.day
        : asset.day ?? asset.night;
    }
    // otherwise it's a single asset (gif or video)
    return asset;
  };

  const background = getBackground();
  const isVideo =
    typeof background === "string" && background.endsWith?.(".mp4");

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {isVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-100"
        >
          <source src={background} type="video/mp4" />
        </video>
      ) : (
        <img
          src={background}
          alt="weather background"
          className="w-full h-full object-cover opacity-20"
        />
      )}

      {/* overlay to darken content for legibility */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default WeatherBackground;
