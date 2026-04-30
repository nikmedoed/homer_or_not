import { formatRepositoryAge, formatStars, getGitHubTrendingSummary } from "./github-trending.js";
import { ICONS, normalizeSectionIcon } from "./homer.js";
import { filterFrequentVisits } from "./history.js";
import { t } from "./i18n.js";
import { getQuickLinkMeta, getQuickLinkTitle, getSearchEngineMeta } from "./metadata.js";
import { getVisibleQuickLinks, getVisibleSearchEngines } from "./state.js";
import {
  formatFrequentMeta,
  formatHistoryMeta,
  formatDateTime,
  makeInitial,
  normalizeUrlKey,
  toDomain,
} from "./utils.js";
import { getWeatherSummary } from "./weather.js";

export function renderAll(app) {
  renderSearchButtons(app);
  renderQuickLinks(app);
  renderServices(app, getVisibleServices(app), getEmptyServicesMessage(app));
  renderWeatherWidget(app);
  renderGitHubTrending(app);
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
    items: filterFrequentVisits(app, app.frequentVisits),
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
    showAddButton: true,
    hideAddedAction: true,
    app,
  });
}

export function renderWeatherWidget(app) {
  const { refs } = app;
  document.body.dataset.topWeatherPlacement = app.state.weather?.topWidgetPlacement || "actions";
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
    disabled: app.localPatch?.weather?.cardDisabled === true,
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

export function renderGitHubTrending(app) {
  const { refs } = app;
  if (!refs.githubTrending) {
    return;
  }
  if (app.localPatch?.githubTrending?.disabled) {
    refs.githubTrending.classList.add("hidden");
    return;
  }

  const status = app.githubTrendingStatus;
  const summary = getGitHubTrendingSummary(app.githubTrendingCache);
  const hasItems = summary.items.length > 0;
  refs.githubTrending.classList.toggle("hidden", !hasItems && !status);
  refs.githubTrending.dataset.state = status?.kind || (hasItems ? "ready" : "empty");
  refs.githubTrendingRefreshButton.disabled = status?.kind === "loading";
  refs.githubTrendingList.replaceChildren();

  if (!hasItems) {
    const empty = document.createElement("p");
    empty.className = "github-trending-message";
    empty.textContent = status?.message || t("githubTrendingUnavailable");
    refs.githubTrendingList.append(empty);
    refs.githubTrendingMeta.textContent = t("githubTrendingSource");
    return;
  }

  for (const item of summary.items) {
    refs.githubTrendingList.append(createGitHubTrendingRow(app, item));
  }

  if (status?.kind === "error") {
    refs.githubTrendingMeta.textContent = t("githubTrendingStale", summary.updatedAt);
    refs.githubTrendingMeta.title = [status.message, summary.updatedAtTitle].filter(Boolean).join(" · ");
    return;
  }

  refs.githubTrendingMeta.textContent = summary.updatedAt
    ? t("githubTrendingUpdated", summary.updatedAt)
    : t("githubTrendingSource");
  refs.githubTrendingMeta.title = summary.updatedAtTitle;
}

function createGitHubTrendingRow(app, item) {
  const anchor = document.createElement("a");
  anchor.className = "github-trending-row";
  anchor.href = item.url;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.title = item.description || item.fullName;
  anchor.addEventListener("click", () => {
    void app.addVisitHistoryItem({
      title: item.fullName,
      url: item.url,
      source: "github",
    });
  });

  const avatar = document.createElement("span");
  avatar.className = "github-trending-avatar";
  if (item.ownerAvatarUrl) {
    const image = document.createElement("img");
    image.src = item.ownerAvatarUrl;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.remove();
      avatar.textContent = makeInitial(item.name);
    });
    avatar.append(image);
  } else {
    avatar.textContent = makeInitial(item.name);
  }

  const body = document.createElement("span");
  body.className = "github-trending-body";

  const title = document.createElement("span");
  title.className = "github-trending-name";
  title.textContent = item.fullName;

  const description = document.createElement("span");
  description.className = "github-trending-description";
  description.textContent = item.description || t("githubTrendingNoDescription");

  const meta = document.createElement("span");
  meta.className = "github-trending-repo-meta";
  const stars = formatStars(item.stars);
  meta.textContent = [stars ? `★ ${stars}` : "", item.language, formatRepositoryAge(item)].filter(Boolean).join(" · ");

  body.append(title, description, meta);
  anchor.append(avatar, body);
  return anchor;
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

function renderVisitList({
  panel,
  list,
  items,
  isEnabled = true,
  metaFormatter,
  showVisitCount = false,
  showAddButton = false,
  hideAddedAction = false,
  app,
}) {
  list.replaceChildren();
  const isEmpty = !isEnabled || !items.length;
  panel.classList.toggle("hidden", isEmpty);
  if (isEmpty) {
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "visit-row";

    const anchor = document.createElement("a");
    anchor.className = "visit-link";
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

    anchor.append(title, meta);
    row.append(anchor);

    if (showVisitCount || showAddButton) {
      const action = createVisitAddButton(app, item, { showVisitCount, hideAddedAction });
      if (action) {
        row.append(action);
      }
    }
    list.append(row);
  }
}

function createVisitAddButton(app, item, { showVisitCount, hideAddedAction }) {
  const isAdded = hasVisibleQuickLink(app, item.url);
  if (hideAddedAction && isAdded) {
    return null;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = showVisitCount ? "visit-action visit-count" : "visit-action visit-add";
  if (showVisitCount && Number.isFinite(item.visitCount) && item.visitCount > 0) {
    button.textContent = String(item.visitCount);
  } else {
    button.append(createPlusIcon());
  }
  button.title = t("quickAddLinkTooltip");
  button.setAttribute("aria-label", t("quickAddLinkAria", item.title || toDomain(item.url) || item.url));

  if (isAdded) {
    button.disabled = true;
    button.title = t("quickLinkAlreadyAdded");
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof app.addQuickLinkFromVisit === "function") {
      void app.addQuickLinkFromVisit(item);
    }
  });
  return button;
}

function createPlusIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "visit-add-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");

  const horizontal = document.createElementNS("http://www.w3.org/2000/svg", "path");
  horizontal.setAttribute("d", "M5 12h14");

  const vertical = document.createElementNS("http://www.w3.org/2000/svg", "path");
  vertical.setAttribute("d", "M12 5v14");

  icon.append(horizontal, vertical);
  return icon;
}

function hasVisibleQuickLink(app, url) {
  const key = normalizeUrlKey(url);
  if (!key) {
    return false;
  }
  return getVisibleQuickLinks(app).some((link) => normalizeUrlKey(link.url) === key);
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
