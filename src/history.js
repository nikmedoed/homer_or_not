import { FREQUENT_HISTORY_KEY, FREQUENT_VISIT_LIMIT, HISTORY_KEY, LOCAL_AREA, VISIT_HISTORY_LIMIT } from "./constants.js";
import { FALLBACK_CONFIG } from "./default-config.js";
import { normalizeVisitHistory, normalizeVisitHistoryItem, normalizeVisitSettings } from "./state.js";
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
  void storageSet(HISTORY_KEY, app.visitHistory, LOCAL_AREA);
}

export async function loadVisitHistory(app) {
  if (!hasBrowserHistoryApi()) {
    return normalizeVisitHistory(await storageGet(HISTORY_KEY));
  }
  const settings = normalizeVisitSettings(app?.state?.visits, FALLBACK_CONFIG.visits);
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
        resolve(normalizeVisitHistory((results || []).filter((item) => isHttpUrl(item.url))));
      },
    );
  });
}

export async function refreshVisitHistory(app) {
  if (app.localPatch?.visits?.showRecent === false && app.localPatch?.visits?.showFrequent === false) {
    if (!app.visitHistory.length && !app.frequentVisits.length) {
      return;
    }
    app.visitHistory = [];
    app.frequentVisits = [];
    await Promise.all([storageSet(HISTORY_KEY, [], LOCAL_AREA), storageSet(FREQUENT_HISTORY_KEY, [], LOCAL_AREA)]);
    app.renderVisitPanels();
    return;
  }
  const [nextHistory, nextFrequent] = await Promise.all([
    app.localPatch?.visits?.showRecent !== false ? loadVisitHistory(app) : [],
    app.localPatch?.visits?.showFrequent !== false ? loadFrequentVisits(app) : [],
  ]);
  if (!nextHistory.length && !app.visitHistory.length && !nextFrequent.length && !app.frequentVisits.length) {
    return;
  }
  if (areVisitListsEqual(nextHistory, app.visitHistory) && areVisitListsEqual(nextFrequent, app.frequentVisits)) {
    return;
  }
  app.visitHistory = nextHistory;
  app.frequentVisits = nextFrequent;
  await Promise.all([
    storageSet(HISTORY_KEY, app.visitHistory, LOCAL_AREA),
    storageSet(FREQUENT_HISTORY_KEY, app.frequentVisits, LOCAL_AREA),
  ]);
  app.renderVisitPanels();
}

function areVisitListsEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item, index) => {
    const other = right[index];
    return (
      item.title === other?.title &&
      item.url === other?.url &&
      item.source === other?.source &&
      item.visitCount === other?.visitCount &&
      item.visitedAt === other?.visitedAt
    );
  });
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
        resolve(filterFrequentVisits(app, normalizeVisitHistory(frequent, FREQUENT_VISIT_LIMIT)).slice(0, FREQUENT_VISIT_LIMIT));
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
  const homerKey = normalizeUrlKey(app.state?.homer?.url);
  if (homerKey) {
    keys.add(homerKey);
  }
  return keys;
}
