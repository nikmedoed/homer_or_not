import { VISIT_HISTORY_LIMIT } from "./constants.js";
import { FALLBACK_CONFIG } from "./default-config.js";
import { normalizeServiceGroups } from "./homer.js";
import { clampInt, clone, isHttpUrl, makeId, normalizeUrlKey, toDomain, truncateHistoryTitle } from "./utils.js";

const LEGACY_DEFAULT_NEWS_SOURCE_IDS = ["hacker-news", "reddit-dev", "habr", "vc"];
const NEWS_SOURCE_MAX_ITEMS = 60;

export function normalizeBootConfig(raw) {
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
    weather: normalizeWeatherSettings(source.weather, fallback.weather),
    githubTrending: normalizeGitHubTrendingSettings(source.githubTrending, fallback.githubTrending),
    news: normalizeNewsSettings(source.news, fallback.news),
    services: normalizeServiceGroups(source.services, ""),
  };
}

export function createDefaultState(baseConfig) {
  return {
    search: clone(baseConfig.search),
    quickLinks: clone(baseConfig.quickLinks),
    homer: clone(baseConfig.homer),
    visits: clone(baseConfig.visits),
    weather: clone(baseConfig.weather),
    githubTrending: clone(baseConfig.githubTrending),
    news: clone(baseConfig.news),
  };
}

export function createDefaultLocalPatch() {
  return {
    viewMode: "full",
    search: {
      defaultEngineId: "",
      disabledEngineIds: [],
    },
    quickLinks: {
      disabledLinkIds: [],
    },
    homer: {
      disabled: false,
    },
    weather: {
      topDisabled: false,
      cardDisabled: false,
      locationName: "",
    },
    githubTrending: {
      disabled: false,
    },
    news: {
      disabledFeedIds: [],
    },
    visits: {
      showFrequent: true,
      showRecent: true,
    },
    widgets: {
      order: getDefaultWidgetOrder(FALLBACK_CONFIG),
    },
  };
}

export function normalizeState(raw, baseConfig) {
  const base = createDefaultState(baseConfig);
  if (!raw || typeof raw !== "object") {
    return base;
  }
  return {
    search: normalizeSearch(raw.search, base.search),
    quickLinks: normalizeQuickLinks(raw.quickLinks, base.quickLinks),
    homer: normalizeHomerSettings(raw.homer, base.homer),
    visits: normalizeVisitSettings(raw.visits, base.visits),
    weather: normalizeWeatherSettings(raw.weather, base.weather),
    githubTrending: normalizeGitHubTrendingSettings(raw.githubTrending, base.githubTrending),
    news: normalizeNewsSettings(raw.news, base.news),
  };
}

export function normalizeSyncedState(raw, baseConfig) {
  const state = normalizeState(raw, baseConfig);
  state.search.defaultEngineId = "";
  return state;
}

export function createSyncedState(state) {
  return {
    search: {
      engines: clone(state.search.engines),
    },
    quickLinks: clone(state.quickLinks),
    homer: clone(state.homer),
    visits: clone(state.visits),
    weather: clone(state.weather),
    githubTrending: clone(state.githubTrending),
    news: clone(state.news),
  };
}

export function normalizeLocalPatch(raw, state) {
  const source = raw && typeof raw === "object" ? raw : {};
  const engineIds = new Set(state.search.engines.map((engine) => engine.id));
  const quickLinkIds = new Set(state.quickLinks.map((link) => link.id));
  const disabledEngineIds = normalizeIdList(source.search?.disabledEngineIds, engineIds);
  const disabledLinkIds = normalizeIdList(source.quickLinks?.disabledLinkIds, quickLinkIds);
  const visibleEngineIds = state.search.engines
    .map((engine) => engine.id)
    .filter((id) => !disabledEngineIds.includes(id));
  const defaultEngineId =
    typeof source.search?.defaultEngineId === "string" && visibleEngineIds.includes(source.search.defaultEngineId)
      ? source.search.defaultEngineId
      : visibleEngineIds[0] || "";

  return {
    viewMode: normalizeViewMode(source.viewMode),
    search: {
      defaultEngineId,
      disabledEngineIds,
    },
    quickLinks: {
      disabledLinkIds,
    },
    homer: {
      disabled: source.homer?.disabled === true,
    },
    weather: {
      topDisabled: source.weather?.disabled === true || source.weather?.topDisabled === true,
      cardDisabled: source.weather?.disabled === true || source.weather?.cardDisabled === true,
      locationName: normalizeWeatherLocationName(source.weather?.locationName),
    },
    githubTrending: {
      disabled: source.githubTrending?.disabled === true,
    },
    news: {
      disabledFeedIds:
        source.news?.disabled === true
          ? state.news.sources.map((feed) => feed.id)
          : normalizeIdList(
              source.news?.disabledFeedIds,
              new Set(state.news.sources.map((feed) => feed.id)),
            ),
    },
    visits: {
      showFrequent: source.visits?.showFrequent !== false,
      showRecent: source.visits?.showRecent !== false,
    },
    widgets: {
      order: normalizeWidgetOrder(source.widgets?.order, state),
    },
  };
}

export function normalizeViewMode(value) {
  return ["full", "base", "zen"].includes(value) ? value : "full";
}

export function normalizeWidgetOrder(raw, state = FALLBACK_CONFIG) {
  const allowed = getDefaultWidgetOrder(state);
  const source = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const out = [];
  for (const value of source) {
    if (allowed.includes(value) && !seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  for (const [allowedIndex, id] of allowed.entries()) {
    if (!seen.has(id)) {
      const insertAt = out.findIndex((existing) => allowed.indexOf(existing) > allowedIndex);
      if (insertAt === -1) {
        out.push(id);
      } else {
        out.splice(insertAt, 0, id);
      }
      seen.add(id);
    }
  }
  return out;
}

export function getDefaultWidgetOrder(state = FALLBACK_CONFIG) {
  const newsIds = (state.news?.sources || []).map((source) => getNewsWidgetId(source.id));
  return ["services", "githubTrending", ...newsIds];
}

export function getNewsWidgetId(sourceId) {
  return `news:${sourceId}`;
}

export function applyLocalPatch(state, localPatch) {
  const next = normalizeState(state, state);
  const patch = normalizeLocalPatch(localPatch, next);
  next.search.defaultEngineId = patch.search.defaultEngineId || getVisibleSearchEngines({ state: next, localPatch: patch })[0]?.id || "";
  return next;
}

export function getVisibleSearchEngines(app) {
  const disabled = new Set(app.localPatch?.search?.disabledEngineIds || []);
  return app.state.search.engines.filter((engine) => !disabled.has(engine.id));
}

export function getVisibleQuickLinks(app) {
  const disabled = new Set(app.localPatch?.quickLinks?.disabledLinkIds || []);
  return app.state.quickLinks.filter((link) => !disabled.has(link.id));
}

function normalizeIdList(raw, allowedIds) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const value of raw) {
    const id = typeof value === "string" ? value.trim() : "";
    if (!id || !allowedIds.has(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push(id);
  }
  return out;
}

function normalizeWeatherLocationName(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

export function normalizeSearch(raw, fallback) {
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

export function normalizeSearchEngine(raw) {
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

export function normalizeQuickLinks(raw, fallback) {
  const source = Array.isArray(raw) ? raw : fallback || [];
  return source
    .map((link) => ({
      id: typeof link?.id === "string" && link.id ? link.id : makeId("quick"),
      title: typeof link?.title === "string" ? link.title.trim() : "",
      url: typeof link?.url === "string" ? link.url.trim() : "",
    }))
    .filter((link) => link.url);
}

export function normalizeHomerSettings(raw, fallback) {
  const base = fallback || FALLBACK_CONFIG.homer;
  return {
    url: typeof raw?.url === "string" ? raw.url : base.url || "",
  };
}

export function normalizeVisitSettings(raw, fallback) {
  const base = fallback || FALLBACK_CONFIG.visits;
  return {
    frequentHistoryPool: clampInt(raw?.frequentHistoryPool, 50, 50000, base.frequentHistoryPool),
    frequentMinVisits: clampInt(raw?.frequentMinVisits, 2, 1000, base.frequentMinVisits),
  };
}

export function normalizeWeatherSettings(raw, fallback) {
  const base = fallback || FALLBACK_CONFIG.weather;
  return {
    topWidgetPlacement: normalizeTopWeatherPlacement(raw?.topWidgetPlacement, base.topWidgetPlacement),
  };
}

export function normalizeTopWeatherPlacement(value, fallback = "actions") {
  return ["actions", "center"].includes(value) ? value : fallback;
}

export function normalizeGitHubTrendingSettings(raw, fallback) {
  const base = fallback || FALLBACK_CONFIG.githubTrending;
  return {
    excludedTerms: normalizeGitHubTrendingExcludedTerms(raw?.excludedTerms, base.excludedTerms),
    syncIntervalMinutes: clampInt(raw?.syncIntervalMinutes, 15, 1440, base.syncIntervalMinutes),
  };
}

export function normalizeNewsSettings(raw, fallback) {
  const base = fallback || FALLBACK_CONFIG.news;
  const fallbackSources = Array.isArray(base.sources) ? base.sources : [];
  const rawSources = Array.isArray(raw?.sources) ? raw.sources : fallbackSources;
  const sourceVersion = Number.isFinite(raw?.defaultSourcesVersion) ? raw.defaultSourcesVersion : 0;
  const targetVersion = Number.isFinite(base.defaultSourcesVersion) ? base.defaultSourcesVersion : sourceVersion;
  let sources = rawSources.map((source) => normalizeNewsSource(source, fallbackSources)).filter(Boolean);
  if (Array.isArray(raw?.sources)) {
    sources = upgradeDefaultNewsSources(sources, fallbackSources, sourceVersion, targetVersion);
  }
  if (!sources.length) {
    sources.push(...fallbackSources.map((source) => normalizeNewsSource(source, fallbackSources)).filter(Boolean));
  }
  return {
    defaultSourcesVersion: targetVersion,
    sources,
  };
}

function upgradeDefaultNewsSources(sources, fallbackSources, sourceVersion, targetVersion) {
  if (sourceVersion >= targetVersion) {
    return sources;
  }
  const existingIds = new Set(sources.map((source) => source.id));
  const hasLegacyDefaults = LEGACY_DEFAULT_NEWS_SOURCE_IDS.every((id) => existingIds.has(id));
  if (!hasLegacyDefaults) {
    return sources;
  }
  const next = sources.map((source) => upgradeDefaultNewsSource(source, fallbackSources));
  for (const source of fallbackSources) {
    if (existingIds.has(source.id)) {
      continue;
    }
    const normalized = normalizeNewsSource(source, fallbackSources);
    if (normalized) {
      next.push(normalized);
      existingIds.add(normalized.id);
    }
  }
  return next;
}

function upgradeDefaultNewsSource(source, fallbackSources) {
  const fallback = fallbackSources.find((item) => item.id === source.id);
  if (!fallback) {
    return source;
  }
  return {
    ...source,
    maxItems:
      Number.isFinite(fallback.maxItems) && fallback.maxItems > source.maxItems ? fallback.maxItems : source.maxItems,
  };
}

export function normalizeNewsSource(raw, fallbackSources = []) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : makeId("news");
  const fallback = fallbackSources.find((source) => source.id === id) || {};
  const title = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : fallback.title || "";
  const type = ["hackerNews", "reddit", "rss", "shirMan"].includes(raw.type) ? raw.type : fallback.type || "";
  const url = typeof raw.url === "string" && raw.url.trim() ? raw.url.trim() : fallback.url || "";
  if (!title || !type || !isHttpUrl(url)) {
    return null;
  }
  const source = {
    id,
    title,
    type,
    url,
    enabled: raw.enabled !== false,
    syncIntervalMinutes: clampInt(raw.syncIntervalMinutes, 15, 1440, fallback.syncIntervalMinutes || 45),
    maxItems: clampInt(raw.maxItems, 1, NEWS_SOURCE_MAX_ITEMS, fallback.maxItems || 12),
  };
  const sourceKey =
    typeof raw.sourceKey === "string" && raw.sourceKey.trim()
      ? raw.sourceKey.trim()
      : typeof fallback.sourceKey === "string"
        ? fallback.sourceKey
        : "";
  if (sourceKey) {
    source.sourceKey = sourceKey;
  }
  return source;
}

export function normalizeGitHubTrendingExcludedTerms(raw, fallback = []) {
  const source = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[\s,;]+/) : fallback;
  const seen = new Set();
  const out = [];
  for (const value of source || []) {
    const term = String(value || "")
      .trim()
      .replace(/^-+/, "")
      .toLowerCase();
    if (!term || term.length > 40 || !/^[a-z0-9_.#+-]+$/i.test(term) || seen.has(term)) {
      continue;
    }
    seen.add(term);
    out.push(term);
    if (out.length >= 20) {
      break;
    }
  }
  return out;
}

export function normalizeQuickLinkMeta(raw) {
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
      iconSize: Number.isFinite(value.iconSize) ? value.iconSize : 0,
    };
  }
  return out;
}

export function normalizeSearchEngineMeta(raw) {
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
      iconSize: Number.isFinite(value.iconSize) ? value.iconSize : 0,
    };
  }
  return out;
}

export function normalizeVisitHistory(raw) {
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

export function normalizeVisitHistoryItem(raw) {
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
