import { LOCAL_AREA, QUICK_LINK_META_KEY, QUICK_LINK_META_TTL_MS, SEARCH_ENGINE_META_KEY } from "./constants.js";
import { getVisibleQuickLinks, getVisibleSearchEngines } from "./state.js";
import { blobToDataUrl, fetchWithTimeout, isHttpUrl, normalizeUrlKey, storageSet, toDomain, truncateTitle } from "./utils.js";

const FAVICON_SIZE = 128;
const MIN_FRESH_ICON_SIZE = 96;
const MAX_ICON_BYTES = 512 * 1024;

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
      iconSize: meta.iconDataUrl ? meta.iconSize : cached?.iconSize || 0,
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
      iconSize: meta.iconDataUrl ? meta.iconSize : cached?.iconSize || 0,
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
  const pageMeta = await fetchPageMetadata(pageUrl);
  const candidates = [
    ...pageMeta.iconCandidates,
    createIconCandidate(getChromeFaviconUrl(pageUrl, FAVICON_SIZE), 1, FAVICON_SIZE),
    createIconCandidate(getDefaultFaviconUrl(pageUrl), 0, 16),
  ]
    .filter(Boolean)
    .sort(compareIconCandidates);

  for (const candidate of uniqueIconCandidates(candidates)) {
    const icon = await fetchIconDataUrl(candidate.url, candidate.size);
    if (icon.iconDataUrl) {
      return {
        title: pageMeta.title,
        iconDataUrl: icon.iconDataUrl,
        iconSize: icon.iconSize,
      };
    }
  }
  return {
    title: pageMeta.title,
    iconDataUrl: "",
    iconSize: 0,
  };
}

function isFreshIconMeta(meta) {
  return Boolean(
    meta?.fetchedAt &&
      Date.now() - meta.fetchedAt < QUICK_LINK_META_TTL_MS &&
      meta.iconDataUrl &&
      meta.iconSize >= MIN_FRESH_ICON_SIZE,
  );
}

async function fetchPageMetadata(pageUrl) {
  try {
    const response = await fetchWithTimeout(pageUrl, 6500, { cache: "force-cache" });
    if (!response.ok) {
      return { title: "", iconCandidates: [] };
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { title: "", iconCandidates: [] };
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = normalizeTitle(doc.querySelector("title")?.textContent);
    const candidates = collectHtmlIconCandidates(doc, pageUrl);
    const manifestCandidates = await collectManifestIconCandidates(doc, pageUrl);
    return { title, iconCandidates: [...manifestCandidates, ...candidates] };
  } catch {
    return { title: "", iconCandidates: [] };
  }
}

function collectHtmlIconCandidates(doc, pageUrl) {
  const candidates = [];
  doc.querySelectorAll("link[rel][href]").forEach((link) => {
    const rel = String(link.getAttribute("rel") || "").toLowerCase();
    if (!/\b(icon|apple-touch-icon|mask-icon)\b/.test(rel)) {
      return;
    }
    const href = resolveUrl(link.getAttribute("href"), pageUrl);
    if (!href) {
      return;
    }
    const size = parseSizes(link.getAttribute("sizes"));
    let weight = 2;
    if (rel.includes("apple-touch-icon")) {
      weight = 5;
    } else if (rel.includes("mask-icon")) {
      weight = 3;
    } else if (size >= 96) {
      weight = 4;
    }
    candidates.push(createIconCandidate(href, weight, size));
  });
  return candidates.filter(Boolean);
}

async function collectManifestIconCandidates(doc, pageUrl) {
  const manifestUrl = resolveUrl(doc.querySelector('link[rel~="manifest"][href]')?.getAttribute("href"), pageUrl);
  if (!manifestUrl) {
    return [];
  }
  try {
    const response = await fetchWithTimeout(manifestUrl, 6500, { cache: "force-cache" });
    if (!response.ok) {
      return [];
    }
    const manifest = await response.json();
    if (!Array.isArray(manifest.icons)) {
      return [];
    }
    return manifest.icons
      .map((icon) => {
        const url = resolveUrl(icon?.src, manifestUrl);
        const size = parseSizes(icon?.sizes);
        const purpose = String(icon?.purpose || "").toLowerCase();
        const type = String(icon?.type || "").toLowerCase();
        let weight = purpose.includes("maskable") ? 4 : 6;
        if (type.includes("svg")) {
          weight += 1;
        }
        return createIconCandidate(url, weight, size);
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchIconDataUrl(iconUrl, expectedSize = 0) {
  try {
    const response = await fetchWithTimeout(iconUrl, 6500, { cache: "force-cache" });
    if (!response.ok) {
      return { iconDataUrl: "", iconSize: 0 };
    }
    const blob = normalizeIconBlob(await response.blob(), iconUrl);
    if (!isSupportedIconBlob(blob)) {
      return { iconDataUrl: "", iconSize: 0 };
    }
    const iconDataUrl = await blobToDataUrl(blob);
    return {
      iconDataUrl,
      iconSize: blob.type.includes("svg") ? Math.max(expectedSize, FAVICON_SIZE) : await getImageSize(iconDataUrl),
    };
  } catch {
    return { iconDataUrl: "", iconSize: 0 };
  }
}

function normalizeIconBlob(blob, iconUrl) {
  const isIco = /\.ico(?:[?#].*)?$/i.test(iconUrl);
  if (!blob || !isIco || blob.type.startsWith("image/")) {
    return blob;
  }
  return new Blob([blob], { type: "image/x-icon" });
}

function isSupportedIconBlob(blob) {
  if (!blob || blob.size > MAX_ICON_BYTES) {
    return false;
  }
  return blob.type.startsWith("image/") || blob.type === "application/octet-stream";
}

function getImageSize(dataUrl) {
  if (!dataUrl) {
    return 0;
  }
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(Math.max(image.naturalWidth || 0, image.naturalHeight || 0));
    });
    image.addEventListener("error", () => {
      resolve(0);
    });
    image.src = dataUrl;
  });
}

function createIconCandidate(url, weight, size) {
  if (!url || !isHttpUrl(url)) {
    return null;
  }
  return { url, weight, size: Number.isFinite(size) ? size : 0 };
}

function compareIconCandidates(a, b) {
  const weightDiff = b.weight - a.weight;
  if (weightDiff) {
    return weightDiff;
  }
  return b.size - a.size;
}

function uniqueIconCandidates(candidates) {
  const seen = new Set();
  const out = [];
  for (const candidate of candidates) {
    const key = normalizeUrlKey(candidate.url) || candidate.url;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(candidate);
  }
  return out;
}

function parseSizes(value) {
  const matches = String(value || "").match(/\d+x\d+/gi);
  if (!matches) {
    return 0;
  }
  return Math.max(
    ...matches.map((item) => {
      const [width, height] = item.split("x").map((part) => Number.parseInt(part, 10));
      return Math.max(width || 0, height || 0);
    }),
  );
}

function resolveUrl(value, baseUrl) {
  try {
    const raw = String(value || "").trim();
    return raw ? new URL(raw, baseUrl).href : "";
  } catch {
    return "";
  }
}

function normalizeTitle(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
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
