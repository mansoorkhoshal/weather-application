export const getWindDirection = (deg) => {
  if (deg > 337.5 || deg <= 22.5) return "N";
  if (deg <= 67.5) return "NE";
  if (deg <= 112.5) return "E";
  if (deg <= 157.5) return "SE";
  if (deg <= 202.5) return "S";
  if (deg <= 247.5) return "SW";
  if (deg <= 292.5) return "W";
  if (deg <= 337.5) return "NW";
};

export const getHumidityValue = (humidity) =>
  humidity < 30 ? "Low" : humidity < 60 ? "Moderate" : "High";

export const getVisibilityValue = (visibility) =>
  `${(visibility / 1000).toFixed(1)} km`;

export const convertTemperature = (temp, unit) =>
  unit === "F" ? ((temp * 9) / 5 + 32).toFixed(1) : temp.toFixed(1);
