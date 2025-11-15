import { useEffect, useState, useRef } from "react";
import WeatherBackground from "./components/WeatherBackground";
import {
  convertTemperature,
  getHumidityValue,
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

const Gauge = ({ label, value, unit, emoji = "" }) => (
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-xl bg-white/6 flex items-center justify-center shadow-sm">
      <div className="text-lg">{emoji}</div>
    </div>
    <div>
      <div className="text-xs text-white/80">{label}</div>
      <div className="font-semibold text-sm">
        {value} {unit ?? ""}
      </div>
    </div>
  </div>
);

const LineChart = ({ days = [], unit = "C" }) => {
  if (!days || days.length === 0) return null;

  const temps = days.map((d) =>
    unit === "C" ? d.temp.day : (d.temp.day * 9) / 5 + 32
  );
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const padding = 16;
  const width = 320;
  const height = 120;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = temps.map((t, i) => {
    const x = padding + (innerW / (temps.length - 1)) * i;
    const y = padding + innerH - ((t - min) / (max - min || 1)) * innerH;
    return [x, y];
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");

  const areaD = `${pathD} L ${padding + innerW} ${
    padding + innerH
  } L ${padding} ${padding + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>

      <path d={areaD} fill="url(#chartGradient)" opacity="0.9" />

      <path
        d={pathD}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#fff" />
        </g>
      ))}

      {days.map((d, i) => {
        const date = new Date(d.dt * 1000);
        const label = date.toLocaleDateString(undefined, { weekday: "short" });
        const x = points[i][0];
        return (
          <text
            key={i}
            x={x}
            y={height - 4}
            fontSize="10"
            textAnchor="middle"
            fill="rgba(255,255,255,0.85)"
          >
            {label}
          </text>
        );
      })}

      <text x={6} y={12} fontSize="10" fill="rgba(255,255,255,0.7)">
        {Math.round(max)}°
      </text>
      <text x={6} y={height - 6} fontSize="10" fill="rgba(255,255,255,0.7)">
        {Math.round(min)}°
      </text>
    </svg>
  );
};

const Loader = () => (
  <div className="flex items-center justify-center">
    <div className="w-9 h-9 border-4 border-white/30 border-t-white rounded-full animate-spin" />
  </div>
);

const CardShell = ({ children, className = "" }) => (
  <div
    className={`bg-white/6 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-md ${className}`}
  >
    {children}
  </div>
);

const Summary = ({ weather, unit, setUnit }) => {
  if (!weather) return null;
  const desc = weather.weather?.[0]?.description ?? "";
  const icon = weather.weather?.[0]?.icon ?? "";
  const country = weather.sys?.country ?? "";
  const tz = weather.timezone ?? 0;

  const [nowMs, setNowMs] = useState(Date.now() + tz * 1000);
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now() + tz * 1000), 1000);
    return () => clearInterval(id);
  }, [tz]);

  const localDate = new Date(nowMs);
  const dayNight = (() => {
    const hour = localDate.getUTCHours();
    return hour >= 6 && hour < 18 ? "Day" : "Night";
  })();

  return (
    <CardShell className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-white/7 flex items-center justify-center">
          {icon ? (
            <img
              src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
              alt={desc}
              className="w-16 h-16"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/8" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{weather.name}</h2>
            {country && (
              <img
                src={`https://flagsapi.com/${country}/flat/24.png`}
                alt={country}
                className="w-6 h-4 rounded-sm shadow-sm"
              />
            )}
          </div>
          <div className="text-sm text-white/80 capitalize">{desc}</div>
          <div className="text-xs text-white/70 mt-1">
            {localDate.toLocaleDateString()} •{" "}
            {localDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-4xl font-extrabold">
          {convertTemperature(weather.main.temp, unit)}°{unit}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-full ${
                unit === "C" ? "bg-white/12" : "bg-white/6"
              } transition`}
              onClick={() => setUnit("C")}
            >
              C°
            </button>
            <button
              className={`px-3 py-1 rounded-full ${
                unit === "F" ? "bg-white/12" : "bg-white/6"
              } transition`}
              onClick={() => setUnit("F")}
            >
              F°
            </button>
          </div>
          <div className="text-sm text-white/80">{dayNight}</div>
        </div>
      </div>
    </CardShell>
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
          <div className="text-xs text-white/60">
            {date.toLocaleDateString()}
          </div>
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
        <div className="text-xs text-white/80">
          {Math.round(convertTemperature(d.temp.min, unit))}°
        </div>
      </div>
    </div>
  );
};

const ForecastColumn = ({ forecast, unit }) => {
  if (!forecast || !forecast.daily) return null;
  return (
    <div className="w-full md:w-80">
      <div className="sticky top-6">
        <CardShell>
          <h4 className="font-bold text-lg mb-3">7-Day Forecast</h4>

          {/* Chart */}
          <div className="mb-4">
            <LineChart days={forecast.daily.slice(0, 7)} unit={unit} />
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 max-h-[52vh] overflow-y-auto pr-2">
            {forecast.daily.slice(0, 7).map((d) => (
              <ForecastDay key={d.dt} d={d} unit={unit} />
            ))}
          </div>
        </CardShell>
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
        console.warn(err);
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
    } catch {
      setSuggestion([]);
    }
  };

  const fetchByCoords = async (lat, lon) => {
    setError("");
    setLoading(true);
    setWeather(null);
    try {
      const units = unit === "C" ? "metric" : "imperial";
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("Failed to fetch current weather");
      const cur = await res.json();
      setWeather(cur);

      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${API_KEY}`
      );
      if (res2.ok) {
        const f = await res2.json();
        setForecast(f);
      } else setForecast(null);
    } catch (err) {
      setError(err.message || "Unable to fetch");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (url, name = "") => {
    setError("");
    setLoading(true);
    setWeather(null);
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
        const units = unit === "C" ? "metric" : "imperial";
        const res2 = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${API_KEY}`
        );
        if (res2.ok) {
          const f = await res2.json();
          setForecast(f);
        } else setForecast(null);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch");
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

  // toggle unit and refresh current weather/forecast in new units if present
  const toggleUnit = (newUnit) => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    // if weather exists, refetch using new units
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

      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="md:col-span-8">
            <CardShell>
              <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                <div className="flex-1">
                  {/* Summary or placeholder */}
                  {weather ? (
                    <div className="mb-4">
                      <Summary
                        weather={weather}
                        unit={unit}
                        setUnit={toggleUnit}
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <CardShell className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold">Weather App</h2>
                            <p className="text-sm text-white/80 mt-1">
                              Allow location or search a city
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => requestLocation()}
                              className="px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              Detect Location
                            </button>
                          </div>
                        </div>
                      </CardShell>
                    </div>
                  )}

                  {/* search area */}
                  <div>
                    <form onSubmit={handleSearch} className="relative">
                      <div className="flex gap-3">
                        <input
                          className="flex-1 px-4 py-3 rounded-lg bg-white/6 placeholder-white/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Search city or country"
                        />
                        <button
                          type="submit"
                          className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition font-semibold"
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

                      {error && (
                        <p className="mt-2 text-sm text-red-400">{error}</p>
                      )}
                    </form>
                  </div>
                </div>

                {/* small quick stats */}
                <div className="mt-6 md:mt-0 md:w-48">
                  <div className="bg-white/4 p-3 rounded-lg">
                    <div className="flex flex-col gap-4 text-center">
                      <Gauge
                        label="Humidity"
                        value={`${weather?.main?.humidity ?? "--"}%`}
                        emoji="💧"
                      />
                      <Gauge
                        label="Wind"
                        value={`${weather?.wind?.speed ?? "--"} m/s`}
                        emoji="💨"
                      />
                      <Gauge
                        label="Pressure"
                        value={`${weather?.main?.pressure ?? "--"} hPa`}
                        emoji="🔽"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* details */}
              {weather && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white/4 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Today</h3>

                      <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                            alt="icon"
                            className="w-28 h-28"
                          />
                          <div>
                            <div className="text-3xl font-bold">
                              {convertTemperature(weather.main.temp, unit)}°
                              {unit}
                            </div>
                            <div className="capitalize text-sm text-white/80 mt-1">
                              {weather.weather[0].description}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/5 rounded hover:bg-white/6 transition">
                              <div className="flex items-center gap-3">
                                <HumidityIcon />
                                <div>
                                  <div className="text-sm text-white/80">
                                    Humidity
                                  </div>
                                  <div className="font-medium">
                                    {weather.main.humidity}%
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded hover:bg-white/6 transition">
                              <div className="flex items-center gap-3">
                                <WindIcon />
                                <div>
                                  <div className="text-sm text-white/80">
                                    Wind
                                  </div>
                                  <div className="font-medium">
                                    {weather.wind.speed} m/s{" "}
                                    {weather.wind.deg
                                      ? `(${getWindDirection(
                                          weather.wind.deg
                                        )})`
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded hover:bg-white/6 transition">
                              <div className="flex items-center gap-3">
                                <VisibilityIcon />
                                <div>
                                  <div className="text-sm text-white/80">
                                    Visibility
                                  </div>
                                  <div className="font-medium">
                                    {getVisibilityValue(weather.visibility)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded hover:bg-white/6 transition">
                              <div className="flex items-center gap-3">
                                <SunriseIcon />
                                <div>
                                  <div className="text-sm text-white/80">
                                    Sunrise
                                  </div>
                                  <div className="font-medium">
                                    {formatTime(weather.sys.sunrise)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-white/80 space-y-1">
                        <div>
                          <strong>Feels like:</strong>{" "}
                          {convertTemperature(weather.main.feels_like, unit)}°
                          {unit}
                        </div>
                        <div>
                          <strong>Pressure:</strong> {weather.main.pressure} hPa
                        </div>
                        <div>
                          <strong>Coordinates:</strong>{" "}
                          {weather.coord.lat.toFixed(2)},{" "}
                          {weather.coord.lon.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/4 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Sun & Moon</h4>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <SunriseIcon />
                          <div>
                            <div className="text-sm text-white/80">Sunrise</div>
                            <div className="font-medium">
                              {formatTime(weather.sys.sunrise)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <SunsetIcon />
                          <div>
                            <div className="text-sm text-white/80">Sunset</div>
                            <div className="font-medium">
                              {formatTime(weather.sys.sunset)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardShell>
          </div>

          {/* RIGHT FORECAST */}
          <div className="md:col-span-4">
            <ForecastColumn forecast={forecast} unit={unit} />
          </div>
        </div>
      </div>
    </div>
  );
}
