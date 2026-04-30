import { LOCAL_AREA, WEATHER_CACHE_KEY, WEATHER_FETCH_TIMEOUT_MS, WEATHER_SYNC_INTERVAL_MINUTES } from "./constants.js";
import { LOCALE, t } from "./i18n.js";
import { renderWeatherWidget } from "./render.js";
import { fetchJsonWithTimeout, formatDateTime, isCacheFresh, storageSet } from "./utils.js";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

export function normalizeWeatherCache(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const current = raw.current && typeof raw.current === "object" ? raw.current : {};
  const daily = raw.daily && typeof raw.daily === "object" ? raw.daily : {};
  const fetchedAt = Number.isFinite(raw.fetchedAt) ? raw.fetchedAt : 0;
  const latitude = Number.isFinite(raw.latitude) ? raw.latitude : null;
  const longitude = Number.isFinite(raw.longitude) ? raw.longitude : null;
  if (!fetchedAt || latitude === null || longitude === null || !Number.isFinite(current.temperature)) {
    return null;
  }
  return {
    fetchedAt,
    source: raw.source === "manual" ? "manual" : "geolocation",
    locationQuery: typeof raw.locationQuery === "string" ? raw.locationQuery : "",
    place: typeof raw.place === "string" ? raw.place : "",
    country: typeof raw.country === "string" ? raw.country : "",
    timezone: typeof raw.timezone === "string" ? raw.timezone : "",
    latitude,
    longitude,
    accuracy: Number.isFinite(raw.accuracy) ? raw.accuracy : null,
    current: {
      temperature: current.temperature,
      apparentTemperature: Number.isFinite(current.apparentTemperature) ? current.apparentTemperature : null,
      humidity: Number.isFinite(current.humidity) ? current.humidity : null,
      weatherCode: Number.isFinite(current.weatherCode) ? current.weatherCode : 0,
      windSpeed: Number.isFinite(current.windSpeed) ? current.windSpeed : null,
      windDirection: Number.isFinite(current.windDirection) ? current.windDirection : null,
      precipitation: Number.isFinite(current.precipitation) ? current.precipitation : null,
      isDay: current.isDay === 1 || current.isDay === true ? 1 : 0,
      time: typeof current.time === "string" ? current.time : "",
    },
    daily: {
      temperatureMax: Number.isFinite(daily.temperatureMax) ? daily.temperatureMax : null,
      temperatureMin: Number.isFinite(daily.temperatureMin) ? daily.temperatureMin : null,
      precipitationProbability: Number.isFinite(daily.precipitationProbability) ? daily.precipitationProbability : null,
    },
  };
}

export async function syncWeather(app, { force = false } = {}) {
  if (app.localPatch?.weather?.disabled) {
    app.weatherStatus = null;
    renderWeatherWidget(app);
    return;
  }

  if (!force && isWeatherCacheUsable(app)) {
    app.weatherStatus = null;
    renderWeatherWidget(app);
    return;
  }
  if (!isWeatherCacheForCurrentSettings(app)) {
    app.weatherCache = null;
  }

  app.weatherStatus = {
    kind: "loading",
    message: hasManualLocation(app) ? t("weatherLoadingManual") : t("weatherLoadingGeo"),
  };
  renderWeatherWidget(app);

  try {
    const location = hasManualLocation(app)
      ? await resolveManualLocation(app.localPatch.weather.locationName)
      : await getBrowserLocation();
    const forecast = await fetchForecast(location);
    app.weatherCache = normalizeWeatherCache({
      fetchedAt: Date.now(),
      source: location.source,
      locationQuery: location.locationQuery || "",
      place: location.place,
      country: location.country,
      timezone: forecast.timezone || "",
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      current: {
        temperature: forecast.current.temperature_2m,
        apparentTemperature: forecast.current.apparent_temperature,
        humidity: forecast.current.relative_humidity_2m,
        weatherCode: forecast.current.weather_code,
        windSpeed: forecast.current.wind_speed_10m,
        windDirection: forecast.current.wind_direction_10m,
        precipitation: forecast.current.precipitation,
        isDay: forecast.current.is_day,
        time: forecast.current.time,
      },
      daily: {
        temperatureMax: forecast.daily.temperature_2m_max?.[0],
        temperatureMin: forecast.daily.temperature_2m_min?.[0],
        precipitationProbability: forecast.daily.precipitation_probability_max?.[0],
      },
    });
    await storageSet(WEATHER_CACHE_KEY, app.weatherCache, LOCAL_AREA);
    app.weatherStatus = null;
  } catch (error) {
    app.weatherStatus = {
      kind: "error",
      message: error?.message || t("weatherUnavailable"),
    };
  }
  renderWeatherWidget(app);
}

export function getWeatherSummary(cache) {
  const code = cache?.current?.weatherCode ?? 0;
  const condition = getWeatherCondition(code, cache?.current?.isDay !== 0);
  const place = cache?.source === "geolocation" ? formatGeoPlace(cache) : [cache?.place, cache?.country].filter(Boolean).join(", ");
  return {
    place: place || t("currentLocation"),
    placeTitle: formatGeoTitle(cache),
    icon: condition.icon,
    description: condition.description,
    temperature: formatTemperature(cache?.current?.temperature),
    apparentTemperature: formatTemperature(cache?.current?.apparentTemperature),
    minTemperature: formatTemperature(cache?.daily?.temperatureMin),
    maxTemperature: formatTemperature(cache?.daily?.temperatureMax),
    humidity: formatPercent(cache?.current?.humidity),
    precipitationProbability: formatPercent(cache?.daily?.precipitationProbability),
    wind: formatWind(cache?.current?.windSpeed, cache?.current?.windDirection),
    updatedAt: cache?.fetchedAt ? formatUpdatedLabel(cache, formatElapsed(cache.fetchedAt)) : "",
    updatedAtTitle: cache?.fetchedAt ? formatDateTime(cache.fetchedAt) : "",
  };
}

function isWeatherCacheUsable(app) {
  if (!isCacheFresh(app.weatherCache, WEATHER_SYNC_INTERVAL_MINUTES)) {
    return false;
  }
  return isWeatherCacheForCurrentSettings(app);
}

function isWeatherCacheForCurrentSettings(app) {
  if (!app.weatherCache) {
    return false;
  }
  const locationName = normalizeLocationName(app.localPatch?.weather?.locationName);
  if (locationName) {
    return app.weatherCache.source === "manual" && app.weatherCache.locationQuery === locationName;
  }
  return app.weatherCache.source === "geolocation";
}

function hasManualLocation(app) {
  return Boolean(normalizeLocationName(app.localPatch?.weather?.locationName));
}

async function resolveManualLocation(rawLocationName) {
  const locationQuery = normalizeLocationName(rawLocationName);
  const coordinates = parseCoordinates(locationQuery);
  if (coordinates) {
    return {
      ...coordinates,
      source: "manual",
      locationQuery,
      place: locationQuery,
      country: "",
    };
  }

  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", locationQuery);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", LOCALE === "ru" ? "ru" : "en");
  url.searchParams.set("format", "json");
  const data = await fetchJsonWithTimeout(url.href, WEATHER_FETCH_TIMEOUT_MS);
  const match = Array.isArray(data?.results) ? data.results[0] : null;
  if (!match || !Number.isFinite(match.latitude) || !Number.isFinite(match.longitude)) {
    throw new Error(t("weatherLocationNotFound"));
  }
  return {
    source: "manual",
    locationQuery,
    latitude: match.latitude,
    longitude: match.longitude,
    place: makePlaceName(match),
    country: match.country || "",
  };
}

function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(t("weatherGeolocationUnsupported")));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          source: "geolocation",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          place: t("currentLocation"),
          country: "",
        });
      },
      () => reject(new Error(t("weatherGeolocationFailed"))),
      {
        enableHighAccuracy: false,
        maximumAge: WEATHER_SYNC_INTERVAL_MINUTES * 60 * 1000,
        timeout: WEATHER_FETCH_TIMEOUT_MS,
      },
    );
  });
}

async function fetchForecast(location) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
  );
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");
  const data = await fetchJsonWithTimeout(url.href, WEATHER_FETCH_TIMEOUT_MS);
  if (!data?.current || !Number.isFinite(data.current.temperature_2m)) {
    throw new Error(t("weatherUnavailable"));
  }
  return data;
}

function parseCoordinates(value) {
  const match = value.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)\s*$/);
  if (!match) {
    return null;
  }
  const latitude = Number(match[1].replace(",", "."));
  const longitude = Number(match[2].replace(",", "."));
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

function normalizeLocationName(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 120) : "";
}

function makePlaceName(location) {
  const parts = [];
  for (const value of [location.name, location.admin1]) {
    if (value && !parts.includes(value)) {
      parts.push(value);
    }
  }
  return parts.join(", ");
}

function formatGeoPlace(cache) {
  const coords = formatCoordinates(cache?.latitude, cache?.longitude, 2);
  const accuracy = formatAccuracy(cache?.accuracy);
  if (coords && accuracy) {
    return `${coords} ±${accuracy}`;
  }
  return coords;
}

function formatGeoTitle(cache) {
  const coords = formatCoordinates(cache?.latitude, cache?.longitude, 5);
  const accuracy = formatAccuracy(cache?.accuracy);
  if (coords && accuracy) {
    return `${t("currentLocation")}: ${coords}, ${accuracy}`;
  }
  return coords || "";
}

function formatCoordinates(latitude, longitude, digits) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "";
  }
  return `${latitude.toFixed(digits)}, ${longitude.toFixed(digits)}`;
}

function formatAccuracy(value) {
  if (!Number.isFinite(value)) {
    return "";
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)} km`;
  }
  return `${Math.round(value)} m`;
}

function formatElapsed(timestamp) {
  const elapsedMs = Math.max(0, Date.now() - timestamp);
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  if (elapsedMinutes < 1) {
    return LOCALE === "ru" ? "сейчас" : "now";
  }
  if (elapsedMinutes < 60) {
    return LOCALE === "ru" ? `${elapsedMinutes} мин` : `${elapsedMinutes}m`;
  }
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return LOCALE === "ru" ? `${elapsedHours} ч` : `${elapsedHours}h`;
  }
  const elapsedDays = Math.floor(elapsedHours / 24);
  return LOCALE === "ru" ? `${elapsedDays} д` : `${elapsedDays}d`;
}

function formatUpdatedLabel(cache, elapsed) {
  const label = cache?.source === "geolocation" ? (LOCALE === "ru" ? "тут" : "here") : compactPlaceName(cache?.place);
  return [label, elapsed].filter(Boolean).join(" · ");
}

function compactPlaceName(value) {
  return String(value || "")
    .split(",")[0]
    .trim();
}

function formatTemperature(value) {
  return Number.isFinite(value) ? `${Math.round(value)}°` : "";
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : "";
}

function formatWind(speed, direction) {
  if (!Number.isFinite(speed)) {
    return "";
  }
  const rounded = Math.round(speed);
  const unit = LOCALE === "ru" ? "км/ч" : "km/h";
  const point = getWindPoint(direction);
  return point ? `${rounded} ${unit} ${point}` : `${rounded} ${unit}`;
}

function getWindPoint(degrees) {
  if (!Number.isFinite(degrees)) {
    return "";
  }
  const points =
    LOCALE === "ru"
      ? ["север", "с-в", "восток", "ю-в", "юг", "ю-з", "запад", "с-з"]
      : ["north", "NE", "east", "SE", "south", "SW", "west", "NW"];
  return points[Math.round(degrees / 45) % 8];
}

function getWeatherCondition(code, isDay) {
  const descriptions = {
    ru: {
      clear: "Ясно",
      mainlyClear: "Преимущественно ясно",
      partlyCloudy: "Переменная облачность",
      overcast: "Пасмурно",
      fog: "Туман",
      drizzle: "Морось",
      rain: "Дождь",
      freezingRain: "Ледяной дождь",
      snow: "Снег",
      shower: "Ливень",
      thunderstorm: "Гроза",
      unknown: "Погода",
    },
    en: {
      clear: "Clear",
      mainlyClear: "Mainly clear",
      partlyCloudy: "Partly cloudy",
      overcast: "Overcast",
      fog: "Fog",
      drizzle: "Drizzle",
      rain: "Rain",
      freezingRain: "Freezing rain",
      snow: "Snow",
      shower: "Showers",
      thunderstorm: "Thunderstorm",
      unknown: "Weather",
    },
  };
  const text = descriptions[LOCALE === "ru" ? "ru" : "en"];
  const byCode = {
    0: ["☀", text.clear],
    1: [isDay ? "☀" : "☾", text.mainlyClear],
    2: ["◐", text.partlyCloudy],
    3: ["☁", text.overcast],
    45: ["≋", text.fog],
    48: ["≋", text.fog],
    51: ["☂", text.drizzle],
    53: ["☂", text.drizzle],
    55: ["☂", text.drizzle],
    56: ["☂", text.freezingRain],
    57: ["☂", text.freezingRain],
    61: ["☂", text.rain],
    63: ["☂", text.rain],
    65: ["☂", text.rain],
    66: ["☂", text.freezingRain],
    67: ["☂", text.freezingRain],
    71: ["❄", text.snow],
    73: ["❄", text.snow],
    75: ["❄", text.snow],
    77: ["❄", text.snow],
    80: ["☂", text.shower],
    81: ["☂", text.shower],
    82: ["☂", text.shower],
    85: ["❄", text.snow],
    86: ["❄", text.snow],
    95: ["⚡", text.thunderstorm],
    96: ["⚡", text.thunderstorm],
    99: ["⚡", text.thunderstorm],
  };
  const [icon, description] = byCode[code] || ["☁", text.unknown];
  return { icon, description };
}
