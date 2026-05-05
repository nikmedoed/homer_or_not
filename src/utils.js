import { LOCAL_AREA } from "./constants.js";
import { LOCALE } from "./i18n.js";

const TIME_FORMATTER = new Intl.DateTimeFormat(LOCALE === "ru" ? "ru-RU" : "en-US", {
  hour: "2-digit",
  minute: "2-digit",
});
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(LOCALE === "ru" ? "ru-RU" : "en-US", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function byId(id) {
  const node = document.getElementById(id);
  if (!node) {
    throw new Error(`Missing #${id}`);
  }
  return node;
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeInitial(text) {
  const value = String(text || "").trim();
  return value ? value.slice(0, 1).toUpperCase() : "?";
}

export function toDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

export function normalizeUrlKey(raw) {
  try {
    const url = new URL(raw);
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.href;
  } catch {
    return "";
  }
}

export function toPublicUrl(raw) {
  const value = String(raw || "").trim();
  try {
    const url = new URL(value);
    if (url.hostname === "api.github.com") {
      const match = url.pathname.match(/^\/repos\/([^/]+)\/([^/]+)\/?$/i);
      if (match) {
        return `https://github.com/${match[1]}/${match[2]}`;
      }
    }
  } catch {
    // Preserve the original value; callers still validate it.
  }
  return value;
}

export function truncateTitle(title) {
  const value = String(title || "").replace(/\s+/g, " ").trim();
  return value.length > 22 ? `${value.slice(0, 21).trim()}…` : value;
}

export function truncateHistoryTitle(title) {
  const value = String(title || "").replace(/\s+/g, " ").trim();
  return value.length > 64 ? `${value.slice(0, 63).trim()}…` : value;
}

export function formatHistoryMeta(item) {
  const domain = toDomain(item.url);
  const time = formatTime(item.visitedAt);
  if (domain && time) {
    return `${domain} · ${time}`;
  }
  return domain || time || "";
}

export function formatFrequentMeta(item) {
  return toDomain(item.url);
}

export function formatTime(timestamp) {
  try {
    return TIME_FORMATTER.format(new Date(timestamp));
  } catch {
    return "";
  }
}

export function formatDateTime(timestamp) {
  try {
    return DATE_TIME_FORMATTER.format(new Date(timestamp));
  } catch {
    return "";
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });
    reader.addEventListener("error", () => {
      resolve("");
    });
    reader.readAsDataURL(blob);
  });
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

export function isCacheFresh(cache, minutes) {
  if (!cache?.fetchedAt) {
    return false;
  }
  return Date.now() - cache.fetchedAt < minutes * 60 * 1000;
}

export function isFailureFresh(meta, minutes, sourceUrl) {
  if (!meta?.failedAt) {
    return false;
  }
  if (meta.sourceUrl && sourceUrl && meta.sourceUrl !== sourceUrl) {
    return false;
  }
  return Date.now() - meta.failedAt < minutes * 60 * 1000;
}

export function withCacheBuster(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("_", String(Date.now()));
    return parsed.href;
  } catch {
    return url;
  }
}

export async function fetchTextWithTimeout(url, timeoutMs) {
  const response = await fetchWithTimeout(url, timeoutMs, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.text();
}

export async function fetchJsonWithTimeout(url, timeoutMs) {
  const response = await fetchWithTimeout(url, timeoutMs, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
}

export async function fetchWithTimeout(url, timeoutMs, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function storageGet(key, area = LOCAL_AREA) {
  const values = await storageGetMany([key], area);
  return values[key] ?? null;
}

export async function storageGetMany(keys, area = LOCAL_AREA) {
  const list = Array.isArray(keys) ? keys : [keys];
  const chromeApi = globalThis.chrome;
  const storageArea = chromeApi?.storage?.[area] || chromeApi?.storage?.local;
  if (storageArea) {
    return await new Promise((resolve) => {
      storageArea.get(list, (result) => {
        if (chromeApi.runtime.lastError) {
          resolve({});
          return;
        }
        resolve(result || {});
      });
    });
  }
  const out = {};
  for (const key of list) {
    out[key] = null;
  }
  for (const key of list) {
    try {
      const raw = globalThis.localStorage?.getItem(`${area}:${key}`);
      out[key] = raw ? JSON.parse(raw) : null;
    } catch {
      out[key] = null;
    }
  }
  return out;
}

export async function storageSet(key, value, area = LOCAL_AREA) {
  const chromeApi = globalThis.chrome;
  const storageArea = chromeApi?.storage?.[area] || chromeApi?.storage?.local;
  if (storageArea) {
    await new Promise((resolve) => {
      storageArea.set({ [key]: value }, resolve);
    });
    return;
  }
  try {
    globalThis.localStorage?.setItem(`${area}:${key}`, JSON.stringify(value));
  } catch {
    // ignored in file/debug mode
  }
}

export async function storageRemove(keys, area = LOCAL_AREA) {
  const list = Array.isArray(keys) ? keys : [keys];
  const chromeApi = globalThis.chrome;
  const storageArea = chromeApi?.storage?.[area] || chromeApi?.storage?.local;
  if (storageArea) {
    await new Promise((resolve) => {
      storageArea.remove(list, resolve);
    });
    return;
  }
  for (const key of list) {
    try {
      globalThis.localStorage?.removeItem(`${area}:${key}`);
    } catch {
      // ignored in file/debug mode
    }
  }
}
