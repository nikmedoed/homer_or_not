import { HISTORY_KEY, LOCAL_AREA, VISIT_HISTORY_LIMIT } from "./constants.js";
import { FALLBACK_CONFIG } from "./default-config.js";
import {
  getVisibleQuickLinks,
  normalizeVisitHistory,
  normalizeVisitHistoryItem,
  normalizeVisitSettings,
} from "./state.js";
import { isHttpUrl, normalizeUrlKey, storageGet, storageSet } from "./utils.js";

export async function addVisitHistoryItem(app, item) {
  const normalized = normalizeVisitHistoryItem(item);
  if (!normalized) {
    return;
  }
  normalized.visitedAt = Date.now();
  const normalizedKey = normalizeUrlKey(normalized.url);
  app.visitHistory = [
    normalized,
    ...app.visitHistory.filter((existing) => normalizeUrlKey(existing.url) !== normalizedKey),
  ].slice(0, VISIT_HISTORY_LIMIT);
  app.renderVisitPanels();
  if (hasBrowserHistoryApi()) {
    return;
  }
  await storageSet(HISTORY_KEY, app.visitHistory, LOCAL_AREA);
}

export async function loadVisitHistory() {
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

export async function refreshVisitHistory(app) {
  if (app.localPatch?.visits?.showRecent === false && app.localPatch?.visits?.showFrequent === false) {
    app.visitHistory = [];
    app.frequentVisits = [];
    app.renderVisitPanels();
    return;
  }
  const [nextHistory, nextFrequent] = await Promise.all([
    app.localPatch?.visits?.showRecent !== false ? loadVisitHistory() : [],
    app.localPatch?.visits?.showFrequent !== false ? loadFrequentVisits(app) : [],
  ]);
  if (!nextHistory.length && !app.visitHistory.length && !nextFrequent.length && !app.frequentVisits.length) {
    return;
  }
  app.visitHistory = nextHistory;
  app.frequentVisits = nextFrequent;
  app.renderVisitPanels();
}

export function hasBrowserHistoryApi() {
  return typeof globalThis.chrome?.history?.search === "function";
}

export async function loadFrequentVisits(app) {
  if (!hasBrowserHistoryApi()) {
    return [];
  }
  const settings = normalizeVisitSettings(app.state.visits, FALLBACK_CONFIG.visits);
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
        resolve(filterFrequentVisits(app, normalizeVisitHistory(frequent)).slice(0, VISIT_HISTORY_LIMIT));
      },
    );
  });
}

export function filterFrequentVisits(app, items) {
  const excludedKeys = getFrequentVisitExcludedKeys(app);
  if (!excludedKeys.size) {
    return items;
  }
  return items.filter((item) => {
    const key = normalizeUrlKey(item.url);
    return key && !excludedKeys.has(key);
  });
}

function getFrequentVisitExcludedKeys(app) {
  const keys = new Set();
  for (const link of getVisibleQuickLinks(app)) {
    const key = normalizeUrlKey(link.url);
    if (key) {
      keys.add(key);
    }
  }
  const homerKey = normalizeUrlKey(app.state?.homer?.url);
  if (homerKey) {
    keys.add(homerKey);
  }
  return keys;
}
