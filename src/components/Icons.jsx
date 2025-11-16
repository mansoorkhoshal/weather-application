const Icon = ({ src, alt, className, title }) => (
  <img
    src={src}
    alt={alt}
    title={title || alt}
    className={`w-8 h-8 inline-block ${className}`}
  />
);

export const WindIcon = () => (
  <Icon src="/icons/wind.png" alt="Wind" title="Wind" />
);

export const HumidityIcon = () => (
  <Icon src="/icons/humidity.png" alt="Humidity" title="Humidity" />
);

export const VisibilityIcon = () => (
  <Icon src="/icons/visibility.png" alt="Visibility" title="Visibility" />
);

export const SunriseIcon = () => (
  <Icon src="/icons/sunrise.png" alt="Sunrise" title="Sunrise" />
);

export const SunsetIcon = () => (
  <Icon src="/icons/sunset.png" alt="Sunset" title="Sunset" />
);
