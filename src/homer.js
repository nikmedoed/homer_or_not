import { LOCAL_IP_DETECTION_TIMEOUT_MS } from "./constants.js";
import { ICONS, normalizeSectionIcon } from "./icons.js";
import { t } from "./i18n.js";
import { isHttpUrl } from "./utils.js";

export { ICONS, normalizeSectionIcon };

export function normalizeHomerCache(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.services)) {
    return null;
  }
  const services = normalizeServiceGroups(raw.services, raw.sourceUrl || "");
  if (!services.length) {
    return null;
  }
  return {
    fetchedAt: Number.isFinite(raw.fetchedAt) ? raw.fetchedAt : Date.now(),
    sourceUrl: typeof raw.sourceUrl === "string" ? raw.sourceUrl : "",
    theme: typeof raw.theme === "string" ? raw.theme : "",
    services,
  };
}

export function normalizeSyncMeta(raw) {
  if (!raw || typeof raw !== "object" || !Number.isFinite(raw.failedAt)) {
    return null;
  }
  return {
    failedAt: raw.failedAt,
    sourceUrl: typeof raw.sourceUrl === "string" ? raw.sourceUrl : "",
    message: typeof raw.message === "string" ? raw.message : "",
  };
}

export function normalizeServiceGroups(raw, configUrl) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((group) => {
      const items = Array.isArray(group?.items)
        ? group.items.map((item) => normalizeServiceItem(item, configUrl)).filter(Boolean)
        : [];
      return {
        name: typeof group?.name === "string" && group.name.trim() ? group.name.trim() : t("miscellaneous"),
        icon: typeof group?.icon === "string" ? group.icon : "",
        logo: resolveAssetUrl(String(group?.logo ?? "").trim(), configUrl),
        className: normalizeClassName(group?.class ?? group?.className),
        items,
      };
    })
    .filter((group) => group.items.length);
}

export function normalizeServiceItem(raw, configUrl) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const name = String(raw.name ?? raw.title ?? "").trim();
  const url = resolveMaybeRelativeUrl(String(raw.url ?? "").trim(), configUrl);
  if (!name || !url || !isHttpUrl(url)) {
    return null;
  }
  const logoRaw = String(raw.logo ?? "").trim();
  const remoteLogo = resolveAssetUrl(logoRaw, configUrl);
  return {
    name,
    url,
    target: typeof raw.target === "string" ? raw.target : "_self",
    logo: remoteLogo,
    fallbackLogo: "",
    subtitle: normalizeText(raw.subtitle, 180),
    tag: normalizeText(raw.tag, 64),
    tagstyle: normalizeClassName(raw.tagstyle),
    background: normalizeCssColor(raw.background),
    className: normalizeClassName(raw.class ?? raw.className),
  };
}

export function parseHomerConfig(text) {
  const payload = text.trim();
  if (!payload) {
    throw new Error("Empty Homer config.");
  }
  if (payload.startsWith("{") || payload.startsWith("[")) {
    const parsed = JSON.parse(payload);
    return {
      services: Array.isArray(parsed) ? parsed : parsed.services,
      theme: Array.isArray(parsed) ? "" : parsed.theme,
    };
  }
  return parseHomerYaml(payload);
}

function parseHomerYaml(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  const services = [];
  let theme = "";
  let inServices = false;
  let currentGroup = null;
  let currentItem = null;

  const flushItem = () => {
    if (currentGroup && currentItem) {
      currentGroup.items.push(currentItem);
    }
    currentItem = null;
  };

  const flushGroup = () => {
    if (!currentGroup) {
      return;
    }
    flushItem();
    if (currentGroup.items.length) {
      services.push(currentGroup);
    }
    currentGroup = null;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!inServices) {
      const themeMatch = rawLine.match(/^theme:\s*(.*)$/);
      if (themeMatch) {
        theme = parseYamlScalar(themeMatch[1]);
      }
      if (trimmed === "services:") {
        inServices = true;
      }
      continue;
    }

    if (/^\S/.test(rawLine) && trimmed && !trimmed.startsWith("#")) {
      break;
    }
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const groupStart = rawLine.match(/^ {2}-\s+name:\s*(.*)$/);
    if (groupStart) {
      flushGroup();
      currentGroup = {
        name: parseYamlScalar(groupStart[1]),
        icon: "",
        items: [],
      };
      continue;
    }

    if (!currentGroup) {
      continue;
    }

    const itemStart = rawLine.match(/^ {6}-\s+name:\s*(.*)$/);
    if (itemStart) {
      flushItem();
      currentItem = {
        name: parseYamlScalar(itemStart[1]),
      };
      continue;
    }

    const groupField = rawLine.match(/^ {4}([A-Za-z0-9_]+):\s*(.*)$/);
    if (groupField && !currentItem) {
      if (groupField[1] !== "items") {
        currentGroup[groupField[1]] = parseYamlScalar(groupField[2]);
      }
      continue;
    }

    const itemField = rawLine.match(/^ {8,}([A-Za-z0-9_]+):\s*(.*)$/);
    if (itemField && currentItem) {
      currentItem[itemField[1]] = parseYamlScalar(itemField[2]);
    }
  }

  flushGroup();
  return { services, theme };
}

function parseYamlScalar(raw) {
  const value = stripYamlComment(raw).trim();
  if (!value) {
    return "";
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    return value
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\\\/g, "\\");
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

function stripYamlComment(raw) {
  let inSingle = false;
  let inDouble = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (char === "#" && !inSingle && !inDouble) {
      return raw.slice(0, index);
    }
  }
  return raw;
}

function normalizeText(value, maxLength) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function normalizeClassName(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => /^[A-Za-z0-9_-]+$/.test(part))
    .join(" ");
}

function normalizeCssColor(value) {
  if (typeof value !== "string") {
    return "";
  }
  const color = value.trim();
  return color && color.length <= 80 && !/[;{}]/.test(color) ? color : "";
}

export async function shouldSkipHomerSyncByNetwork(endpoints) {
  const homerIp = getPrivateIPv4FromUrl(endpoints.configUrl);
  if (!homerIp) {
    return false;
  }

  const localIps = await getLocalIPv4Candidates(LOCAL_IP_DETECTION_TIMEOUT_MS);
  if (!localIps.length) {
    return false;
  }

  return !localIps.some((ip) => isSameLikelyLan(ip, homerIp));
}

function getPrivateIPv4FromUrl(rawUrl) {
  try {
    const host = new URL(rawUrl).hostname;
    return isPrivateIPv4(host) ? host : "";
  } catch {
    return "";
  }
}

async function getLocalIPv4Candidates(timeoutMs) {
  if (typeof RTCPeerConnection !== "function") {
    return [];
  }

  const ips = new Set();
  const peer = new RTCPeerConnection({ iceServers: [] });
  const done = new Promise((resolve) => {
    const timer = window.setTimeout(resolve, timeoutMs);
    peer.addEventListener("icecandidate", (event) => {
      const candidate = event.candidate?.candidate || "";
      for (const match of candidate.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)) {
        const ip = match[0];
        if (isPrivateIPv4(ip)) {
          ips.add(ip);
        }
      }
      if (!event.candidate) {
        window.clearTimeout(timer);
        resolve();
      }
    });
  });

  try {
    peer.createDataChannel("lan-check");
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await done;
  } catch {
    // Browser can hide local addresses. In that case we fall back to the 5 minute fetch throttle.
  } finally {
    peer.close();
  }

  return Array.from(ips);
}

function isPrivateIPv4(ip) {
  const parts = parseIPv4(ip);
  if (!parts) {
    return false;
  }
  const [a, b] = parts;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function isSameLikelyLan(localIp, homerIp) {
  const local = parseIPv4(localIp);
  const homer = parseIPv4(homerIp);
  if (!local || !homer) {
    return false;
  }
  if (homer[0] === 10) {
    return local[0] === homer[0];
  }
  if (homer[0] === 172) {
    return local[0] === homer[0] && local[1] === homer[1];
  }
  return local[0] === homer[0] && local[1] === homer[1] && local[2] === homer[2];
}

function parseIPv4(ip) {
  const parts = String(ip)
    .split(".")
    .map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }
  return parts;
}

export function deriveHomerEndpoints(input) {
  if (!input || !input.trim()) {
    return null;
  }
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) {
    raw = `http://${raw}`;
  }
  try {
    const source = new URL(raw);
    const cleanPath = source.pathname.replace(/\/+$/, "");
    const isConfig = /\.(yml|yaml|json)$/i.test(cleanPath);
    if (isConfig) {
      const configUrl = source.href;
      const iframeUrl = /\/assets\/config\.(yml|yaml|json)$/i.test(cleanPath)
        ? `${source.origin}/`
        : new URL(".", configUrl).href;
      return { configUrl, iframeUrl };
    }
    if (/\/assets$/i.test(cleanPath)) {
      const assetsUrl = source.href.endsWith("/") ? source.href : `${source.href}/`;
      return {
        configUrl: new URL("config.yml", assetsUrl).href,
        iframeUrl: `${source.origin}/`,
      };
    }
    const rootUrl = source.href.endsWith("/") ? source.href : `${source.href}/`;
    return {
      configUrl: new URL("assets/config.yml", rootUrl).href,
      iframeUrl: rootUrl,
    };
  } catch {
    return null;
  }
}

export function resolveMaybeRelativeUrl(value, configUrl) {
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (!configUrl) {
    return value;
  }
  try {
    return new URL(value, configUrl).href;
  } catch {
    return value;
  }
}

export function resolveAssetUrl(value, configUrl) {
  if (!value) {
    return "";
  }
  if (!configUrl) {
    return value;
  }
  try {
    if (/^https?:\/\//i.test(value)) {
      return repairDuplicatedAssetsUrl(value);
    }
    if (/^\/\//i.test(value) || value.startsWith("data:")) {
      return value;
    }
    const base = new URL(configUrl);
    const cleaned = value.replace(/^\.?\//, "");
    if (/^assets\//i.test(cleaned)) {
      return `${base.origin}/${cleaned}`;
    }
    if (value.startsWith("/")) {
      return `${base.origin}${value}`;
    }
    return new URL(value, configUrl).href;
  } catch {
    return "";
  }
}

function repairDuplicatedAssetsUrl(value) {
  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/assets\/assets\//i, "/assets/");
    return url.href;
  } catch {
    return value;
  }
}
