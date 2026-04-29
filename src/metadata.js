import { LOCAL_AREA, QUICK_LINK_META_KEY, QUICK_LINK_META_TTL_MS, SEARCH_ENGINE_META_KEY } from "./constants.js";
import { getVisibleQuickLinks, getVisibleSearchEngines } from "./state.js";
import { blobToDataUrl, fetchWithTimeout, isHttpUrl, normalizeUrlKey, storageSet, toDomain, truncateTitle } from "./utils.js";

const FAVICON_SIZE = 64;

export function getQuickLinkMeta(app, url) {
  const key = normalizeUrlKey(url);
  return key ? app.quickLinkMeta[key] || null : null;
}

export function getSearchEngineMeta(app, engine) {
  const key = getSearchEngineMetaKey(engine);
  return key ? app.searchEngineMeta[key] || null : null;
}

export function getSearchEngineMetaKey(engine) {
  return normalizeUrlKey(getSearchEngineIconPageUrl(engine));
}

export function getSearchEngineIconPageUrl(engine) {
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

export function getQuickLinkTitle(link, meta) {
  const customTitle = typeof link.title === "string" ? link.title.trim() : "";
  if (customTitle) {
    return truncateTitle(customTitle);
  }
  if (meta?.title) {
    return truncateTitle(meta.title);
  }
  return truncateTitle(toDomain(link.url) || link.url);
}

export async function refreshQuickLinkMetadata(app, { force }) {
  const links = getVisibleQuickLinks(app).filter((link) => isHttpUrl(link.url));
  let changed = false;
  const seen = new Set();

  for (const link of links) {
    const key = normalizeUrlKey(link.url);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);

    const cached = app.quickLinkMeta[key];
    if (!force && isFreshIconMeta(cached)) {
      continue;
    }

    const meta = await fetchQuickLinkMetadata(link.url);
    app.quickLinkMeta[key] = {
      fetchedAt: Date.now(),
      title: meta.title || cached?.title || "",
      iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
      iconSize: meta.iconDataUrl ? FAVICON_SIZE : cached?.iconSize || 0,
    };
    changed = true;
    app.renderQuickLinks();
  }

  if (changed) {
    pruneQuickLinkMeta(app, seen);
    await storageSet(QUICK_LINK_META_KEY, app.quickLinkMeta, LOCAL_AREA);
  }
}

export async function refreshSearchEngineMetadata(app, { force }) {
  const engines = getVisibleSearchEngines(app);
  let changed = false;
  const seen = new Set();

  for (const engine of engines) {
    const key = getSearchEngineMetaKey(engine);
    const iconPageUrl = getSearchEngineIconPageUrl(engine);
    if (!key || !iconPageUrl || seen.has(key)) {
      continue;
    }
    seen.add(key);

    const cached = app.searchEngineMeta[key];
    if (!force && isFreshIconMeta(cached)) {
      continue;
    }

    const meta = await fetchQuickLinkMetadata(iconPageUrl);
    app.searchEngineMeta[key] = {
      fetchedAt: Date.now(),
      iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
      iconSize: meta.iconDataUrl ? FAVICON_SIZE : cached?.iconSize || 0,
    };
    changed = true;
    app.renderSearchButtons();
  }

  if (changed) {
    pruneSearchEngineMeta(app, seen);
    await storageSet(SEARCH_ENGINE_META_KEY, app.searchEngineMeta, LOCAL_AREA);
  }
}

async function fetchQuickLinkMetadata(url) {
  const pageUrl = url;
  const chromeFaviconUrl = getChromeFaviconUrl(pageUrl, FAVICON_SIZE);
  const iconDataUrl = chromeFaviconUrl ? await fetchIconDataUrl(chromeFaviconUrl) : "";

  return {
    title: "",
    iconDataUrl: iconDataUrl || (await fetchIconDataUrl(getDefaultFaviconUrl(pageUrl))),
  };
}

function isFreshIconMeta(meta) {
  return Boolean(
    meta?.fetchedAt &&
      Date.now() - meta.fetchedAt < QUICK_LINK_META_TTL_MS &&
      meta.iconDataUrl &&
      meta.iconSize >= FAVICON_SIZE,
  );
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

function pruneQuickLinkMeta(app, activeKeys) {
  for (const key of Object.keys(app.quickLinkMeta)) {
    if (!activeKeys.has(key)) {
      delete app.quickLinkMeta[key];
    }
  }
}

function pruneSearchEngineMeta(app, activeKeys) {
  for (const key of Object.keys(app.searchEngineMeta)) {
    if (!activeKeys.has(key)) {
      delete app.searchEngineMeta[key];
    }
  }
}
