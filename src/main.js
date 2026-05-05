import {
  CACHE_KEY,
  FREQUENT_HISTORY_KEY,
  GITHUB_TRENDING_CACHE_KEY,
  HISTORY_KEY,
  LOCAL_AREA,
  LOCAL_PATCH_KEY,
  META_KEY,
  NEWS_FEED_CACHE_KEY,
  QUICK_LINK_META_KEY,
  SEARCH_ENGINE_META_KEY,
  STATE_KEY,
  SYNC_AREA,
  WEATHER_CACHE_KEY,
} from "./constants.js";
import { FALLBACK_CONFIG } from "./default-config.js";
import { normalizeGitHubTrendingCache, syncGitHubTrending } from "./github-trending.js";
import { normalizeHomerCache, normalizeSyncMeta } from "./homer.js";
import { applyLocalization, t } from "./i18n.js";
import { addVisitHistoryItem, refreshVisitHistory } from "./history.js";
import { refreshQuickLinkMetadata, refreshSearchEngineMetadata } from "./metadata.js";
import { getVisibleNewsSources, normalizeNewsFeedCache, syncNewsFeeds } from "./news.js";
import {
  renderAll,
  renderGitHubTrending,
  renderNewsFeedWidgets,
  renderQuickLinks,
  renderSearchButtons,
  renderVisitPanels,
  renderWeatherWidget,
} from "./render.js";
import {
  closeSettings,
  handleExportSettings,
  handleImportSettings,
  openSettings,
  renderSettings,
  validateSettingsDraft,
} from "./settings.js";
import {
  createDefaultState,
  createSyncedState,
  normalizeBootConfig,
  normalizeLocalPatch,
  normalizeQuickLinkMeta,
  normalizeSearchEngineMeta,
  normalizeSyncedState,
  normalizeVisitHistory,
  normalizeViewMode,
  normalizeWidgetOrder,
  applyLocalPatch,
  getVisibleSearchEngines,
} from "./state.js";
import { syncHomer } from "./sync.js";
import { applyTheme } from "./theme.js";
import {
  byId,
  clone,
  isHttpUrl,
  makeId,
  normalizeUrlKey,
  storageGet,
  storageGetMany,
  storageRemove,
  storageSet,
  toDomain,
} from "./utils.js";
import { normalizeWeatherCache, syncWeather } from "./weather.js";

const app = {
  refs: {},
  baseConfig: normalizeBootConfig(globalThis.HOMER_OR_NOT_CONFIG || FALLBACK_CONFIG),
  state: null,
  localPatch: null,
  homerCache: null,
  homerCachePersistTimer: 0,
  syncMeta: null,
  quickLinkMeta: {},
  searchEngineMeta: {},
  weatherCache: null,
  weatherStatus: null,
  githubTrendingCache: null,
  githubTrendingStatus: null,
  newsFeedCache: null,
  newsStatuses: {},
  newsCachePersistTimer: 0,
  visitHistory: [],
  frequentVisits: [],
  settingsDraft: null,
  foregroundRefreshPromise: null,
};

app.state = createDefaultState(app.baseConfig);
app.addVisitHistoryItem = (item) => addVisitHistoryItem(app, item);
app.addQuickLinkFromVisit = addQuickLinkFromVisit;
app.applyTheme = () => applyTheme(app);
app.persistState = persistState;
app.persistLocalPatch = persistLocalPatch;
app.renderQuickLinks = () => renderQuickLinks(app);
app.renderSearchButtons = () => renderSearchButtons(app);
app.renderVisitPanels = () => renderVisitPanels(app);
app.renderWeatherWidget = () => renderWeatherWidget(app);
app.renderGitHubTrending = () => renderGitHubTrending(app);
app.renderNewsFeedWidgets = () => renderNewsFeedWidgets(app);
app.syncNewsFeed = syncNewsFeedById;
app.runSearch = runSearch;
app.setViewMode = setViewMode;

document.addEventListener("DOMContentLoaded", () => {
  void init();
});

async function init() {
  bindRefs();
  applyLocalization();
  bindEvents();
  const localCachePromise = storageGetMany([
    CACHE_KEY,
    META_KEY,
    QUICK_LINK_META_KEY,
    SEARCH_ENGINE_META_KEY,
    HISTORY_KEY,
    FREQUENT_HISTORY_KEY,
    WEATHER_CACHE_KEY,
    GITHUB_TRENDING_CACHE_KEY,
    NEWS_FEED_CACHE_KEY,
  ]);
  await loadSettingsState();
  const localCache = await localCachePromise;
  app.homerCache = normalizeHomerCache(localCache[CACHE_KEY]);
  app.syncMeta = normalizeSyncMeta(localCache[META_KEY]);
  app.quickLinkMeta = normalizeQuickLinkMeta(localCache[QUICK_LINK_META_KEY]);
  app.searchEngineMeta = normalizeSearchEngineMeta(localCache[SEARCH_ENGINE_META_KEY]);
  app.weatherCache = normalizeWeatherCache(localCache[WEATHER_CACHE_KEY]);
  app.githubTrendingCache = normalizeGitHubTrendingCache(localCache[GITHUB_TRENDING_CACHE_KEY]);
  app.newsFeedCache = normalizeNewsFeedCache(localCache[NEWS_FEED_CACHE_KEY]);
  app.visitHistory = app.localPatch?.visits?.showRecent !== false ? normalizeVisitHistory(localCache[HISTORY_KEY]) : [];
  app.frequentVisits =
    app.localPatch?.visits?.showFrequent !== false ? normalizeVisitHistory(localCache[FREQUENT_HISTORY_KEY]) : [];
  applyTheme(app);
  renderViewMode(app);
  renderAll(app);
  scheduleInitialRefresh();
}

function scheduleInitialRefresh() {
  const run = () => {
    void refreshVisitHistory(app);
    void refreshSearchEngineMetadata(app, { force: false });
    void refreshQuickLinkMetadata(app, { force: false });
    void syncWeather(app, { force: false });
    void syncNewsFeeds(app, { force: false });
    void syncGitHubTrending(app, { force: false });
    void syncHomer(app, { force: false });
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 1000 });
    return;
  }
  window.setTimeout(run, 250);
}

function bindRefs() {
  const { refs } = app;
  refs.statusButton = byId("statusButton");
  refs.statusDot = byId("statusDot");
  refs.statusText = byId("statusText");
  refs.modeSwitcher = byId("modeSwitcher");
  refs.syncButton = byId("syncButton");
  refs.settingsButton = byId("settingsButton");
  refs.searchForm = byId("searchForm");
  refs.searchInput = byId("searchInput");
  refs.searchButtons = byId("searchButtons");
  refs.quickLinks = byId("quickLinks");
  refs.servicesLayout = byId("servicesLayout");
  refs.servicesGrid = byId("servicesGrid");
  refs.topWeatherWidget = byId("topWeatherWidget");
  refs.topWeatherIcon = byId("topWeatherIcon");
  refs.topWeatherTemp = byId("topWeatherTemp");
  refs.topWeatherPlace = byId("topWeatherPlace");
  refs.topWeatherCondition = byId("topWeatherCondition");
  refs.topWeatherFeels = byId("topWeatherFeels");
  refs.topWeatherRange = byId("topWeatherRange");
  refs.topWeatherHumidity = byId("topWeatherHumidity");
  refs.topWeatherWind = byId("topWeatherWind");
  refs.topWeatherRain = byId("topWeatherRain");
  refs.topWeatherUpdated = byId("topWeatherUpdated");
  refs.topWeatherRefreshButton = byId("topWeatherRefreshButton");
  refs.weatherWidget = byId("weatherWidget");
  refs.weatherIcon = byId("weatherIcon");
  refs.weatherTemp = byId("weatherTemp");
  refs.weatherPlace = byId("weatherPlace");
  refs.weatherCondition = byId("weatherCondition");
  refs.weatherFeels = byId("weatherFeels");
  refs.weatherRange = byId("weatherRange");
  refs.weatherHumidity = byId("weatherHumidity");
  refs.weatherWind = byId("weatherWind");
  refs.weatherRain = byId("weatherRain");
  refs.weatherUpdated = byId("weatherUpdated");
  refs.weatherRefreshButton = byId("weatherRefreshButton");
  refs.githubTrending = byId("githubTrending");
  refs.githubTrendingList = byId("githubTrendingList");
  refs.githubTrendingMeta = byId("githubTrendingMeta");
  refs.githubTrendingRefreshButton = byId("githubTrendingRefreshButton");
  refs.newsWidgetNodes = {};
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
  refs.addRssButton = byId("addRssButton");
  refs.topWeatherEnabledInput = byId("topWeatherEnabledInput");
  refs.topWeatherZenInput = byId("topWeatherZenInput");
  refs.weatherLocationInput = byId("weatherLocationInput");
  refs.topWeatherPlacementInput = byId("topWeatherPlacementInput");
  refs.widgetRows = byId("widgetRows");
  refs.frequentHistoryPoolInput = byId("frequentHistoryPoolInput");
  refs.frequentMinVisitsInput = byId("frequentMinVisitsInput");
  refs.showFrequentVisitsInput = byId("showFrequentVisitsInput");
  refs.showRecentVisitsInput = byId("showRecentVisitsInput");
  refs.exportSettingsButton = byId("exportSettingsButton");
  refs.importSettingsInput = byId("importSettingsInput");
  refs.resetButton = byId("resetButton");
  refs.saveButton = byId("saveButton");
}

function bindEvents() {
  const { refs } = app;
  refs.searchForm.addEventListener("submit", handleSearchSubmit);
  refs.modeSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (button) {
      void setViewMode(button.dataset.mode);
    }
  });
  refs.syncButton.addEventListener("click", () => {
    void syncHomer(app, { force: true });
  });
  refs.weatherRefreshButton.addEventListener("click", () => {
    void syncWeather(app, { force: true });
  });
  refs.topWeatherRefreshButton.addEventListener("click", () => {
    void syncWeather(app, { force: true });
  });
  refs.githubTrendingRefreshButton.addEventListener("click", () => {
    void syncGitHubTrending(app, { force: true });
  });
  refs.statusButton.addEventListener("click", () => openSettings(app));
  refs.settingsButton.addEventListener("click", () => openSettings(app));
  refs.closeSettingsButton.addEventListener("click", () => closeSettings(app));
  refs.settingsOverlay.addEventListener("click", (event) => {
    if (event.target === refs.settingsOverlay) {
      closeSettings(app);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !refs.settingsOverlay.classList.contains("hidden")) {
      closeSettings(app);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void refreshForegroundData();
    }
  });
  window.addEventListener("focus", () => {
    void refreshForegroundData();
  });
  refs.addEngineButton.addEventListener("click", () => {
    if (!app.settingsDraft) {
      return;
    }
    app.settingsDraft.search.engines.push({
      id: makeId("engine"),
      title: "",
      template: "https://example.com/search?q={q}",
    });
    renderSettings(app);
  });
  refs.addQuickLinkButton.addEventListener("click", () => {
    if (!app.settingsDraft) {
      return;
    }
    app.settingsDraft.quickLinks.push({
      id: makeId("quick"),
      title: "",
      url: "",
    });
    renderSettings(app);
  });
  refs.addRssButton.addEventListener("click", () => {
    if (!app.settingsDraft) {
      return;
    }
    const source = {
      id: makeId("rss"),
      title: "RSS",
      type: "rss",
      url: "",
      enabled: true,
      syncIntervalMinutes: 60,
      maxItems: 12,
    };
    app.settingsDraft.news.sources.push(source);
    app.localPatchDraft = normalizeLocalPatch(app.localPatchDraft, app.settingsDraft);
    app.localPatchDraft.widgets.order = normalizeWidgetOrder(app.localPatchDraft.widgets?.order, app.settingsDraft);
    renderSettings(app);
  });
  refs.exportSettingsButton.addEventListener("click", () => handleExportSettings(app));
  refs.importSettingsInput.addEventListener("change", (event) => {
    void handleImportSettings(app, event);
  });
  refs.saveButton.addEventListener("click", saveSettings);
  refs.resetButton.addEventListener("click", resetSettings);
}

async function loadSettingsState() {
  const [syncState, rawLocalPatch] = await Promise.all([storageGet(STATE_KEY, SYNC_AREA), storageGet(LOCAL_PATCH_KEY)]);
  let syncedState;
  let shouldPersistSyncedState = false;
  let sourceDefaultEngineId = "";
  if (syncState) {
    syncedState = normalizeSyncedState(syncState, app.baseConfig);
    sourceDefaultEngineId = typeof syncState.search?.defaultEngineId === "string" ? syncState.search.defaultEngineId : "";
    shouldPersistSyncedState = Boolean(sourceDefaultEngineId);
  } else {
    const legacyLocalState = await storageGet(STATE_KEY, LOCAL_AREA);
    if (legacyLocalState) {
      syncedState = normalizeSyncedState(legacyLocalState, app.baseConfig);
      sourceDefaultEngineId =
        typeof legacyLocalState.search?.defaultEngineId === "string" ? legacyLocalState.search.defaultEngineId : "";
      shouldPersistSyncedState = true;
      await storageRemove(STATE_KEY, LOCAL_AREA);
    } else {
      syncedState = normalizeSyncedState(null, app.baseConfig);
    }
  }

  const localPatch = normalizeLocalPatch(rawLocalPatch, syncedState);
  let shouldPersistLocalPatch = !rawLocalPatch;
  if (!rawLocalPatch && sourceDefaultEngineId) {
    localPatch.search.defaultEngineId = sourceDefaultEngineId;
    shouldPersistLocalPatch = true;
  }
  app.localPatch = normalizeLocalPatch(localPatch, syncedState);
  app.state = applyLocalPatch(syncedState, app.localPatch);
  await Promise.all([
    shouldPersistSyncedState ? persistState() : Promise.resolve(),
    shouldPersistLocalPatch ? persistLocalPatch() : Promise.resolve(),
  ]);
}

async function persistState() {
  await storageSet(STATE_KEY, createSyncedState(app.state), SYNC_AREA);
}

async function persistLocalPatch() {
  app.localPatch = normalizeLocalPatch(app.localPatch, app.state);
  app.state = applyLocalPatch(app.state, app.localPatch);
  await storageSet(LOCAL_PATCH_KEY, app.localPatch, LOCAL_AREA);
}

async function setViewMode(mode) {
  if (!app.localPatch) {
    app.localPatch = normalizeLocalPatch(null, app.state);
  }
  const nextMode = normalizeViewMode(mode);
  if (app.localPatch.viewMode === nextMode) {
    return;
  }
  app.localPatch.viewMode = nextMode;
  renderViewMode(app);
  await persistLocalPatch();
}

function refreshForegroundData() {
  if (document.visibilityState !== "visible") {
    return app.foregroundRefreshPromise || Promise.resolve();
  }
  if (!app.foregroundRefreshPromise) {
    app.foregroundRefreshPromise = Promise.all([
      refreshVisitHistory(app),
      syncWeather(app, { force: false }),
      syncNewsFeeds(app, { force: false }),
    ]).finally(() => {
      app.foregroundRefreshPromise = null;
    });
  }
  return app.foregroundRefreshPromise;
}

function syncNewsFeedById(sourceId, options = {}) {
  if (!getVisibleNewsSources(app).some((item) => item.id === sourceId)) {
    return Promise.resolve();
  }
  return syncNewsFeeds(app, { ...options, sourceIds: [sourceId] });
}

function renderViewMode({ refs, localPatch }) {
  const mode = normalizeViewMode(localPatch?.viewMode);
  document.body.dataset.viewMode = mode;
  refs.modeSwitcher.querySelectorAll("[data-mode]").forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const rawQuery = app.refs.searchInput.value.trim();
  if (!rawQuery) {
    return;
  }
  const engine = getDefaultSearchEngine();
  if (engine) {
    void runSearch(engine, rawQuery);
  }
}

function getDefaultSearchEngine() {
  const engines = getVisibleSearchEngines(app);
  return engines.find((item) => item.id === app.state.search.defaultEngineId) || engines[0];
}

async function runSearch(engine, query) {
  const target = engine.template.replace("{q}", encodeURIComponent(query));
  await addVisitHistoryItem(app, {
    title: `${engine.title}: ${query}`,
    url: target,
    source: "search",
  });
  window.location.assign(target);
}

async function addQuickLinkFromVisit(item) {
  const url = typeof item?.url === "string" ? item.url.trim() : "";
  const key = normalizeUrlKey(url);
  if (!key || !isHttpUrl(url)) {
    return;
  }

  const existing = app.state.quickLinks.find((link) => normalizeUrlKey(link.url) === key);
  if (existing) {
    app.localPatch.quickLinks.disabledLinkIds = app.localPatch.quickLinks.disabledLinkIds.filter(
      (id) => id !== existing.id,
    );
    app.state = applyLocalPatch(app.state, app.localPatch);
    await persistLocalPatch();
    renderAll(app);
    void refreshQuickLinkMetadata(app, { force: false });
    return;
  }

  const title = String(item.title || toDomain(url) || url)
    .replace(/\s+/g, " ")
    .trim();
  app.state.quickLinks = [
    ...app.state.quickLinks,
    {
      id: makeId("quick"),
      title,
      url,
    },
  ];
  app.localPatch = normalizeLocalPatch(app.localPatch, app.state);
  app.state = applyLocalPatch(app.state, app.localPatch);
  await Promise.all([persistState(), persistLocalPatch()]);
  renderAll(app);
  void refreshQuickLinkMetadata(app, { force: false });
}

async function saveSettings() {
  const result = validateSettingsDraft(app);
  if (!result.ok) {
    window.alert(result.error);
    return;
  }
  app.state = result.state;
  app.localPatch = normalizeLocalPatch(result.localPatch, app.state);
  app.state = applyLocalPatch(app.state, app.localPatch);
  await Promise.all([persistState(), persistLocalPatch()]);
  closeSettings(app);
  renderAll(app);
  void refreshSearchEngineMetadata(app, { force: true });
  void refreshQuickLinkMetadata(app, { force: true });
  void syncWeather(app, { force: true });
  void syncNewsFeeds(app, { force: false });
  void syncGitHubTrending(app, { force: false });
  await syncHomer(app, { force: true });
}

async function resetSettings() {
  const confirmed = window.confirm(t("resetConfirm"));
  if (!confirmed) {
    return;
  }
  app.state = createDefaultState(app.baseConfig);
  app.localPatch = normalizeLocalPatch(null, app.state);
  app.state = applyLocalPatch(app.state, app.localPatch);
  app.homerCache = null;
  app.quickLinkMeta = {};
  app.searchEngineMeta = {};
  app.weatherCache = null;
  app.weatherStatus = null;
  app.githubTrendingCache = null;
  app.githubTrendingStatus = null;
  app.newsFeedCache = null;
  app.newsStatuses = {};
  app.visitHistory = [];
  app.frequentVisits = [];
  app.settingsDraft = clone(app.state);
  app.localPatchDraft = clone(app.localPatch);
  app.syncMeta = null;
  await Promise.all([
    storageRemove(STATE_KEY, SYNC_AREA),
    storageRemove(
      [
        LOCAL_PATCH_KEY,
        CACHE_KEY,
        META_KEY,
        QUICK_LINK_META_KEY,
        SEARCH_ENGINE_META_KEY,
        HISTORY_KEY,
        FREQUENT_HISTORY_KEY,
        WEATHER_CACHE_KEY,
        GITHUB_TRENDING_CACHE_KEY,
        NEWS_FEED_CACHE_KEY,
      ],
      LOCAL_AREA,
    ),
  ]);
  renderViewMode(app);
  renderAll(app);
  renderSettings(app);
  void refreshSearchEngineMetadata(app, { force: true });
  void syncWeather(app, { force: true });
  void syncNewsFeeds(app, { force: true });
  void syncGitHubTrending(app, { force: true });
  await syncHomer(app, { force: true });
}
