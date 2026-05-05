import { t } from "../i18n.js";
import { updateWidgetLayoutState } from "../layout.js";
import { getWeatherSummary } from "../weather.js";

export function renderWeatherWidget(app) {
  const { refs } = app;
  document.body.dataset.topWeatherPlacement = app.state.weather?.topWidgetPlacement || "actions";
  document.body.dataset.topWeatherZen = app.localPatch?.weather?.showInZen === true ? "true" : "false";
  renderWeatherBlock(app, {
    widget: refs.weatherWidget,
    icon: refs.weatherIcon,
    temp: refs.weatherTemp,
    place: refs.weatherPlace,
    condition: refs.weatherCondition,
    feels: refs.weatherFeels,
    range: refs.weatherRange,
    humidity: refs.weatherHumidity,
    wind: refs.weatherWind,
    rain: refs.weatherRain,
    updated: refs.weatherUpdated,
    refreshButton: refs.weatherRefreshButton,
    disabled: true,
  });
  renderWeatherBlock(app, {
    widget: refs.topWeatherWidget,
    icon: refs.topWeatherIcon,
    temp: refs.topWeatherTemp,
    place: refs.topWeatherPlace,
    condition: refs.topWeatherCondition,
    feels: refs.topWeatherFeels,
    range: refs.topWeatherRange,
    humidity: refs.topWeatherHumidity,
    wind: refs.topWeatherWind,
    rain: refs.topWeatherRain,
    updated: refs.topWeatherUpdated,
    refreshButton: refs.topWeatherRefreshButton,
    disabled: app.localPatch?.weather?.topDisabled === true,
    splitUpdated: true,
  });
  updateWidgetLayoutState(app);
}

function renderWeatherBlock(app, refs) {
  if (!refs.widget) {
    return;
  }
  const disabled = refs.disabled === true;
  refs.widget.classList.toggle("hidden", disabled);
  if (disabled) {
    return;
  }

  const status = app.weatherStatus;
  const cache = app.weatherCache;
  refs.widget.dataset.state = status?.kind || (cache ? "ready" : "empty");

  if (cache) {
    const summary = getWeatherSummary(cache);
    refs.icon.textContent = summary.icon;
    refs.temp.textContent = "";
    refs.place.textContent = "";
    refs.place.title = summary.placeTitle || summary.place;
    refs.widget.title = summary.placeTitle || "";
    refs.condition.replaceChildren(createWeatherTempLine(summary));
    refs.feels.textContent = summary.description;
    refs.range.textContent = "";
    refs.humidity.textContent = summary.humidity ? t("weatherHumidity", summary.humidity) : "";
    refs.wind.textContent = summary.wind ? t("weatherWind", summary.wind) : "";
    refs.rain.textContent = summary.precipitationProbability ? t("weatherRain", summary.precipitationProbability) : "";
    setWeatherUpdated(refs, summary.updatedAt);
    refs.updated.title = status?.kind === "error" ? status.message : t("weatherUpdated", summary.updatedAtTitle);
    refs.refreshButton.disabled = status?.kind === "loading";
    return;
  }

  refs.icon.textContent = status?.kind === "loading" ? "…" : "☁";
  refs.temp.textContent = "";
  refs.place.textContent = t("weatherTitle");
  refs.place.title = "";
  refs.widget.title = "";
  refs.condition.textContent = status?.message || t("weatherNeedsLocation");
  refs.feels.textContent = "";
  refs.range.textContent = "";
  refs.humidity.textContent = "";
  refs.wind.textContent = "";
  refs.rain.textContent = "";
  setWeatherUpdated(refs, t("weatherOpenSettingsHint"));
  refs.updated.title = "";
  refs.refreshButton.disabled = status?.kind === "loading";
}

function setWeatherUpdated(refs, value) {
  if (!refs.splitUpdated) {
    refs.updated.textContent = value;
    return;
  }
  const parts = String(value || "")
    .split(" · ")
    .filter(Boolean);
  if (parts.length < 2) {
    refs.updated.textContent = value;
    return;
  }
  refs.updated.replaceChildren(...parts.map(createWeatherUpdatedLine));
}

function createWeatherUpdatedLine(text) {
  const line = document.createElement("span");
  line.textContent = text;
  return line;
}

function createWeatherTempLine(summary) {
  const fragment = document.createDocumentFragment();
  const current = document.createElement("span");
  current.className = "weather-current-temp";
  current.textContent = summary.temperature;
  fragment.append(current);
  if (summary.minTemperature && summary.maxTemperature) {
    const range = document.createElement("span");
    range.className = "weather-temp-range";
    range.textContent = t("weatherRange", summary.minTemperature, summary.maxTemperature);
    fragment.append(range);
  }
  return fragment;
}
