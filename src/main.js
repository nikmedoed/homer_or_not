import {
  CACHE_KEY,
  HISTORY_KEY,
  LOCAL_AREA,
  META_KEY,
  QUICK_LINK_META_KEY,
  SEARCH_ENGINE_META_KEY,
  STATE_KEY,
  SYNC_AREA,
} from "./constants.js";
import { FALLBACK_CONFIG } from "./default-config.js";
import { normalizeHomerCache, normalizeSyncMeta } from "./homer.js";
import { applyLocalization, t } from "./i18n.js";
import { addVisitHistoryItem, loadFrequentVisits, loadVisitHistory, refreshVisitHistory } from "./history.js";
import { refreshQuickLinkMetadata, refreshSearchEngineMetadata } from "./metadata.js";
import {
  renderAll,
  renderQuickLinks,
  renderSearchButtons,
  renderVisitPanels,
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
  normalizeBootConfig,
  normalizeQuickLinkMeta,
  normalizeSearchEngineMeta,
  normalizeState,
} from "./state.js";
import { syncHomer } from "./sync.js";
import { applyTheme } from "./theme.js";
import { byId, clone, makeId, storageGet, storageRemove, storageSet } from "./utils.js";

const app = {
  refs: {},
  baseConfig: normalizeBootConfig(globalThis.HOMER_OR_NOT_CONFIG || FALLBACK_CONFIG),
  state: null,
  homerCache: null,
  syncMeta: null,
  quickLinkMeta: {},
  searchEngineMeta: {},
  visitHistory: [],
  frequentVisits: [],
  settingsDraft: null,
};

app.state = createDefaultState(app.baseConfig);
app.addVisitHistoryItem = (item) => addVisitHistoryItem(app, item);
app.applyTheme = () => applyTheme(app);
app.persistState = persistState;
app.renderQuickLinks = () => renderQuickLinks(app);
app.renderSearchButtons = () => renderSearchButtons(app);
app.renderVisitPanels = () => renderVisitPanels(app);
app.runSearch = runSearch;

document.addEventListener("DOMContentLoaded", () => {
  void init();
});

async function init() {
  bindRefs();
  applyLocalization();
  bindEvents();
  app.state = await loadState();
  app.homerCache = normalizeHomerCache(await storageGet(CACHE_KEY));
  app.syncMeta = normalizeSyncMeta(await storageGet(META_KEY));
  app.quickLinkMeta = normalizeQuickLinkMeta(await storageGet(QUICK_LINK_META_KEY));
  app.searchEngineMeta = normalizeSearchEngineMeta(await storageGet(SEARCH_ENGINE_META_KEY));
  app.visitHistory = await loadVisitHistory();
  app.frequentVisits = await loadFrequentVisits(app);
  applyTheme(app);
  renderAll(app);
  void refreshSearchEngineMetadata(app, { force: false });
  void refreshQuickLinkMetadata(app, { force: false });
  await syncHomer(app, { force: false });
  app.refs.searchInput.focus();
}

function bindRefs() {
  const { refs } = app;
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
  refs.exportSettingsButton = byId("exportSettingsButton");
  refs.importSettingsInput = byId("importSettingsInput");
  refs.resetButton = byId("resetButton");
  refs.saveButton = byId("saveButton");
}

function bindEvents() {
  const { refs } = app;
  refs.searchForm.addEventListener("submit", handleSearchSubmit);
  refs.syncButton.addEventListener("click", () => {
    void syncHomer(app, { force: true });
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
      void refreshVisitHistory(app);
    }
  });
  window.addEventListener("focus", () => {
    void refreshVisitHistory(app);
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
  refs.exportSettingsButton.addEventListener("click", () => handleExportSettings(app));
  refs.importSettingsInput.addEventListener("change", (event) => {
    void handleImportSettings(app, event);
  });
  refs.saveButton.addEventListener("click", saveSettings);
  refs.resetButton.addEventListener("click", resetSettings);
}

async function loadState() {
  const syncState = await storageGet(STATE_KEY, SYNC_AREA);
  if (syncState) {
    return normalizeState(syncState, app.baseConfig);
  }

  const legacyLocalState = await storageGet(STATE_KEY, LOCAL_AREA);
  if (legacyLocalState) {
    await storageSet(STATE_KEY, legacyLocalState, SYNC_AREA);
    await storageRemove(STATE_KEY, LOCAL_AREA);
    return normalizeState(legacyLocalState, app.baseConfig);
  }

  return normalizeState(null, app.baseConfig);
}

async function persistState() {
  await storageSet(STATE_KEY, app.state, SYNC_AREA);
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
  return app.state.search.engines.find((item) => item.id === app.state.search.defaultEngineId) || app.state.search.engines[0];
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

async function saveSettings() {
  const result = validateSettingsDraft(app);
  if (!result.ok) {
    window.alert(result.error);
    return;
  }
  app.state = result.state;
  await persistState();
  closeSettings(app);
  renderAll(app);
  void refreshSearchEngineMetadata(app, { force: true });
  void refreshQuickLinkMetadata(app, { force: true });
  await syncHomer(app, { force: true });
}

async function resetSettings() {
  const confirmed = window.confirm(t("resetConfirm"));
  if (!confirmed) {
    return;
  }
  app.state = createDefaultState(app.baseConfig);
  app.homerCache = null;
  app.quickLinkMeta = {};
  app.searchEngineMeta = {};
  app.visitHistory = [];
  app.frequentVisits = [];
  app.settingsDraft = clone(app.state);
  app.syncMeta = null;
  await Promise.all([
    storageRemove(STATE_KEY, SYNC_AREA),
    storageRemove([CACHE_KEY, META_KEY, QUICK_LINK_META_KEY, SEARCH_ENGINE_META_KEY, HISTORY_KEY], LOCAL_AREA),
  ]);
  renderAll(app);
  renderSettings(app);
  void refreshSearchEngineMetadata(app, { force: true });
  await syncHomer(app, { force: true });
}
