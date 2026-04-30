import { ICONS, normalizeSectionIcon } from "./homer.js";
import { t } from "./i18n.js";
import { getQuickLinkMeta, getQuickLinkTitle, getSearchEngineMeta } from "./metadata.js";
import { getVisibleQuickLinks, getVisibleSearchEngines } from "./state.js";
import { formatFrequentMeta, formatHistoryMeta, formatDateTime, makeInitial, toDomain } from "./utils.js";
import { getWeatherSummary } from "./weather.js";

export function renderAll(app) {
  renderSearchButtons(app);
  renderQuickLinks(app);
  renderServices(app, getVisibleServices(app), getEmptyServicesMessage(app));
  renderWeatherWidget(app);
  renderVisitPanels(app);
  setStatusFromCurrentData(app);
}

export function renderSearchButtons(app) {
  const { refs } = app;
  refs.searchButtons.replaceChildren();
  const engines = getVisibleSearchEngines(app);
  for (const engine of engines) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-button";
    button.title = engine.title;
    button.setAttribute("aria-label", button.title || t("searchAria"));
    button.classList.toggle("active", engine.id === app.state.search.defaultEngineId);
    button.append(createSearchEngineIcon(app, engine));
    button.addEventListener("click", () => {
      const query = refs.searchInput.value.trim();
      if (query) {
        app.runSearch(engine, query);
        return;
      }
      app.localPatch.search.defaultEngineId = engine.id;
      void app.persistLocalPatch();
      app.state.search.defaultEngineId = engine.id;
      renderSearchButtons(app);
      refs.searchInput.focus();
    });
    refs.searchButtons.append(button);
  }
}

function createSearchEngineIcon(app, engine) {
  const icon = document.createElement("span");
  icon.className = "search-icon";
  const meta = getSearchEngineMeta(app, engine);
  if (meta?.iconDataUrl) {
    const image = document.createElement("img");
    image.src = meta.iconDataUrl;
    image.alt = "";
    image.addEventListener("error", () => {
      image.remove();
      icon.textContent = makeInitial(engine.title || engine.id);
    });
    icon.append(image);
    return icon;
  }
  icon.textContent = makeInitial(engine.title || engine.id);
  return icon;
}

export function renderQuickLinks(app) {
  app.refs.quickLinks.replaceChildren();
  for (const link of getVisibleQuickLinks(app)) {
    app.refs.quickLinks.append(createQuickLink(app, link));
  }
}

function createQuickLink(app, link) {
  const meta = getQuickLinkMeta(app, link.url);
  const title = getQuickLinkTitle(link, meta);
  const iconDataUrl = meta?.iconDataUrl || "";

  const anchor = document.createElement("a");
  anchor.className = "quick-link";
  anchor.href = link.url;
  anchor.title = title;
  anchor.addEventListener("click", () => {
    void app.addVisitHistoryItem({
      title,
      url: link.url,
      source: "quick",
    });
  });

  const icon = document.createElement("span");
  icon.className = "quick-icon";
  if (iconDataUrl) {
    const image = document.createElement("img");
    image.src = iconDataUrl;
    image.alt = "";
    image.addEventListener("error", () => {
      image.remove();
      icon.textContent = makeInitial(title);
    });
    icon.append(image);
  } else {
    icon.textContent = makeInitial(title);
  }

  const label = document.createElement("span");
  label.className = "quick-label";
  label.textContent = title;

  anchor.append(icon, label);
  return anchor;
}

export function renderServices(app, services, emptyMessage = "") {
  app.refs.servicesGrid.replaceChildren();
  if (!services.length) {
    if (!emptyMessage) {
      return;
    }
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = emptyMessage;
    app.refs.servicesGrid.append(empty);
    return;
  }

  for (const group of services) {
    const article = document.createElement("article");
    article.className = "service-group";

    const heading = document.createElement("h2");
    heading.className = "service-heading";
    heading.append(createSectionIcon(group.icon, group.name), document.createTextNode(group.name || t("miscellaneous")));

    const card = document.createElement("div");
    card.className = "service-card";
    for (const item of group.items) {
      card.append(createServiceRow(app, item));
    }

    article.append(heading, card);
    app.refs.servicesGrid.append(article);
  }
}

function createSectionIcon(icon, name) {
  const span = document.createElement("span");
  span.className = "section-icon";
  const normalized = normalizeSectionIcon(icon, name);
  span.innerHTML = ICONS[normalized] || ICONS.network;
  return span;
}

function createServiceRow(app, item) {
  const anchor = document.createElement("a");
  anchor.className = "service-row";
  anchor.href = item.url;
  anchor.target = item.target || "_self";
  if (anchor.target !== "_self") {
    anchor.rel = "noreferrer";
  }
  anchor.title = item.name;
  anchor.addEventListener("click", () => {
    void app.addVisitHistoryItem({
      title: item.name || item.url,
      url: item.url,
      source: "homer",
    });
  });

  const logo = document.createElement("span");
  logo.className = "service-logo";
  if (item.logo) {
    const image = document.createElement("img");
    image.src = item.logo;
    image.alt = "";
    image.loading = "lazy";
    if (item.fallbackLogo && item.fallbackLogo !== item.logo) {
      image.dataset.fallbackLogo = item.fallbackLogo;
    }
    image.addEventListener("error", () => {
      if (image.dataset.fallbackLogo && image.src !== image.dataset.fallbackLogo) {
        image.src = image.dataset.fallbackLogo;
        delete image.dataset.fallbackLogo;
        return;
      }
      image.remove();
      logo.textContent = makeInitial(item.name);
    });
    logo.append(image);
  } else {
    logo.textContent = makeInitial(item.name);
  }

  const text = document.createElement("span");
  text.className = "service-title";
  text.textContent = item.name || item.url;

  anchor.append(logo, text);
  return anchor;
}

export function renderVisitPanels(app) {
  renderVisitList({
    panel: app.refs.frequentPanel,
    list: app.refs.frequentList,
    items: app.frequentVisits,
    isEnabled: app.localPatch?.visits?.showFrequent !== false,
    metaFormatter: formatFrequentMeta,
    showVisitCount: true,
    app,
  });
  renderVisitList({
    panel: app.refs.historyPanel,
    list: app.refs.historyList,
    items: app.visitHistory,
    isEnabled: app.localPatch?.visits?.showRecent !== false,
    metaFormatter: formatHistoryMeta,
    app,
  });
}

export function renderWeatherWidget(app) {
  const { refs } = app;
  if (!refs.weatherWidget) {
    return;
  }
  const disabled = app.localPatch?.weather?.disabled === true;
  refs.weatherWidget.classList.toggle("hidden", disabled);
  if (disabled) {
    return;
  }

  const status = app.weatherStatus;
  const cache = app.weatherCache;
  refs.weatherWidget.dataset.state = status?.kind || (cache ? "ready" : "empty");

  if (cache) {
    const summary = getWeatherSummary(cache);
    refs.weatherIcon.textContent = summary.icon;
    refs.weatherTemp.textContent = "";
    refs.weatherPlace.textContent = "";
    refs.weatherPlace.title = summary.placeTitle || summary.place;
    refs.weatherWidget.title = summary.placeTitle || "";
    refs.weatherCondition.replaceChildren(createWeatherTempLine(summary));
    refs.weatherFeels.textContent = summary.description;
    refs.weatherRange.textContent = "";
    refs.weatherHumidity.textContent = summary.humidity ? t("weatherHumidity", summary.humidity) : "";
    refs.weatherWind.textContent = summary.wind ? t("weatherWind", summary.wind) : "";
    refs.weatherRain.textContent = summary.precipitationProbability
      ? t("weatherRain", summary.precipitationProbability)
      : "";
    refs.weatherUpdated.textContent = summary.updatedAt;
    refs.weatherUpdated.title = status?.kind === "error" ? status.message : t("weatherUpdated", summary.updatedAtTitle);
    refs.weatherRefreshButton.disabled = status?.kind === "loading";
    return;
  }

  refs.weatherIcon.textContent = status?.kind === "loading" ? "…" : "☁";
  refs.weatherTemp.textContent = "";
  refs.weatherPlace.textContent = t("weatherTitle");
  refs.weatherPlace.title = "";
  refs.weatherWidget.title = "";
  refs.weatherCondition.textContent = status?.message || t("weatherNeedsLocation");
  refs.weatherFeels.textContent = "";
  refs.weatherRange.textContent = "";
  refs.weatherHumidity.textContent = "";
  refs.weatherWind.textContent = "";
  refs.weatherRain.textContent = "";
  refs.weatherUpdated.textContent = t("weatherOpenSettingsHint");
  refs.weatherUpdated.title = "";
  refs.weatherRefreshButton.disabled = status?.kind === "loading";
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

function renderVisitList({ panel, list, items, isEnabled = true, metaFormatter, showVisitCount = false, app }) {
  list.replaceChildren();
  const isEmpty = !isEnabled || !items.length;
  panel.classList.toggle("hidden", isEmpty);
  if (isEmpty) {
    return;
  }

  for (const item of items) {
    const anchor = document.createElement("a");
    anchor.className = "visit-row";
    anchor.href = item.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.title = item.url;
    anchor.addEventListener("click", () => {
      void app.addVisitHistoryItem(item);
    });

    const title = document.createElement("span");
    title.className = "visit-title";
    title.textContent = item.title || toDomain(item.url) || item.url;

    const meta = document.createElement("span");
    meta.className = "visit-meta";
    meta.textContent = metaFormatter(item);

    if (showVisitCount && Number.isFinite(item.visitCount) && item.visitCount > 0) {
      const count = document.createElement("span");
      count.className = "visit-count";
      count.textContent = String(item.visitCount);
      count.title = t("visitCount", item.visitCount);
      anchor.append(title, count, meta);
    } else {
      anchor.append(title, meta);
    }
    list.append(anchor);
  }
}

export function getVisibleServices(app) {
  if (app.localPatch?.homer?.disabled || !app.state.homer.url) {
    return [];
  }
  if (app.homerCache?.services?.length) {
    return app.homerCache.services;
  }
  return [];
}

export function getEmptyServicesMessage(app) {
  return "";
}

export function setStatusFromCurrentData(app) {
  if (app.localPatch?.homer?.disabled) {
    setStatus(app, "local", "off", t("homerDisabled"));
    return;
  }
  if (!app.state.homer.url) {
    setStatus(app, "local", "no url", t("homerUrlMissing"));
    return;
  }
  if (app.homerCache?.services?.length) {
    setStatus(app, "cache", "cache", t("homerCache", formatDateTime(app.homerCache.fetchedAt)));
    return;
  }
  setStatus(app, "local", app.homerCache?.services?.length ? "away" : "no homer", getEmptyServicesMessage(app));
}

export function setStatus(app, kind, text, title) {
  app.refs.statusButton.dataset.status = kind;
  app.refs.statusText.textContent = text;
  app.refs.statusButton.title = title;
}
