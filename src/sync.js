import { CACHE_KEY, HOMER_FETCH_TIMEOUT_MS, HOMER_SYNC_INTERVAL_MINUTES, LOCAL_AREA, META_KEY } from "./constants.js";
import {
  deriveHomerEndpoints,
  normalizeServiceGroups,
  parseHomerConfig,
  shouldSkipHomerSyncByNetwork,
} from "./homer.js";
import { t } from "./i18n.js";
import { getEmptyServicesMessage, getVisibleServices, renderServices, setStatus } from "./render.js";
import {
  fetchTextWithTimeout,
  formatDateTime,
  isCacheFresh,
  isFailureFresh,
  storageRemove,
  storageSet,
  withCacheBuster,
} from "./utils.js";

export async function syncHomer(app, { force }) {
  if (app.localPatch?.homer?.disabled) {
    setStatus(app, "local", "off", t("homerDisabled"));
    renderServices(app, [], "");
    return;
  }

  if (!app.state.homer.url) {
    setStatus(app, "local", "no url", t("homerUrlMissing"));
    renderServices(app, [], t("homerUrlMissing"));
    return;
  }

  const endpoints = deriveHomerEndpoints(app.state.homer.url);
  if (!endpoints) {
    setStatus(app, "error", "bad url", t("homerUrlInvalid"));
    renderServices(app, getVisibleServices(app), getEmptyServicesMessage(app));
    return;
  }

  if (!force && isCacheFresh(app.homerCache, HOMER_SYNC_INTERVAL_MINUTES)) {
    setStatus(app, "cache", "cache", t("homerCache", formatDateTime(app.homerCache.fetchedAt)));
    renderServices(app, getVisibleServices(app), getEmptyServicesMessage(app));
    return;
  }

  if (!force && isFailureFresh(app.syncMeta, HOMER_SYNC_INTERVAL_MINUTES, endpoints.configUrl)) {
    if (app.homerCache?.services?.length) {
      renderServices(app, app.homerCache.services);
      setStatus(app, "cache", "offline", t("homerRecentFailureCache", formatDateTime(app.homerCache.fetchedAt)));
      return;
    }
    renderServices(app, [], t("homerNeverFetched"));
    setStatus(app, "local", "no homer", t("homerRecentFailureNoCache"));
    return;
  }

  if (!force && (await shouldSkipHomerSyncByNetwork(endpoints))) {
    renderServices(app, getVisibleServices(app), getEmptyServicesMessage(app));
    setStatus(app, "cache", app.homerCache?.services?.length ? "away" : "no homer", t("homerAway"));
    return;
  }

  setStatus(app, "sync", "sync", t("homerSyncing"));
  try {
    const configText = await fetchTextWithTimeout(withCacheBuster(endpoints.configUrl), HOMER_FETCH_TIMEOUT_MS);
    const parsed = parseHomerConfig(configText, endpoints.configUrl);
    const services = normalizeServiceGroups(parsed.services, endpoints.configUrl);
    if (!services.length) {
      throw new Error("Homer config has no services.");
    }
    app.homerCache = {
      fetchedAt: Date.now(),
      sourceUrl: endpoints.configUrl,
      theme: typeof parsed.theme === "string" ? parsed.theme : "",
      services,
    };
    await storageSet(CACHE_KEY, app.homerCache, LOCAL_AREA);
    app.syncMeta = null;
    await storageRemove(META_KEY, LOCAL_AREA);
    app.applyTheme();
    renderServices(app, services);
    setStatus(app, "live", "live", t("homerUpdated", formatDateTime(app.homerCache.fetchedAt)));
  } catch (error) {
    app.syncMeta = {
      failedAt: Date.now(),
      sourceUrl: endpoints.configUrl,
      message: error?.message || String(error),
    };
    await storageSet(META_KEY, app.syncMeta, LOCAL_AREA);
    if (app.homerCache?.services?.length) {
      renderServices(app, app.homerCache.services);
      setStatus(app, "cache", "offline", t("homerOfflineCache", formatDateTime(app.homerCache.fetchedAt)));
      return;
    }
    renderServices(app, [], t("homerNeverFetched"));
    setStatus(app, "local", "no homer", t("homerOfflineNoCache"));
  }
}
