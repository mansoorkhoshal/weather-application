import windIcon from "../assets/wind.png";
import humidityIcon from "../assets/humidity.png";
import visibilityIcon from "../assets/visibility.png";
import sunriseIcon from "../assets/sunrise.png";
import sunsetIcon from "../assets/sunset.png";

const Icon = ({ src, alt, className, title }) => (
  <img
    src={src}
    alt={alt}
    title={title || alt}
    className={`w-8 h-8 inline-block ${className}`}
  />
);

export const WindIcon = () => (
  <Icon src={windIcon} alt="wind" title="Wind" className="animate-icon" />
);

export const HumidityIcon = () => (
  <Icon
    src={humidityIcon}
    alt="humidity"
    title="Humidity"
    className="powerful-pulse"
  />
);

export const VisibilityIcon = () => (
  <Icon
    src={visibilityIcon}
    alt="visibility"
    title="Visibility"
    className="powerful-pulse"
  />
);

export const SunriseIcon = () => (
  <Icon
    src={sunriseIcon}
    alt="Sunrise"
    title="Sunrise"
    className="powerful-pulse"
  />
);

export const SunsetIcon = () => (
  <Icon
    src={sunsetIcon}
    alt="Sunset"
    title="Sunset"
    className="powerful-pulse"
  />
);
