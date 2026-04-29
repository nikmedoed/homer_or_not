import { VISIT_HISTORY_LIMIT } from "./constants.js";
import { FALLBACK_CONFIG } from "./default-config.js";
import { normalizeServiceGroups } from "./homer.js";
import { clampInt, clone, isHttpUrl, makeId, normalizeUrlKey, toDomain, truncateHistoryTitle } from "./utils.js";

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
    services: normalizeServiceGroups(source.services, ""),
  };
}

export function createDefaultState(baseConfig) {
  return {
    search: clone(baseConfig.search),
    quickLinks: clone(baseConfig.quickLinks),
    homer: clone(baseConfig.homer),
    visits: clone(baseConfig.visits),
  };
}

export function createDefaultLocalPatch() {
  return {
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
    visits: {
      showFrequent: true,
      showRecent: true,
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
    visits: {
      showFrequent: source.visits?.showFrequent !== false,
      showRecent: source.visits?.showRecent !== false,
    },
  };
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
