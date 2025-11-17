import { useEffect, useState } from "react";
import WeatherBackground from "./components/WeatherBackground";
import {
  convertTemperature,
  getVisibilityValue,
  getWindDirection,
} from "./components/Helper";
import {
  HumidityIcon,
  SunriseIcon,
  SunsetIcon,
  VisibilityIcon,
  WindIcon,
} from "./components/Icons";

const API_KEY = "85fb4ddd5585cf07d535bd7b4614e384";

const Loader = () => (
  <div className="flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
  </div>
);

const CardShell = ({ children, className = "" }) => (
  <div
    className={`bg-gradient-to-br from-white/3 to-white/6 border border-white/8 rounded-2xl p-5 shadow-xl backdrop-blur-md ${className}`}
  >
    {children}
  </div>
);

const CircularGauge = ({
  value = 0,
  size = 120,
  label = "Value",
  suffix = "",
}) => {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const dash = (circumference * pct) / 100;
  const remaining = circumference - dash;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="block">
        <defs>
          <linearGradient id={`g-${label}`} x1="0" x2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            r={radius}
            fill="none"
            stroke={`url(#g-${label})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${remaining}`}
            transform="rotate(-90)"
          />
        </g>
      </svg>

      <div className="mt-2 text-center">
        <div className="text-md text-white/80">{label}</div>
        <div className="text-lg font-bold">
          {value}
          {suffix}
        </div>
      </div>
    </div>
  );
};

const ForecastDay = ({ d, unit }) => {
  const date = new Date(d.dt * 1000);
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const icon = d.weather?.[0]?.icon;
  return (
    <div className="flex items-center justify-between gap-3 p-2 hover:bg-white/6 rounded-md transition">
      <div className="flex items-center gap-3">
        <div className="w-10 text-left">
          <div className="text-sm font-medium">{weekday}</div>
        </div>
        {icon && (
          <img
            src={`https://openweathermap.org/img/wn/${icon}.png`}
            className="w-10 h-10"
            alt=""
          />
        )}
      </div>
      <div className="text-right">
        <div className="font-semibold">
          {Math.round(convertTemperature(d.temp.max, unit))}°
        </div>
        <div className="text-md text-white/80">
          {Math.round(convertTemperature(d.temp.min, unit))}°
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("C"); // C or F
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle");

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const t = setTimeout(() => fetchSuggestions(city), 450);
      return () => clearTimeout(t);
    }
    setSuggestion([]);
  }, [city, weather]);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("asking");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationStatus("fetched");
        await fetchByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("geolocation error:", err);
        setLocationStatus("denied");
      },
      { timeout: 10000 }
    );
  };

  const fetchSuggestions = async (q) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          q
        )}&limit=5&appid=${API_KEY}`
      );
      if (res.ok) setSuggestion(await res.json());
      else setSuggestion([]);
    } catch (err) {
      console.warn("suggestions error", err);
      setSuggestion([]);
    }
  };

  const fetchByCoords = async (lat, lon) => {
    setError("");
    setLoading(true);
    setForecast(null);
    try {
      const units = unit === "C" ? "metric" : "imperial";

      const curRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      if (!curRes.ok) {
        const b = await curRes.json().catch(() => ({}));
        throw new Error(b.message || "Failed to fetch current weather");
      }
      const cur = await curRes.json();
      setWeather(cur);
      setCity(cur.name || "");

      const onecallV2Url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${API_KEY}`;
      let fRes = await fetch(onecallV2Url);

      if (!fRes.ok) {
        const body = await fRes.json().catch(() => ({}));
        console.warn("onecall v2.5 failed", body);
        const onecallV3Url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${API_KEY}`;
        try {
          fRes = await fetch(onecallV3Url);
          if (!fRes.ok) {
            const body3 = await fRes.json().catch(() => ({}));
            console.warn("onecall v3.0 also failed", body3);
            setForecast(null);
          } else {
            const f3 = await fRes.json();
            if (Array.isArray(f3.daily) && f3.daily.length > 0) setForecast(f3);
            else setForecast(null);
          }
        } catch (err) {
          console.warn("onecall v3 fetch error", err);
          setForecast(null);
        }
      } else {
        const f = await fRes.json();
        if (Array.isArray(f.daily) && f.daily.length > 0) setForecast(f);
        else setForecast(null);
      }
    } catch (err) {
      console.error("fetchByCoords error:", err);
      setError(err.message || "Unable to fetch");
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (url, name = "") => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "City not found");
      }
      const data = await res.json();
      setWeather(data);
      setCity(name || data.name || "");
      setSuggestion([]);

      if (data.coord?.lat && data.coord?.lon) {
        await fetchByCoords(data.coord.lat, data.coord.lon);
      } else {
        setForecast(null);
      }
    } catch (err) {
      console.error("fetchWeatherData error:", err);
      setError(err.message || "Failed to fetch");
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    if (!city.trim()) return setError("Please enter a valid city");
    const units = unit === "C" ? "metric" : "imperial";
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city.trim()
      )}&units=${units}&appid=${API_KEY}`
    );
  };

  const handleSuggestionClick = async (s) => {
    await fetchByCoords(s.lat, s.lon);
  };

  const toggleUnit = (newUnit) => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    if (weather?.coord?.lat && weather?.coord?.lon) {
      fetchByCoords(weather.coord.lat, weather.coord.lon);
    }
  };

  const formatTime = (sec) =>
    new Date(sec * 1000).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <WeatherBackground condition={weather ?? undefined} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <CardShell className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Weather App</h1>
                <p className="text-sm text-white/80 mt-1">
                  Allow location or search a city
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => requestLocation()}
                  className="px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Detect Location
                </button>
                <div className="text-md text-white/60">
                  {locationStatus === "asking"
                    ? "Requesting location…"
                    : locationStatus === "denied"
                    ? "Location denied"
                    : locationStatus === "fetched"
                    ? "Location detected"
                    : ""}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <form onSubmit={handleSearch} className="relative mb-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      className="w-full flex-1 px-4 py-3 rounded-lg bg-white/6 placeholder-white/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Search city or country"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition font-semibold flex items-center justify-center"
                    >
                      {loading ? <Loader /> : "Search"}
                    </button>
                  </div>

                  {suggestion?.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white/6 border border-white/10 rounded-lg overflow-hidden z-20">
                      {suggestion.map((s) => (
                        <button
                          key={`${s.lat}-${s.lon}`}
                          type="button"
                          onClick={() => handleSuggestionClick(s)}
                          className="w-full text-left px-4 py-3 hover:bg-white/8 transition"
                        >
                          <div className="flex justify-between">
                            <span>
                              {s.name}
                              {s.state ? `, ${s.state}` : ""} — {s.country}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </form>

                {weather && (
                  <div className="mb-4">
                    <CardShell>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-white/6 flex items-center justify-center">
                            <img
                              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                              alt=""
                              className="w-12 h-12"
                            />
                          </div>
                          <div>
                            <div className="text-xl font-bold">
                              {weather.name}
                            </div>
                            <div className="text-sm text-white/80 capitalize">
                              {weather.weather[0].description}
                            </div>
                            <div className="text-md text-white/70 mt-1">
                              {new Date(
                                Date.now() + (weather.timezone ?? 0) * 1000
                              ).toLocaleDateString()}{" "}
                              •{" "}
                              {new Date(
                                Date.now() + (weather.timezone ?? 0) * 1000
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-sm text-white/80 mr-3">
                            Units
                          </div>
                          <div className="flex gap-2">
                            <button
                              className={`px-3 py-1 rounded-full ${
                                unit === "C" ? "bg-white/12" : "bg-white/6"
                              } transition`}
                              onClick={() => toggleUnit("C")}
                            >
                              C°
                            </button>
                            <button
                              className={`px-3 py-1 rounded-full ${
                                unit === "F" ? "bg-white/12" : "bg-white/6"
                              } transition`}
                              onClick={() => toggleUnit("F")}
                            >
                              F°
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardShell>
                  </div>
                )}

                {weather && (
                  <div className="mb-4">
                    <CardShell>
                      <div className="flex flex-col md:flex-row items-start">
                        <div className="flex-1">
                          <h3 className="text-2xl font-semibold mb-1">Today</h3>
                          <div className="text-4xl font-extrabold mb-1">
                            {convertTemperature(weather.main.temp, unit)}°{unit}
                          </div>
                          <div className="capitalize text-sm text-white/80 mb-4">
                            {weather.weather[0].description}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <div className="text-md text-white/80">
                                Humidity
                              </div>
                              <div className="font-medium">
                                {weather.main.humidity}%
                              </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                              <div className="text-md text-white/80">Wind</div>
                              <div className="font-medium">
                                {weather.wind.speed} m/s{" "}
                                {weather.wind.deg
                                  ? `(${getWindDirection(weather.wind.deg)})`
                                  : ""}
                              </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                              <div className="text-md text-white/80">
                                Visibility
                              </div>
                              <div className="font-medium">
                                {getVisibilityValue(weather.visibility)}
                              </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                              <div className="text-md text-white/80">
                                Sunrise
                              </div>
                              <div className="font-medium">
                                {formatTime(weather.sys.sunrise)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardShell>
                  </div>
                )}

                {weather && (
                  <div className="mb-4">
                    <CardShell>
                      <h4 className="font-semibold mb-4">Extras</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center justify-items-center">
                        <div className="w-36 sm:w-44">
                          <CircularGauge
                            value={weather.main.humidity}
                            size={120}
                            label="Humidity"
                            suffix="%"
                          />
                        </div>
                        <div className="w-36 sm:w-44">
                          <CircularGauge
                            value={Math.min(
                              100,
                              Math.round((weather.wind.speed / 30) * 100)
                            )}
                            size={120}
                            label="Wind"
                            suffix={`${weather.wind.speed} m/s`}
                          />
                        </div>
                        <div className="w-36 sm:w-44">
                          {(() => {
                            const p = weather.main.pressure ?? 1013;
                            const pct = Math.round(
                              ((p - 950) / (1050 - 950)) * 100
                            );
                            return (
                              <CircularGauge
                                value={Math.max(0, Math.min(100, pct))}
                                size={120}
                                label="Pressure"
                                suffix={`${p} hPa`}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    </CardShell>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="mb-4 lg:sticky lg:top-6">
                  <CardShell className="p-4">
                    <h4 className="font-semibold mb-3">Sun & Moon</h4>
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-3">
                        <SunriseIcon />
                        <div>
                          <div className="text-sm text-white/80">Sunrise</div>
                          <div className="font-medium">
                            {weather ? formatTime(weather.sys.sunrise) : "--"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <SunsetIcon />
                        <div>
                          <div className="text-sm text-white/80">Sunset</div>
                          <div className="font-medium">
                            {weather ? formatTime(weather.sys.sunset) : "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardShell>
                </div>

                <div className="mb-4">
                  <CardShell className="p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10">
                          <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="rgba(255,255,255,0.06)"
                              strokeWidth="2"
                            />
                            <path
                              d="M8 12h8"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-white/80">Humidity</div>
                          <div className="font-medium">
                            {weather?.main?.humidity ?? "--"}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10">
                          <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="rgba(255,255,255,0.06)"
                              strokeWidth="2"
                            />
                            <path
                              d="M7 12h10"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-white/80">Wind</div>
                          <div className="font-medium">
                            {weather?.wind?.speed ?? "--"} m/s
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10">
                          <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="rgba(255,255,255,0.06)"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 8v8"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-white/80">Pressure</div>
                          <div className="font-medium">
                            {weather?.main?.pressure ?? "--"} hPa
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardShell>
                </div>

                {forecast &&
                Array.isArray(forecast.daily) &&
                forecast.daily.length > 0 ? (
                  <div>
                    <CardShell className="p-4">
                      <h4 className="font-bold text-lg mb-3">7-Day Forecast</h4>
                      <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto">
                        {forecast.daily.slice(0, 7).map((d) => (
                          <ForecastDay key={d.dt} d={d} unit={unit} />
                        ))}
                      </div>
                    </CardShell>
                  </div>
                ) : (
                  weather && (
                    <div className="text-sm text-white/70 mt-3">
                      7-day forecast not available for this location.
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </CardShell>
      </div>
    </div>
  );
}
