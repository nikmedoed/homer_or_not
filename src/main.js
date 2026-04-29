import {
  CACHE_KEY,
  HISTORY_KEY,
  HOMER_FETCH_TIMEOUT_MS,
  HOMER_SYNC_INTERVAL_MINUTES,
  LOCAL_AREA,
  META_KEY,
  QUICK_LINK_META_KEY,
  QUICK_LINK_META_TTL_MS,
  SEARCH_ENGINE_META_KEY,
  STATE_KEY,
  SYNC_AREA,
  VISIT_HISTORY_LIMIT,
} from "./constants.js";
import { FALLBACK_CONFIG } from "./default-config.js";
import {
  ICONS,
  deriveHomerEndpoints,
  normalizeHomerCache,
  normalizeSectionIcon,
  normalizeServiceGroups,
  normalizeSyncMeta,
  parseHomerConfig,
  resolveAssetUrl,
  shouldSkipHomerSyncByNetwork,
} from "./homer.js";
import { LOCALE, applyLocalization, t } from "./i18n.js";
import {
  blobToDataUrl,
  byId,
  clampInt,
  clone,
  fetchTextWithTimeout,
  fetchWithTimeout,
  formatDateTime,
  formatFrequentMeta,
  formatHistoryMeta,
  isCacheFresh,
  isFailureFresh,
  isHttpUrl,
  makeId,
  makeInitial,
  normalizeUrlKey,
  storageGet,
  storageRemove,
  storageSet,
  toDomain,
  truncateHistoryTitle,
  truncateTitle,
  withCacheBuster,
} from "./utils.js";

const refs = {};
const baseConfig = normalizeBootConfig(globalThis.HOMER_OR_NOT_CONFIG || FALLBACK_CONFIG);

let state = createDefaultState();
let homerCache = null;
let syncMeta = null;
let quickLinkMeta = {};
let searchEngineMeta = {};
let visitHistory = [];
let frequentVisits = [];
let settingsDraft = null;

document.addEventListener("DOMContentLoaded", () => {
  void init();
});

async function init() {
  bindRefs();
  applyLocalization();
  bindEvents();
  state = await loadState();
  homerCache = normalizeHomerCache(await storageGet(CACHE_KEY));
  syncMeta = normalizeSyncMeta(await storageGet(META_KEY));
  quickLinkMeta = normalizeQuickLinkMeta(await storageGet(QUICK_LINK_META_KEY));
  searchEngineMeta = normalizeSearchEngineMeta(await storageGet(SEARCH_ENGINE_META_KEY));
  visitHistory = await loadVisitHistory();
  frequentVisits = await loadFrequentVisits();
  applyTheme();
  renderAll();
  void refreshSearchEngineMetadata({ force: false });
  void refreshQuickLinkMetadata({ force: false });
  await syncHomer({ force: false });
  refs.searchInput.focus();
}

function bindRefs() {
  refs.statusButton = byId("statusButton");
  refs.statusDot = byId("statusDot");
  refs.statusText = byId("statusText");
  refs.syncButton = byId("syncButton");
  refs.settingsButton = byId("settingsButton");
  refs.searchForm = byId("searchForm");
  refs.searchInput = byId("searchInput");
  refs.searchButtons = byId("searchButtons");
  refs.quickLinks = byId("quickLinks");
  refs.servicesLayout = byId("servicesLayout");
  refs.servicesGrid = byId("servicesGrid");
  refs.frequentPanel = byId("frequentPanel");
  refs.frequentList = byId("frequentList");
  refs.historyPanel = byId("historyPanel");
  refs.historyList = byId("historyList");
  refs.settingsOverlay = byId("settingsOverlay");
  refs.closeSettingsButton = byId("closeSettingsButton");
  refs.engineRows = byId("engineRows");
  refs.quickLinkRows = byId("quickLinkRows");
  refs.addEngineButton = byId("addEngineButton");
  refs.addQuickLinkButton = byId("addQuickLinkButton");
  refs.homerUrlInput = byId("homerUrlInput");
  refs.frequentHistoryPoolInput = byId("frequentHistoryPoolInput");
  refs.frequentMinVisitsInput = byId("frequentMinVisitsInput");
  refs.resetButton = byId("resetButton");
  refs.saveButton = byId("saveButton");
}

function bindEvents() {
  refs.searchForm.addEventListener("submit", handleSearchSubmit);
  refs.syncButton.addEventListener("click", () => {
    void syncHomer({ force: true });
  });
  refs.statusButton.addEventListener("click", openSettings);
  refs.settingsButton.addEventListener("click", openSettings);
  refs.closeSettingsButton.addEventListener("click", closeSettings);
  refs.settingsOverlay.addEventListener("click", (event) => {
    if (event.target === refs.settingsOverlay) {
      closeSettings();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !refs.settingsOverlay.classList.contains("hidden")) {
      closeSettings();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void refreshVisitHistory();
    }
  });
  window.addEventListener("focus", () => {
    void refreshVisitHistory();
  });
  refs.addEngineButton.addEventListener("click", () => {
    if (!settingsDraft) {
      return;
    }
    settingsDraft.search.engines.push({
      id: makeId("engine"),
      title: "",
      template: "https://example.com/search?q={q}",
    });
    renderSettings();
  });
  refs.addQuickLinkButton.addEventListener("click", () => {
    if (!settingsDraft) {
      return;
    }
    settingsDraft.quickLinks.push({
      id: makeId("quick"),
      title: "",
      url: "",
    });
    renderSettings();
  });
  refs.saveButton.addEventListener("click", async () => {
    const result = validateSettingsDraft();
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    state = result.state;
    await persistState();
    closeSettings();
    renderAll();
    void refreshSearchEngineMetadata({ force: true });
    void refreshQuickLinkMetadata({ force: true });
    await syncHomer({ force: true });
  });
  refs.resetButton.addEventListener("click", async () => {
    const confirmed = window.confirm(t("resetConfirm"));
    if (!confirmed) {
      return;
    }
    state = createDefaultState();
    homerCache = null;
    quickLinkMeta = {};
    searchEngineMeta = {};
    visitHistory = [];
    frequentVisits = [];
    settingsDraft = clone(state);
    syncMeta = null;
    await Promise.all([
      storageRemove(STATE_KEY, SYNC_AREA),
      storageRemove([CACHE_KEY, META_KEY, QUICK_LINK_META_KEY, SEARCH_ENGINE_META_KEY, HISTORY_KEY], LOCAL_AREA),
    ]);
    renderAll();
    renderSettings();
    void refreshSearchEngineMetadata({ force: true });
    await syncHomer({ force: true });
  });
}

function applyTheme() {
  const setWallpaper = () => {
    const image = getHomerWallpaperUrl();
    if (image) {
      document.documentElement.style.setProperty("--wallpaper-image", `url("${image}")`);
      return;
    }
    document.documentElement.style.removeProperty("--wallpaper-image");
  };
  setWallpaper();
  globalThis.matchMedia?.("(prefers-color-scheme: light)")?.addEventListener?.("change", setWallpaper);
}

async function loadState() {
  const syncState = await storageGet(STATE_KEY, SYNC_AREA);
  if (syncState) {
    return normalizeState(syncState);
  }

  const legacyLocalState = await storageGet(STATE_KEY, LOCAL_AREA);
  if (legacyLocalState) {
    await storageSet(STATE_KEY, legacyLocalState, SYNC_AREA);
    await storageRemove(STATE_KEY, LOCAL_AREA);
    return normalizeState(legacyLocalState);
  }

  return normalizeState(null);
}

async function persistState() {
  await storageSet(STATE_KEY, state, SYNC_AREA);
}

function renderAll() {
  renderSearchButtons();
  renderQuickLinks();
  renderServices(getVisibleServices(), getEmptyServicesMessage());
  renderVisitPanels();
  setStatusFromCurrentData();
}

function renderSearchButtons() {
  refs.searchButtons.replaceChildren();
  const engines = state.search.engines;
  for (const engine of engines) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-button";
    button.title = engine.title;
    button.setAttribute("aria-label", button.title || t("searchAria"));
    button.classList.toggle("active", engine.id === state.search.defaultEngineId);
    button.append(createSearchEngineIcon(engine));
    button.addEventListener("click", () => {
      const query = refs.searchInput.value.trim();
      if (query) {
        runSearch(engine, query);
        return;
      }
      state.search.defaultEngineId = engine.id;
      void persistState();
      renderSearchButtons();
      refs.searchInput.focus();
    });
    refs.searchButtons.append(button);
  }
}

function createSearchEngineIcon(engine) {
  const icon = document.createElement("span");
  icon.className = "search-icon";
  const meta = getSearchEngineMeta(engine);
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

function renderQuickLinks() {
  refs.quickLinks.replaceChildren();
  for (const link of state.quickLinks) {
    refs.quickLinks.append(createQuickLink(link));
  }
}

function createQuickLink(link) {
  const meta = getQuickLinkMeta(link.url);
  const title = getQuickLinkTitle(link, meta);
  const iconDataUrl = meta?.iconDataUrl || "";

  const anchor = document.createElement("a");
  anchor.className = "quick-link";
  anchor.href = link.url;
  anchor.title = title;
  anchor.addEventListener("click", () => {
    void addVisitHistoryItem({
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

function getQuickLinkMeta(url) {
  const key = normalizeUrlKey(url);
  return key ? quickLinkMeta[key] || null : null;
}

function getSearchEngineMeta(engine) {
  const key = getSearchEngineMetaKey(engine);
  return key ? searchEngineMeta[key] || null : null;
}

function getSearchEngineMetaKey(engine) {
  return normalizeUrlKey(getSearchEngineIconPageUrl(engine));
}

function getSearchEngineIconPageUrl(engine) {
  const template = typeof engine?.template === "string" ? engine.template.trim() : "";
  if (!template) {
    return "";
  }
  try {
    const url = new URL(template.replace(/\{q\}/g, ""));
    return `${url.origin}/`;
  } catch {
    return "";
  }
}

function getQuickLinkTitle(link, meta) {
  const customTitle = typeof link.title === "string" ? link.title.trim() : "";
  if (customTitle) {
    return truncateTitle(customTitle);
  }
  if (meta?.title) {
    return truncateTitle(meta.title);
  }
  return truncateTitle(toDomain(link.url) || link.url);
}

async function refreshQuickLinkMetadata({ force }) {
  const links = state.quickLinks.filter((link) => isHttpUrl(link.url));
  let changed = false;
  const seen = new Set();

  for (const link of links) {
    const key = normalizeUrlKey(link.url);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);

    const cached = quickLinkMeta[key];
    if (!force && cached?.fetchedAt && Date.now() - cached.fetchedAt < QUICK_LINK_META_TTL_MS) {
      continue;
    }

    const meta = await fetchQuickLinkMetadata(link.url);
    quickLinkMeta[key] = {
      fetchedAt: Date.now(),
      title: meta.title || cached?.title || "",
      iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
    };
    changed = true;
    renderQuickLinks();
  }

  if (changed) {
    pruneQuickLinkMeta(seen);
    await storageSet(QUICK_LINK_META_KEY, quickLinkMeta, LOCAL_AREA);
  }
}

async function refreshSearchEngineMetadata({ force }) {
  const engines = state.search.engines;
  let changed = false;
  const seen = new Set();

  for (const engine of engines) {
    const key = getSearchEngineMetaKey(engine);
    const iconPageUrl = getSearchEngineIconPageUrl(engine);
    if (!key || !iconPageUrl || seen.has(key)) {
      continue;
    }
    seen.add(key);

    const cached = searchEngineMeta[key];
    if (!force && cached?.fetchedAt && Date.now() - cached.fetchedAt < QUICK_LINK_META_TTL_MS) {
      continue;
    }

    const meta = await fetchQuickLinkMetadata(iconPageUrl);
    searchEngineMeta[key] = {
      fetchedAt: Date.now(),
      iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
    };
    changed = true;
    renderSearchButtons();
  }

  if (changed) {
    pruneSearchEngineMeta(seen);
    await storageSet(SEARCH_ENGINE_META_KEY, searchEngineMeta, LOCAL_AREA);
  }
}

async function fetchQuickLinkMetadata(url) {
  const pageUrl = url;
  const chromeFaviconUrl = getChromeFaviconUrl(pageUrl, 32);
  const iconDataUrl = chromeFaviconUrl ? await fetchIconDataUrl(chromeFaviconUrl) : "";

  return {
    title: "",
    iconDataUrl: iconDataUrl || (await fetchIconDataUrl(getDefaultFaviconUrl(pageUrl))),
  };
}

function parsePageMetadata(html, pageUrl) {
  try {
    const document = new DOMParser().parseFromString(html, "text/html");
    const title =
      document.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() ||
      document.querySelector("title")?.textContent?.trim() ||
      "";
    const iconUrl = chooseIconUrl(document, pageUrl);
    return { title, iconUrl };
  } catch {
    return { title: "", iconUrl: "" };
  }
}

function chooseIconUrl(document, pageUrl) {
  const candidates = Array.from(document.querySelectorAll('link[rel]'))
    .map((node) => ({
      rel: (node.getAttribute("rel") || "").toLowerCase(),
      href: node.getAttribute("href") || "",
      sizes: node.getAttribute("sizes") || "",
    }))
    .filter((item) => item.href && /\b(icon|apple-touch-icon)\b/.test(item.rel));

  candidates.sort((a, b) => iconScore(b) - iconScore(a));
  const href = candidates[0]?.href;
  if (!href) {
    return "";
  }
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return "";
  }
}

function iconScore(icon) {
  const sizeMatch = icon.sizes.match(/(\d+)x(\d+)/i);
  const size = sizeMatch ? Number.parseInt(sizeMatch[1], 10) : 0;
  const relBonus = icon.rel.includes("apple-touch-icon") ? 1000 : 0;
  return relBonus + size;
}

async function fetchIconDataUrl(iconUrl) {
  try {
    const response = await fetchWithTimeout(iconUrl, 6500, { cache: "force-cache" });
    if (!response.ok) {
      return "";
    }
    const blob = await response.blob();
    if (!blob.type.startsWith("image/") || blob.size > 192 * 1024) {
      return "";
    }
    return await blobToDataUrl(blob);
  } catch {
    return "";
  }
}

function getDefaultFaviconUrl(url) {
  try {
    return new URL("/favicon.ico", url).href;
  } catch {
    return "";
  }
}

function getChromeFaviconUrl(pageUrl, size) {
  if (typeof globalThis.chrome?.runtime?.getURL !== "function" || !isHttpUrl(pageUrl)) {
    return "";
  }
  const url = new URL(globalThis.chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl);
  url.searchParams.set("size", String(size));
  return url.href;
}

function pruneQuickLinkMeta(activeKeys) {
  for (const key of Object.keys(quickLinkMeta)) {
    if (!activeKeys.has(key)) {
      delete quickLinkMeta[key];
    }
  }
}

function pruneSearchEngineMeta(activeKeys) {
  for (const key of Object.keys(searchEngineMeta)) {
    if (!activeKeys.has(key)) {
      delete searchEngineMeta[key];
    }
  }
}

function renderServices(services, emptyMessage = t("servicesEmptyAfterSync")) {
  refs.servicesGrid.replaceChildren();
  if (!services.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = emptyMessage;
    refs.servicesGrid.append(empty);
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
      card.append(createServiceRow(item));
    }

    article.append(heading, card);
    refs.servicesGrid.append(article);
  }
}

function createSectionIcon(icon, name) {
  const span = document.createElement("span");
  span.className = "section-icon";
  const normalized = normalizeSectionIcon(icon, name);
  span.innerHTML = ICONS[normalized] || ICONS.network;
  return span;
}

function createServiceRow(item) {
  const anchor = document.createElement("a");
  anchor.className = "service-row";
  anchor.href = item.url;
  anchor.target = item.target || "_self";
  if (anchor.target !== "_self") {
    anchor.rel = "noreferrer";
  }
  anchor.title = item.name;
  anchor.addEventListener("click", () => {
    void addVisitHistoryItem({
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

function handleSearchSubmit(event) {
  event.preventDefault();
  const rawQuery = refs.searchInput.value.trim();
  if (!rawQuery) {
    return;
  }
  const engine = getDefaultSearchEngine();
  if (engine) {
    void runSearch(engine, rawQuery);
  }
}

function getDefaultSearchEngine() {
  return state.search.engines.find((item) => item.id === state.search.defaultEngineId) || state.search.engines[0];
}

async function runSearch(engine, query) {
  const target = engine.template.replace("{q}", encodeURIComponent(query));
  await addVisitHistoryItem({
    title: `${engine.title}: ${query}`,
    url: target,
    source: "search",
  });
  window.location.assign(target);
}

function renderVisitPanels() {
  renderVisitList({
    panel: refs.frequentPanel,
    list: refs.frequentList,
    items: frequentVisits,
    metaFormatter: formatFrequentMeta,
  });
  renderVisitList({
    panel: refs.historyPanel,
    list: refs.historyList,
    items: visitHistory,
    metaFormatter: formatHistoryMeta,
  });
}

function renderVisitList({ panel, list, items, metaFormatter }) {
  list.replaceChildren();
  const isEmpty = !items.length;
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
      void addVisitHistoryItem(item);
    });

    const title = document.createElement("span");
    title.className = "visit-title";
    title.textContent = item.title || toDomain(item.url) || item.url;

    const meta = document.createElement("span");
    meta.className = "visit-meta";
    meta.textContent = metaFormatter(item);

    anchor.append(title, meta);
    list.append(anchor);
  }
}

async function addVisitHistoryItem(item) {
  const normalized = normalizeVisitHistoryItem(item);
  if (!normalized) {
    return;
  }
  normalized.visitedAt = Date.now();
  visitHistory = [
    normalized,
    ...visitHistory.filter((existing) => normalizeUrlKey(existing.url) !== normalizeUrlKey(normalized.url)),
  ].slice(0, VISIT_HISTORY_LIMIT);
  renderVisitPanels();
  if (hasBrowserHistoryApi()) {
    return;
  }
  await storageSet(HISTORY_KEY, visitHistory, LOCAL_AREA);
}

async function loadVisitHistory() {
  if (!hasBrowserHistoryApi()) {
    return normalizeVisitHistory(await storageGet(HISTORY_KEY));
  }
  return await new Promise((resolve) => {
    const chromeApi = globalThis.chrome;
    chromeApi.history.search(
      {
        text: "",
        startTime: 0,
        maxResults: VISIT_HISTORY_LIMIT * 3,
      },
      (results) => {
        if (chromeApi.runtime.lastError) {
          resolve([]);
          return;
        }
        resolve(normalizeVisitHistory((results || []).filter((item) => isHttpUrl(item.url))));
      },
    );
  });
}

async function refreshVisitHistory() {
  const [nextHistory, nextFrequent] = await Promise.all([loadVisitHistory(), loadFrequentVisits()]);
  if (!nextHistory.length && !visitHistory.length && !nextFrequent.length && !frequentVisits.length) {
    return;
  }
  visitHistory = nextHistory;
  frequentVisits = nextFrequent;
  renderVisitPanels();
}

function hasBrowserHistoryApi() {
  return typeof globalThis.chrome?.history?.search === "function";
}

async function loadFrequentVisits() {
  if (!hasBrowserHistoryApi()) {
    return [];
  }
  const settings = normalizeVisitSettings(state.visits, FALLBACK_CONFIG.visits);
  return await new Promise((resolve) => {
    const chromeApi = globalThis.chrome;
    chromeApi.history.search(
      {
        text: "",
        startTime: 0,
        maxResults: settings.frequentHistoryPool,
      },
      (results) => {
        if (chromeApi.runtime.lastError) {
          resolve([]);
          return;
        }
        const frequent = (results || [])
          .filter(
            (item) =>
              isHttpUrl(item.url) &&
              Number.isFinite(item.visitCount) &&
              item.visitCount >= settings.frequentMinVisits,
          )
          .sort((a, b) => {
            const visitsDiff = b.visitCount - a.visitCount;
            if (visitsDiff) {
              return visitsDiff;
            }
            return (b.lastVisitTime || 0) - (a.lastVisitTime || 0);
          });
        resolve(normalizeVisitHistory(frequent).slice(0, VISIT_HISTORY_LIMIT));
      },
    );
  });
}

async function syncHomer({ force }) {
  if (!state.homer.url) {
    setStatus("local", "no url", t("homerUrlMissing"));
    renderServices([], t("homerUrlMissing"));
    return;
  }

  const endpoints = deriveHomerEndpoints(state.homer.url);
  if (!endpoints) {
    setStatus("error", "bad url", t("homerUrlInvalid"));
    renderServices(getVisibleServices(), getEmptyServicesMessage());
    return;
  }

  if (!force && isCacheFresh(homerCache, HOMER_SYNC_INTERVAL_MINUTES)) {
    setStatus("cache", "cache", t("homerCache", formatDateTime(homerCache.fetchedAt)));
    renderServices(getVisibleServices(), getEmptyServicesMessage());
    return;
  }

  if (!force && isFailureFresh(syncMeta, HOMER_SYNC_INTERVAL_MINUTES, endpoints.configUrl)) {
    if (homerCache?.services?.length) {
      renderServices(homerCache.services);
      setStatus("cache", "offline", t("homerRecentFailureCache", formatDateTime(homerCache.fetchedAt)));
      return;
    }
    renderServices([], t("homerNeverFetched"));
    setStatus("local", "no homer", t("homerRecentFailureNoCache"));
    return;
  }

  if (!force && (await shouldSkipHomerSyncByNetwork(endpoints))) {
    renderServices(getVisibleServices(), getEmptyServicesMessage());
    setStatus("cache", homerCache?.services?.length ? "away" : "no homer", t("homerAway"));
    return;
  }

  setStatus("sync", "sync", t("homerSyncing"));
  try {
    const configText = await fetchTextWithTimeout(withCacheBuster(endpoints.configUrl), HOMER_FETCH_TIMEOUT_MS);
    const parsed = parseHomerConfig(configText, endpoints.configUrl);
    const services = normalizeServiceGroups(parsed.services, endpoints.configUrl);
    if (!services.length) {
      throw new Error("Homer config has no services.");
    }
    homerCache = {
      fetchedAt: Date.now(),
      sourceUrl: endpoints.configUrl,
      theme: typeof parsed.theme === "string" ? parsed.theme : "",
      services,
    };
    await storageSet(CACHE_KEY, homerCache, LOCAL_AREA);
    syncMeta = null;
    await storageRemove(META_KEY, LOCAL_AREA);
    applyTheme();
    renderServices(services);
    setStatus("live", "live", t("homerUpdated", formatDateTime(homerCache.fetchedAt)));
  } catch (error) {
    syncMeta = {
      failedAt: Date.now(),
      sourceUrl: endpoints.configUrl,
      message: error?.message || String(error),
    };
    await storageSet(META_KEY, syncMeta, LOCAL_AREA);
    if (homerCache?.services?.length) {
      renderServices(homerCache.services);
      setStatus("cache", "offline", t("homerOfflineCache", formatDateTime(homerCache.fetchedAt)));
      return;
    }
    renderServices([], t("homerNeverFetched"));
    setStatus("local", "no homer", t("homerOfflineNoCache"));
  }
}

function openSettings() {
  settingsDraft = clone(state);
  renderSettings();
  refs.settingsOverlay.classList.remove("hidden");
  refs.homerUrlInput.focus();
}

function closeSettings() {
  refs.settingsOverlay.classList.add("hidden");
  settingsDraft = null;
}

function renderSettings() {
  if (!settingsDraft) {
    return;
  }
  renderEngineSettings();
  renderQuickLinkSettings();
  refs.homerUrlInput.value = settingsDraft.homer.url;
  refs.frequentHistoryPoolInput.value = String(settingsDraft.visits.frequentHistoryPool);
  refs.frequentMinVisitsInput.value = String(settingsDraft.visits.frequentMinVisits);
}

function renderEngineSettings() {
  refs.engineRows.replaceChildren();
  for (const [index, engine] of settingsDraft.search.engines.entries()) {
    const row = document.createElement("div");
    row.className = "settings-row engine-row";
    const dragHandle = createDragHandle();
    attachReorderHandlers(row, dragHandle, settingsDraft.search.engines, index, renderSettings);

    const title = createInput(t("inputTitle"), engine.title);
    const template = createInput(t("inputSearchTemplate"), engine.template);
    const defaultWrap = document.createElement("label");
    defaultWrap.className = "default-field";
    const defaultRadio = document.createElement("input");
    defaultRadio.type = "radio";
    defaultRadio.name = "defaultSearchEngine";
    defaultRadio.checked = engine.id === settingsDraft.search.defaultEngineId;
    defaultWrap.append(defaultRadio, document.createTextNode("Enter"));
    const remove = createSmallButton("×", t("remove"));

    title.addEventListener("input", () => {
      engine.title = title.value;
    });
    template.addEventListener("input", () => {
      engine.template = template.value;
    });
    defaultRadio.addEventListener("change", () => {
      settingsDraft.search.defaultEngineId = engine.id;
    });
    remove.addEventListener("click", () => {
      settingsDraft.search.engines = settingsDraft.search.engines.filter((item) => item.id !== engine.id);
      if (settingsDraft.search.defaultEngineId === engine.id) {
        settingsDraft.search.defaultEngineId = settingsDraft.search.engines[0]?.id || "";
      }
      renderSettings();
    });

    row.append(dragHandle, title, template, defaultWrap, remove);
    refs.engineRows.append(row);
  }
}

function renderQuickLinkSettings() {
  refs.quickLinkRows.replaceChildren();
  for (const [index, link] of settingsDraft.quickLinks.entries()) {
    const row = document.createElement("div");
    row.className = "settings-row quick-row";
    const dragHandle = createDragHandle();
    attachReorderHandlers(row, dragHandle, settingsDraft.quickLinks, index, renderSettings);

    const title = createInput(t("inputQuickLinkTitle"), link.title);
    const url = createInput("URL", link.url, "url");
    const remove = createSmallButton("×", t("remove"));

    title.addEventListener("input", () => {
      link.title = title.value;
    });
    url.addEventListener("input", () => {
      link.url = url.value;
    });
    remove.addEventListener("click", () => {
      settingsDraft.quickLinks = settingsDraft.quickLinks.filter((item) => item.id !== link.id);
      renderSettings();
    });

    row.append(dragHandle, title, url, remove);
    refs.quickLinkRows.append(row);
  }
}

function createDragHandle() {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "drag-handle";
  handle.textContent = "☰";
  handle.title = t("dragToReorder");
  handle.setAttribute("aria-label", t("dragToReorder"));
  return handle;
}

function attachReorderHandlers(row, handle, items, index, onMove) {
  handle.draggable = true;
  handle.addEventListener("dragstart", (event) => {
    row.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  });
  handle.addEventListener("dragend", () => {
    row.classList.remove("dragging");
  });
  row.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    row.classList.add("drag-over");
  });
  row.addEventListener("dragleave", () => {
    row.classList.remove("drag-over");
  });
  row.addEventListener("drop", (event) => {
    event.preventDefault();
    row.classList.remove("drag-over");
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isNaN(fromIndex)) {
      return;
    }
    moveItem(items, fromIndex, index);
    onMove();
  });
}

function moveItem(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
    return;
  }
  const [item] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, item);
}

function validateSettingsDraft() {
  if (!settingsDraft) {
    return { ok: false, error: t("settingsNotOpen") };
  }

  const cleanedEngines = settingsDraft.search.engines
    .map((engine) => ({
      id: engine.id || makeId("engine"),
      title: engine.title.trim(),
      template: engine.template.trim(),
    }))
    .filter((engine) => engine.title && engine.template);

  if (!cleanedEngines.length) {
    return { ok: false, error: t("needSearchEngine") };
  }
  if (cleanedEngines.some((engine) => !engine.template.includes("{q}"))) {
    return { ok: false, error: t("searchTemplateMissingQuery") };
  }
  const cleanedLinks = settingsDraft.quickLinks
    .map((link) => ({
      id: link.id || makeId("quick"),
      title: typeof link.title === "string" ? link.title.trim() : "",
      url: link.url.trim(),
    }))
    .filter((link) => link.url);

  if (cleanedLinks.some((link) => !isHttpUrl(link.url))) {
    return { ok: false, error: t("quickLinkBadUrl") };
  }

  const nextHomer = readHomerDraft();
  if (nextHomer.url && !deriveHomerEndpoints(nextHomer.url)) {
    return { ok: false, error: t("homerUrlInvalid") };
  }

  return {
    ok: true,
    state: {
      search: {
        engines: cleanedEngines,
        defaultEngineId:
          cleanedEngines.find((engine) => engine.id === settingsDraft.search.defaultEngineId)?.id ||
          cleanedEngines[0].id,
      },
      quickLinks: cleanedLinks,
      homer: nextHomer,
      visits: readVisitsDraft(),
    },
  };
}

function readHomerDraft() {
  return {
    url: refs.homerUrlInput.value.trim(),
  };
}

function readVisitsDraft() {
  return normalizeVisitSettings(
    {
      frequentHistoryPool: refs.frequentHistoryPoolInput.value,
      frequentMinVisits: refs.frequentMinVisitsInput.value,
    },
    FALLBACK_CONFIG.visits,
  );
}

function createInput(placeholder, value, type = "text") {
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  input.name = placeholder
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-zа-я0-9_{}]/gi, "");
  input.setAttribute("aria-label", placeholder);
  input.value = value || "";
  input.title = placeholder;
  return input;
}

function createSmallButton(text, title) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "row-button";
  button.textContent = text;
  button.title = title;
  return button;
}

function normalizeBootConfig(raw) {
  const fallback = clone(FALLBACK_CONFIG);
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    homer: normalizeHomerSettings(source.homer, fallback.homer),
    theme: {
      backgroundDark:
        typeof source.theme?.backgroundDark === "string" ? source.theme.backgroundDark : fallback.theme.backgroundDark,
      backgroundLight:
        typeof source.theme?.backgroundLight === "string"
          ? source.theme.backgroundLight
          : fallback.theme.backgroundLight,
    },
    search: normalizeSearch(source.search, fallback.search),
    quickLinks: normalizeQuickLinks(source.quickLinks, fallback.quickLinks),
    visits: normalizeVisitSettings(source.visits, fallback.visits),
    services: normalizeServiceGroups(source.services, ""),
  };
}

function createDefaultState() {
  return {
    search: clone(baseConfig.search),
    quickLinks: clone(baseConfig.quickLinks),
    homer: clone(baseConfig.homer),
    visits: clone(baseConfig.visits),
  };
}

function normalizeState(raw) {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  return {
    search: normalizeSearch(raw.search, base.search),
    quickLinks: normalizeQuickLinks(raw.quickLinks, base.quickLinks),
    homer: normalizeHomerSettings(raw.homer, base.homer),
    visits: normalizeVisitSettings(raw.visits, base.visits),
  };
}

function normalizeSearch(raw, fallback) {
  const fallbackSearch = fallback || FALLBACK_CONFIG.search;
  const engines = Array.isArray(raw?.engines)
    ? raw.engines.map(normalizeSearchEngine).filter(Boolean)
    : clone(fallbackSearch.engines);
  if (!engines.length) {
    engines.push(...clone(FALLBACK_CONFIG.search.engines));
  }
  const defaultEngineId =
    typeof raw?.defaultEngineId === "string" && engines.some((engine) => engine.id === raw.defaultEngineId)
      ? raw.defaultEngineId
      : engines[0].id;
  return { engines, defaultEngineId };
}

function normalizeSearchEngine(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const template = typeof raw.template === "string" ? raw.template.trim() : "";
  if (!title || !template) {
    return null;
  }
  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : makeId("engine"),
    title,
    template,
  };
}

function normalizeQuickLinks(raw, fallback) {
  const source = Array.isArray(raw) ? raw : fallback || [];
  return source
    .map((link) => ({
      id: typeof link?.id === "string" && link.id ? link.id : makeId("quick"),
      title: typeof link?.title === "string" ? link.title.trim() : "",
      url: typeof link?.url === "string" ? link.url.trim() : "",
    }))
    .filter((link) => link.url);
}

function normalizeHomerSettings(raw, fallback) {
  const base = fallback || FALLBACK_CONFIG.homer;
  return {
    url: typeof raw?.url === "string" ? raw.url : base.url || "",
  };
}

function normalizeVisitSettings(raw, fallback) {
  const base = fallback || FALLBACK_CONFIG.visits;
  return {
    frequentHistoryPool: clampInt(raw?.frequentHistoryPool, 50, 50000, base.frequentHistoryPool),
    frequentMinVisits: clampInt(raw?.frequentMinVisits, 2, 1000, base.frequentMinVisits),
  };
}

function normalizeQuickLinkMeta(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key || !value || typeof value !== "object") {
      continue;
    }
    out[key] = {
      fetchedAt: Number.isFinite(value.fetchedAt) ? value.fetchedAt : 0,
      title: typeof value.title === "string" ? value.title : "",
      iconDataUrl:
        typeof value.iconDataUrl === "string" && value.iconDataUrl.startsWith("data:image/")
          ? value.iconDataUrl
          : "",
    };
  }
  return out;
}

function normalizeSearchEngineMeta(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key || !value || typeof value !== "object") {
      continue;
    }
    out[key] = {
      fetchedAt: Number.isFinite(value.fetchedAt) ? value.fetchedAt : 0,
      iconDataUrl:
        typeof value.iconDataUrl === "string" && value.iconDataUrl.startsWith("data:image/")
          ? value.iconDataUrl
          : "",
    };
  }
  return out;
}

function normalizeVisitHistory(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const normalized = normalizeVisitHistoryItem(item);
    const key = normalized ? normalizeUrlKey(normalized.url) : "";
    if (!normalized || !key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(normalized);
    if (out.length >= VISIT_HISTORY_LIMIT) {
      break;
    }
  }
  return out;
}

function normalizeVisitHistoryItem(raw) {
  if (!raw || typeof raw !== "object" || !isHttpUrl(raw.url)) {
    return null;
  }
  const title = String(raw.title || "").replace(/\s+/g, " ").trim();
  const fallbackTitle = toDomain(raw.url) || raw.url;
  return {
    title: title ? truncateHistoryTitle(title) : fallbackTitle,
    url: raw.url,
    source: typeof raw.source === "string" ? raw.source : "",
    visitCount: Number.isFinite(raw.visitCount) ? raw.visitCount : 0,
    visitedAt: Number.isFinite(raw.visitedAt)
      ? raw.visitedAt
      : Number.isFinite(raw.lastVisitTime)
        ? raw.lastVisitTime
        : Date.now(),
  };
}

function getVisibleServices() {
  if (!state.homer.url) {
    return [];
  }
  if (homerCache?.services?.length) {
    return homerCache.services;
  }
  return [];
}

function canShowHomerCache() {
  return Boolean(homerCache?.services?.length);
}

function getEmptyServicesMessage() {
  if (!state.homer.url) {
    return t("homerUrlMissing");
  }
  if (homerCache?.services?.length) {
    return "";
  }
  return t("servicesEmptyFirstSync");
}

function setStatusFromCurrentData() {
  if (!state.homer.url) {
    setStatus("local", "no url", t("homerUrlMissing"));
    return;
  }
  if (homerCache?.services?.length) {
    setStatus("cache", "cache", t("homerCache", formatDateTime(homerCache.fetchedAt)));
    return;
  }
  setStatus("local", homerCache?.services?.length ? "away" : "no homer", getEmptyServicesMessage());
}

function setStatus(kind, text, title) {
  refs.statusButton.dataset.status = kind;
  refs.statusText.textContent = text;
  refs.statusButton.title = title;
}

function getHomerWallpaperUrl() {
  const theme = String(homerCache?.theme || "").trim();
  if (!theme) {
    return "";
  }
  const configUrl = homerCache?.sourceUrl || deriveHomerEndpoints(state.homer.url)?.configUrl || "";
  if (!configUrl) {
    return "";
  }
  const prefersLight = globalThis.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  const fileName = prefersLight ? "wallpaper-light.webp" : "wallpaper.webp";
  return resolveAssetUrl(`assets/themes/${theme}/${fileName}`, configUrl);
}

