// src/components/Icons.jsx
import sunriseImg from "../../public/sunrise.png";
import sunsetImg from "../../public/sunset.png";
import windImg from "../../public/wind.png";
import humidityImg from "../../public/humidity.png";
import visibilityImg from "../../public/visibility.png";

const Icon = ({ src, alt, className = "", title }) => (
  <img
    src={src}
    alt={alt}
    title={title || alt}
    className={`inline-block ${className}`}
    // loading="lazy" optional
  />
);

export const WindIcon = ({ className = "w-8 h-8 md:w-10 md:h-10" }) => (
  <Icon src={windImg} alt="Wind" title="Wind" className={className} />
);

export const HumidityIcon = ({ className = "w-8 h-8 md:w-10 md:h-10" }) => (
  <Icon
    src={humidityImg}
    alt="Humidity"
    title="Humidity"
    className={className}
  />
);

export const VisibilityIcon = ({ className = "w-8 h-8 md:w-10 md:h-10" }) => (
  <Icon
    src={visibilityImg}
    alt="Visibility"
    title="Visibility"
    className={className}
  />
);

export const SunriseIcon = ({ className = "w-8 h-8 md:w-10 md:h-10" }) => (
  <Icon src={sunriseImg} alt="Sunrise" title="Sunrise" className={className} />
);

export const SunsetIcon = ({ className = "w-8 h-8 md:w-10 md:h-10" }) => (
  <Icon src={sunsetImg} alt="Sunset" title="Sunset" className={className} />
);
