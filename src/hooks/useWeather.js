import { useState } from "react";
import {
  getCurrentWeather,
  getCurrentWeatherByCoords,
  getWeatherForeCast,
} from "../services/WeatherApi";

export const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnits] = useState("C");

  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, foreCast] = await Promise.all([
        getCurrentWeather(city),
        getWeatherForeCast(city),
      ]);
      setCurrentWeather(weatherData);
      setForecast(foreCast);
    } catch (error) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocaion is not supported by this browser");
    }
    serLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const {latitude, longitude } = position.coords;
        const weatherData = await getCurrentWeatherByCoords(latitude, longitude)

      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather data"
        );
      }
    });
  };
};
