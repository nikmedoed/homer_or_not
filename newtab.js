(() => {
  // src/constants.js
  var STATE_KEY = "homerOrNot.state.v2";
  var LOCAL_PATCH_KEY = "homerOrNot.localPatch.v1";
  var CACHE_KEY = "homerOrNot.homerCache.v2";
  var META_KEY = "homerOrNot.homerMeta.v2";
  var QUICK_LINK_META_KEY = "homerOrNot.quickLinkMeta.v1";
  var SEARCH_ENGINE_META_KEY = "homerOrNot.searchEngineMeta.v1";
  var HISTORY_KEY = "homerOrNot.visitHistory.v1";
  var SYNC_AREA = "sync";
  var LOCAL_AREA = "local";
  var QUICK_LINK_META_TTL_MS = 1e3 * 60 * 60 * 24 * 7;
  var VISIT_HISTORY_LIMIT = 50;
  var HOMER_SYNC_INTERVAL_MINUTES = 5;
  var HOMER_FETCH_TIMEOUT_MS = 7e3;
  var LOCAL_IP_DETECTION_TIMEOUT_MS = 1200;

  // src/i18n.js
  var LOCALE = getPreferredLocale();
  var I18N = {
    ru: {
      topActions: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
      homerStatus: "\u0421\u0442\u0430\u0442\u0443\u0441 Homer",
      syncHomer: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C Homer",
      settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      launchPanel: "\u041F\u043E\u0438\u0441\u043A \u0438 \u0431\u044B\u0441\u0442\u0440\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      searchPlaceholder: "\u0427\u0442\u043E \u0438\u0449\u0435\u043C?",
      searchServices: "\u041F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u044B",
      quickLinks: "\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      servicesArea: "Homer \u0438 \u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u044B\u0435 \u0441\u0430\u0439\u0442\u044B",
      frequentVisits: "\u0427\u0430\u0441\u0442\u043E \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u044B\u0435",
      recentVisits: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u044B\u0435",
      close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
      search: "\u041F\u043E\u0438\u0441\u043A",
      add: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
      visits: "\u041F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F",
      historyPool: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C",
      minVisits: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u0447\u0430\u0441\u0442\u044B\u0445",
      exportSettings: "\u0412\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      exportSettingsInvalid: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0438\u0441\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u043E\u0448\u0438\u0431\u043A\u0438 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
      importSettings: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      importSettingsInvalid: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0438\u0437 \u0444\u0430\u0439\u043B\u0430.",
      importSettingsLoaded: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C\xBB, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C.",
      reset: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C",
      save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
      searchAria: "\u041F\u043E\u0438\u0441\u043A",
      resetConfirm: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0439 \u043A newtab.config.js?",
      servicesEmptyAfterSync: "\u041F\u043B\u0438\u0442\u043A\u0438 Homer \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u0443\u0441\u043F\u0435\u0448\u043D\u043E\u0439 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u0438.",
      miscellaneous: "\u0420\u0430\u0437\u043D\u043E\u0435",
      homerUrlMissing: "URL Homer \u043D\u0435 \u0437\u0430\u0434\u0430\u043D.",
      homerUrlInvalid: "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 URL Homer.",
      homerCache: (date) => `\u041A\u0435\u0448 Homer: ${date}.`,
      homerRecentFailureCache: (date) => `Homer \u043D\u0435\u0434\u0430\u0432\u043D\u043E \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043A\u0435\u0448: ${date}.`,
      homerNeverFetched: "\u042D\u0442\u043E\u0442 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u0435\u0449\u0435 \u043D\u0438 \u0440\u0430\u0437\u0443 \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B Homer.",
      homerRecentFailureNoCache: "Homer \u043D\u0435\u0434\u0430\u0432\u043D\u043E \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B, \u043A\u0435\u0448\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.",
      homerAway: "\u041F\u043E\u0445\u043E\u0436\u0435, \u044D\u0442\u043E \u043D\u0435 \u0434\u043E\u043C\u0430\u0448\u043D\u044F\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0435\u0442\u044C.",
      homerSyncing: "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F Homer...",
      homerUpdated: (date) => `Homer \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D: ${date}.`,
      homerOfflineCache: (date) => `Homer \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043A\u0435\u0448: ${date}.`,
      homerOfflineNoCache: "Homer \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u043A\u0435\u0448\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.",
      homerDisabled: "Homer \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E.",
      disableHomerLocally: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C Homer \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E",
      localEnabled: "\u0412\u043A\u043B",
      inputTitle: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
      inputSearchTemplate: "URL \u0441 {q}",
      remove: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
      dragToReorder: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u044C, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0440\u044F\u0434\u043E\u043A",
      inputQuickLinkTitle: "\u041F\u043E\u0434\u043F\u0438\u0441\u044C",
      settingsNotOpen: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043D\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u044B.",
      needSearchEngine: "\u041D\u0443\u0436\u0435\u043D \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u0438\u043D \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u0438\u043A.",
      searchTemplateMissingQuery: "\u0412 URL \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u0438\u043A\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C {q}.",
      quickLinkBadUrl: "\u0412 \u0431\u044B\u0441\u0442\u0440\u044B\u0445 \u0441\u0441\u044B\u043B\u043A\u0430\u0445 \u0435\u0441\u0442\u044C \u043D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 URL.",
      servicesEmptyFirstSync: "\u041F\u043B\u0438\u0442\u043A\u0438 Homer \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0439 \u0443\u0441\u043F\u0435\u0448\u043D\u043E\u0439 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u0438.",
      visitCount: (count) => `${count} \u043F\u043E\u0441\u0435\u0449.`
    },
    en: {
      topActions: "Controls",
      homerStatus: "Homer status",
      syncHomer: "Refresh Homer",
      settings: "Settings",
      launchPanel: "Search and quick links",
      searchPlaceholder: "What are we looking for?",
      searchServices: "Search services",
      quickLinks: "Quick links",
      servicesArea: "Homer and visited sites",
      frequentVisits: "Frequently visited",
      recentVisits: "Recently visited",
      close: "Close",
      search: "Search",
      add: "Add",
      visits: "Visits",
      historyPool: "History entries to scan",
      minVisits: "Minimum visits for frequent sites",
      exportSettings: "Export settings",
      exportSettingsInvalid: "Fix the settings errors first.",
      importSettings: "Import settings",
      importSettingsInvalid: "Could not load settings from the file.",
      importSettingsLoaded: "Settings loaded. Click Save to apply them.",
      reset: "Reset",
      save: "Save",
      searchAria: "Search",
      resetConfirm: "Reset new tab settings to newtab.config.js?",
      servicesEmptyAfterSync: "Homer tiles will appear after a successful sync.",
      miscellaneous: "Other",
      homerUrlMissing: "Homer URL is not set.",
      homerUrlInvalid: "Invalid Homer URL.",
      homerCache: (date) => `Homer cache: ${date}.`,
      homerRecentFailureCache: (date) => `Homer did not respond recently, using cache: ${date}.`,
      homerNeverFetched: "This browser has not fetched Homer yet.",
      homerRecentFailureNoCache: "Homer did not respond recently, and there is no cache yet.",
      homerAway: "This does not look like the home local network.",
      homerSyncing: "Syncing Homer...",
      homerUpdated: (date) => `Homer updated: ${date}.`,
      homerOfflineCache: (date) => `Homer is unavailable, using cache: ${date}.`,
      homerOfflineNoCache: "Homer is unavailable, and there is no cache yet.",
      homerDisabled: "Homer is disabled locally.",
      disableHomerLocally: "Disable Homer locally",
      localEnabled: "On",
      inputTitle: "Name",
      inputSearchTemplate: "URL with {q}",
      remove: "Remove",
      dragToReorder: "Drag to reorder",
      inputQuickLinkTitle: "Label",
      settingsNotOpen: "Settings are not open.",
      needSearchEngine: "At least one search engine is required.",
      searchTemplateMissingQuery: "Every search engine URL must include {q}.",
      quickLinkBadUrl: "One of the quick links has an invalid URL.",
      servicesEmptyFirstSync: "Homer tiles will appear after the first successful sync.",
      visitCount: (count) => `${count} visits`
    }
  };
  function getPreferredLocale() {
    const language = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages[0] : navigator.language;
    return String(language || "").toLowerCase().startsWith("ru") ? "ru" : "en";
  }
  function t(key, ...args) {
    const value = I18N[LOCALE]?.[key] ?? I18N.ru[key] ?? key;
    return typeof value === "function" ? value(...args) : value;
  }
  function applyLocalization() {
    document.documentElement.lang = LOCALE;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      for (const pair of element.dataset.i18nAttr.split(",")) {
        const [attribute, key] = pair.split(":").map((part) => part.trim());
        if (attribute && key) {
          element.setAttribute(attribute, t(key));
        }
      }
    });
  }

  // src/default-config.js
  var FALLBACK_CONFIG = {
    homer: {
      url: ""
    },
    theme: {},
    search: {
      defaultEngineId: "yandex",
      engines: [
        {
          id: "yandex",
          title: LOCALE === "ru" ? "\u042F\u043D\u0434\u0435\u043A\u0441" : "Yandex",
          template: "https://yandex.ru/search/?text={q}"
        }
      ]
    },
    quickLinks: [],
    visits: {
      frequentHistoryPool: 5e3,
      frequentMinVisits: 3
    },
    services: []
  };

  // src/icons.js
  var ICONS = {
    network: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v5m-7 7v-3h14v3M5 20h4v-4H5v4Zm10 0h4v-4h-4v4Zm-5 0h4v-4h-4v4Z"/></svg>',
    media: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4V5Zm3 3v8l6-4-6-4Zm9 0h2m-2 4h2m-2 4h2"/></svg>',
    sync: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5m10.4-2A7.5 7.5 0 0 0 6.2 7.2M4.6 14a7.5 7.5 0 0 0 13.2 3.8"/></svg>',
    ethernet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15h16v5H4v-5Zm2-9h3v9H6V6Zm5 3h3v6h-3V9Zm5-3h3v9h-3V6Z"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7v9h-6v-6H9v6H3v-9Z"/></svg>'
  };
  var ICON_ALIASES = /* @__PURE__ */ new Map([
    ["fas fa-network-wired", "network"],
    ["fa-network-wired", "network"],
    ["fas fa-photo-video", "media"],
    ["fa-photo-video", "media"],
    ["fas fa-rotate", "sync"],
    ["fa-rotate", "sync"],
    ["fas fa-sync", "sync"],
    ["fas fa-ethernet", "ethernet"],
    ["fa-ethernet", "ethernet"],
    ["fas fa-home", "home"],
    ["fa-home", "home"]
  ]);
  function normalizeSectionIcon(icon, name) {
    const key = String(icon || "").trim().toLowerCase();
    if (ICONS[key]) {
      return key;
    }
    if (ICON_ALIASES.has(key)) {
      return ICON_ALIASES.get(key);
    }
    const text = `${key} ${name || ""}`.toLowerCase();
    if (text.includes("\u043C\u0435\u0434\u0438\u0430") || text.includes("media") || text.includes("photo")) {
      return "media";
    }
    if (text.includes("sync") || text.includes("syncthing") || text.includes("rotate")) {
      return "sync";
    }
    if (text.includes("\u0441\u0435\u0442\u044C") || text.includes("ethernet") || text.includes("router")) {
      return "ethernet";
    }
    if (text.includes("\u0434\u043E\u043C") || text.includes("home")) {
      return "home";
    }
    return "network";
  }

  // src/utils.js
  function byId(id) {
    const node = document.getElementById(id);
    if (!node) {
      throw new Error(`Missing #${id}`);
    }
    return node;
  }
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function makeId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
  function makeInitial(text) {
    const value = String(text || "").trim();
    return value ? value.slice(0, 1).toUpperCase() : "?";
  }
  function toDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  }
  function normalizeUrlKey(raw) {
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
  function truncateTitle(title) {
    const value = String(title || "").replace(/\s+/g, " ").trim();
    return value.length > 22 ? `${value.slice(0, 21).trim()}\u2026` : value;
  }
  function truncateHistoryTitle(title) {
    const value = String(title || "").replace(/\s+/g, " ").trim();
    return value.length > 64 ? `${value.slice(0, 63).trim()}\u2026` : value;
  }
  function formatHistoryMeta(item) {
    const domain = toDomain(item.url);
    const time = formatTime(item.visitedAt);
    if (domain && time) {
      return `${domain} \xB7 ${time}`;
    }
    return domain || time || "";
  }
  function formatFrequentMeta(item) {
    return toDomain(item.url);
  }
  function formatTime(timestamp) {
    try {
      return new Intl.DateTimeFormat(LOCALE === "ru" ? "ru-RU" : "en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch {
      return "";
    }
  }
  function formatDateTime(timestamp) {
    try {
      return new Intl.DateTimeFormat(LOCALE === "ru" ? "ru-RU" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch {
      return "";
    }
  }
  function blobToDataUrl(blob) {
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
  function isHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
  function clampInt(value, min, max, fallback) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, parsed));
  }
  function isCacheFresh(cache, minutes) {
    if (!cache?.fetchedAt) {
      return false;
    }
    return Date.now() - cache.fetchedAt < minutes * 60 * 1e3;
  }
  function isFailureFresh(meta, minutes, sourceUrl) {
    if (!meta?.failedAt) {
      return false;
    }
    if (meta.sourceUrl && sourceUrl && meta.sourceUrl !== sourceUrl) {
      return false;
    }
    return Date.now() - meta.failedAt < minutes * 60 * 1e3;
  }
  function withCacheBuster(url) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("_", String(Date.now()));
      return parsed.href;
    } catch {
      return url;
    }
  }
  async function fetchTextWithTimeout(url, timeoutMs) {
    const response = await fetchWithTimeout(url, timeoutMs, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  }
  async function fetchWithTimeout(url, timeoutMs, options = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timer);
    }
  }
  async function storageGet(key, area = LOCAL_AREA) {
    const chromeApi = globalThis.chrome;
    const storageArea = chromeApi?.storage?.[area] || chromeApi?.storage?.local;
    if (storageArea) {
      return await new Promise((resolve) => {
        storageArea.get([key], (result) => {
          if (chromeApi.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve(result?.[key] ?? null);
        });
      });
    }
    try {
      const raw = globalThis.localStorage?.getItem(`${area}:${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  async function storageSet(key, value, area = LOCAL_AREA) {
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
    }
  }
  async function storageRemove(keys, area = LOCAL_AREA) {
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
      }
    }
  }

  // src/homer.js
  function normalizeHomerCache(raw) {
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
      services
    };
  }
  function normalizeSyncMeta(raw) {
    if (!raw || typeof raw !== "object" || !Number.isFinite(raw.failedAt)) {
      return null;
    }
    return {
      failedAt: raw.failedAt,
      sourceUrl: typeof raw.sourceUrl === "string" ? raw.sourceUrl : "",
      message: typeof raw.message === "string" ? raw.message : ""
    };
  }
  function normalizeServiceGroups(raw, configUrl) {
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map((group) => {
      const items = Array.isArray(group?.items) ? group.items.map((item) => normalizeServiceItem(item, configUrl)).filter(Boolean) : [];
      return {
        name: typeof group?.name === "string" && group.name.trim() ? group.name.trim() : t("miscellaneous"),
        icon: typeof group?.icon === "string" ? group.icon : "",
        items
      };
    }).filter((group) => group.items.length);
  }
  function normalizeServiceItem(raw, configUrl) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const name = String(raw.name ?? raw.title ?? "").trim();
    const url = resolveMaybeRelativeUrl(String(raw.url ?? "").trim(), configUrl);
    if (!name || !url || !isHttpUrl(url)) {
      return null;
    }
    const logoRaw = String(raw.logo ?? raw.icon ?? "").trim();
    const remoteLogo = resolveAssetUrl(logoRaw, configUrl);
    return {
      name,
      url,
      target: typeof raw.target === "string" ? raw.target : "_self",
      logo: remoteLogo,
      fallbackLogo: ""
    };
  }
  function parseHomerConfig(text) {
    const payload = text.trim();
    if (!payload) {
      throw new Error("Empty Homer config.");
    }
    if (payload.startsWith("{") || payload.startsWith("[")) {
      const parsed = JSON.parse(payload);
      return {
        services: Array.isArray(parsed) ? parsed : parsed.services,
        theme: Array.isArray(parsed) ? "" : parsed.theme
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
          items: []
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
          name: parseYamlScalar(itemStart[1])
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
      return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
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
  async function shouldSkipHomerSyncByNetwork(endpoints) {
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
    const ips = /* @__PURE__ */ new Set();
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
    return a === 10 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168;
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
    const parts = String(ip).split(".").map((part) => Number.parseInt(part, 10));
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return null;
    }
    return parts;
  }
  function deriveHomerEndpoints(input) {
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
        const iframeUrl = /\/assets\/config\.(yml|yaml|json)$/i.test(cleanPath) ? `${source.origin}/` : new URL(".", configUrl).href;
        return { configUrl, iframeUrl };
      }
      if (/\/assets$/i.test(cleanPath)) {
        const assetsUrl = source.href.endsWith("/") ? source.href : `${source.href}/`;
        return {
          configUrl: new URL("config.yml", assetsUrl).href,
          iframeUrl: `${source.origin}/`
        };
      }
      const rootUrl = source.href.endsWith("/") ? source.href : `${source.href}/`;
      return {
        configUrl: new URL("assets/config.yml", rootUrl).href,
        iframeUrl: rootUrl
      };
    } catch {
      return null;
    }
  }
  function resolveMaybeRelativeUrl(value, configUrl) {
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
  function resolveAssetUrl(value, configUrl) {
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

  // src/state.js
  function normalizeBootConfig(raw) {
    const fallback = clone(FALLBACK_CONFIG);
    const source = raw && typeof raw === "object" ? raw : {};
    return {
      homer: normalizeHomerSettings(source.homer, fallback.homer),
      theme: {
        backgroundDark: typeof source.theme?.backgroundDark === "string" ? source.theme.backgroundDark : fallback.theme.backgroundDark,
        backgroundLight: typeof source.theme?.backgroundLight === "string" ? source.theme.backgroundLight : fallback.theme.backgroundLight
      },
      search: normalizeSearch(source.search, fallback.search),
      quickLinks: normalizeQuickLinks(source.quickLinks, fallback.quickLinks),
      visits: normalizeVisitSettings(source.visits, fallback.visits),
      services: normalizeServiceGroups(source.services, "")
    };
  }
  function createDefaultState(baseConfig) {
    return {
      search: clone(baseConfig.search),
      quickLinks: clone(baseConfig.quickLinks),
      homer: clone(baseConfig.homer),
      visits: clone(baseConfig.visits)
    };
  }
  function normalizeState(raw, baseConfig) {
    const base = createDefaultState(baseConfig);
    if (!raw || typeof raw !== "object") {
      return base;
    }
    return {
      search: normalizeSearch(raw.search, base.search),
      quickLinks: normalizeQuickLinks(raw.quickLinks, base.quickLinks),
      homer: normalizeHomerSettings(raw.homer, base.homer),
      visits: normalizeVisitSettings(raw.visits, base.visits)
    };
  }
  function normalizeSyncedState(raw, baseConfig) {
    const state = normalizeState(raw, baseConfig);
    state.search.defaultEngineId = "";
    return state;
  }
  function createSyncedState(state) {
    return {
      search: {
        engines: clone(state.search.engines)
      },
      quickLinks: clone(state.quickLinks),
      homer: clone(state.homer),
      visits: clone(state.visits)
    };
  }
  function normalizeLocalPatch(raw, state) {
    const source = raw && typeof raw === "object" ? raw : {};
    const engineIds = new Set(state.search.engines.map((engine) => engine.id));
    const quickLinkIds = new Set(state.quickLinks.map((link) => link.id));
    const disabledEngineIds = normalizeIdList(source.search?.disabledEngineIds, engineIds);
    const disabledLinkIds = normalizeIdList(source.quickLinks?.disabledLinkIds, quickLinkIds);
    const visibleEngineIds = state.search.engines.map((engine) => engine.id).filter((id) => !disabledEngineIds.includes(id));
    const defaultEngineId = typeof source.search?.defaultEngineId === "string" && visibleEngineIds.includes(source.search.defaultEngineId) ? source.search.defaultEngineId : visibleEngineIds[0] || "";
    return {
      search: {
        defaultEngineId,
        disabledEngineIds
      },
      quickLinks: {
        disabledLinkIds
      },
      homer: {
        disabled: source.homer?.disabled === true
      }
    };
  }
  function applyLocalPatch(state, localPatch) {
    const next = normalizeState(state, state);
    const patch = normalizeLocalPatch(localPatch, next);
    next.search.defaultEngineId = patch.search.defaultEngineId || getVisibleSearchEngines({ state: next, localPatch: patch })[0]?.id || "";
    return next;
  }
  function getVisibleSearchEngines(app2) {
    const disabled = new Set(app2.localPatch?.search?.disabledEngineIds || []);
    return app2.state.search.engines.filter((engine) => !disabled.has(engine.id));
  }
  function getVisibleQuickLinks(app2) {
    const disabled = new Set(app2.localPatch?.quickLinks?.disabledLinkIds || []);
    return app2.state.quickLinks.filter((link) => !disabled.has(link.id));
  }
  function normalizeIdList(raw, allowedIds) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = /* @__PURE__ */ new Set();
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
  function normalizeSearch(raw, fallback) {
    const fallbackSearch = fallback || FALLBACK_CONFIG.search;
    const engines = Array.isArray(raw?.engines) ? raw.engines.map(normalizeSearchEngine).filter(Boolean) : clone(fallbackSearch.engines);
    if (!engines.length) {
      engines.push(...clone(FALLBACK_CONFIG.search.engines));
    }
    const defaultEngineId = typeof raw?.defaultEngineId === "string" && engines.some((engine) => engine.id === raw.defaultEngineId) ? raw.defaultEngineId : engines[0].id;
    return { engines, defaultEngineId };
  }
  function normalizeSearchEngine(raw) {
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
      template
    };
  }
  function normalizeQuickLinks(raw, fallback) {
    const source = Array.isArray(raw) ? raw : fallback || [];
    return source.map((link) => ({
      id: typeof link?.id === "string" && link.id ? link.id : makeId("quick"),
      title: typeof link?.title === "string" ? link.title.trim() : "",
      url: typeof link?.url === "string" ? link.url.trim() : ""
    })).filter((link) => link.url);
  }
  function normalizeHomerSettings(raw, fallback) {
    const base = fallback || FALLBACK_CONFIG.homer;
    return {
      url: typeof raw?.url === "string" ? raw.url : base.url || ""
    };
  }
  function normalizeVisitSettings(raw, fallback) {
    const base = fallback || FALLBACK_CONFIG.visits;
    return {
      frequentHistoryPool: clampInt(raw?.frequentHistoryPool, 50, 5e4, base.frequentHistoryPool),
      frequentMinVisits: clampInt(raw?.frequentMinVisits, 2, 1e3, base.frequentMinVisits)
    };
  }
  function normalizeQuickLinkMeta(raw) {
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
        iconDataUrl: typeof value.iconDataUrl === "string" && value.iconDataUrl.startsWith("data:image/") ? value.iconDataUrl : "",
        iconSize: Number.isFinite(value.iconSize) ? value.iconSize : 0
      };
    }
    return out;
  }
  function normalizeSearchEngineMeta(raw) {
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
        iconDataUrl: typeof value.iconDataUrl === "string" && value.iconDataUrl.startsWith("data:image/") ? value.iconDataUrl : "",
        iconSize: Number.isFinite(value.iconSize) ? value.iconSize : 0
      };
    }
    return out;
  }
  function normalizeVisitHistory(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = /* @__PURE__ */ new Set();
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
  function normalizeVisitHistoryItem(raw) {
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
      visitedAt: Number.isFinite(raw.visitedAt) ? raw.visitedAt : Number.isFinite(raw.lastVisitTime) ? raw.lastVisitTime : Date.now()
    };
  }

  // src/history.js
  async function addVisitHistoryItem(app2, item) {
    const normalized = normalizeVisitHistoryItem(item);
    if (!normalized) {
      return;
    }
    normalized.visitedAt = Date.now();
    app2.visitHistory = [
      normalized,
      ...app2.visitHistory.filter((existing) => normalizeUrlKey(existing.url) !== normalizeUrlKey(normalized.url))
    ].slice(0, VISIT_HISTORY_LIMIT);
    app2.renderVisitPanels();
    if (hasBrowserHistoryApi()) {
      return;
    }
    await storageSet(HISTORY_KEY, app2.visitHistory, LOCAL_AREA);
  }
  async function loadVisitHistory() {
    if (!hasBrowserHistoryApi()) {
      return normalizeVisitHistory(await storageGet(HISTORY_KEY));
    }
    return await new Promise((resolve) => {
      const chromeApi = globalThis.chrome;
      chromeApi.history.search(
        {
          text: "",
          startTime: 0,
          maxResults: VISIT_HISTORY_LIMIT * 3
        },
        (results) => {
          if (chromeApi.runtime.lastError) {
            resolve([]);
            return;
          }
          resolve(normalizeVisitHistory((results || []).filter((item) => isHttpUrl(item.url))));
        }
      );
    });
  }
  async function refreshVisitHistory(app2) {
    const [nextHistory, nextFrequent] = await Promise.all([loadVisitHistory(), loadFrequentVisits(app2)]);
    if (!nextHistory.length && !app2.visitHistory.length && !nextFrequent.length && !app2.frequentVisits.length) {
      return;
    }
    app2.visitHistory = nextHistory;
    app2.frequentVisits = nextFrequent;
    app2.renderVisitPanels();
  }
  function hasBrowserHistoryApi() {
    return typeof globalThis.chrome?.history?.search === "function";
  }
  async function loadFrequentVisits(app2) {
    if (!hasBrowserHistoryApi()) {
      return [];
    }
    const settings = normalizeVisitSettings(app2.state.visits, FALLBACK_CONFIG.visits);
    return await new Promise((resolve) => {
      const chromeApi = globalThis.chrome;
      chromeApi.history.search(
        {
          text: "",
          startTime: 0,
          maxResults: settings.frequentHistoryPool
        },
        (results) => {
          if (chromeApi.runtime.lastError) {
            resolve([]);
            return;
          }
          const frequent = (results || []).filter(
            (item) => isHttpUrl(item.url) && Number.isFinite(item.visitCount) && item.visitCount >= settings.frequentMinVisits
          ).sort((a, b) => {
            const visitsDiff = b.visitCount - a.visitCount;
            if (visitsDiff) {
              return visitsDiff;
            }
            return (b.lastVisitTime || 0) - (a.lastVisitTime || 0);
          });
          resolve(normalizeVisitHistory(frequent).slice(0, VISIT_HISTORY_LIMIT));
        }
      );
    });
  }

  // src/metadata.js
  var FAVICON_SIZE = 64;
  function getQuickLinkMeta(app2, url) {
    const key = normalizeUrlKey(url);
    return key ? app2.quickLinkMeta[key] || null : null;
  }
  function getSearchEngineMeta(app2, engine) {
    const key = getSearchEngineMetaKey(engine);
    return key ? app2.searchEngineMeta[key] || null : null;
  }
  function getSearchEngineMetaKey(engine) {
    return normalizeUrlKey(getSearchEngineIconPageUrl(engine));
  }
  function getSearchEngineIconPageUrl(engine) {
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
  function getQuickLinkTitle(link, meta) {
    const customTitle = typeof link.title === "string" ? link.title.trim() : "";
    if (customTitle) {
      return truncateTitle(customTitle);
    }
    if (meta?.title) {
      return truncateTitle(meta.title);
    }
    return truncateTitle(toDomain(link.url) || link.url);
  }
  async function refreshQuickLinkMetadata(app2, { force }) {
    const links = getVisibleQuickLinks(app2).filter((link) => isHttpUrl(link.url));
    let changed = false;
    const seen = /* @__PURE__ */ new Set();
    for (const link of links) {
      const key = normalizeUrlKey(link.url);
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      const cached = app2.quickLinkMeta[key];
      if (!force && isFreshIconMeta(cached)) {
        continue;
      }
      const meta = await fetchQuickLinkMetadata(link.url);
      app2.quickLinkMeta[key] = {
        fetchedAt: Date.now(),
        title: meta.title || cached?.title || "",
        iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
        iconSize: meta.iconDataUrl ? FAVICON_SIZE : cached?.iconSize || 0
      };
      changed = true;
      app2.renderQuickLinks();
    }
    if (changed) {
      pruneQuickLinkMeta(app2, seen);
      await storageSet(QUICK_LINK_META_KEY, app2.quickLinkMeta, LOCAL_AREA);
    }
  }
  async function refreshSearchEngineMetadata(app2, { force }) {
    const engines = getVisibleSearchEngines(app2);
    let changed = false;
    const seen = /* @__PURE__ */ new Set();
    for (const engine of engines) {
      const key = getSearchEngineMetaKey(engine);
      const iconPageUrl = getSearchEngineIconPageUrl(engine);
      if (!key || !iconPageUrl || seen.has(key)) {
        continue;
      }
      seen.add(key);
      const cached = app2.searchEngineMeta[key];
      if (!force && isFreshIconMeta(cached)) {
        continue;
      }
      const meta = await fetchQuickLinkMetadata(iconPageUrl);
      app2.searchEngineMeta[key] = {
        fetchedAt: Date.now(),
        iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
        iconSize: meta.iconDataUrl ? FAVICON_SIZE : cached?.iconSize || 0
      };
      changed = true;
      app2.renderSearchButtons();
    }
    if (changed) {
      pruneSearchEngineMeta(app2, seen);
      await storageSet(SEARCH_ENGINE_META_KEY, app2.searchEngineMeta, LOCAL_AREA);
    }
  }
  async function fetchQuickLinkMetadata(url) {
    const pageUrl = url;
    const chromeFaviconUrl = getChromeFaviconUrl(pageUrl, FAVICON_SIZE);
    const iconDataUrl = chromeFaviconUrl ? await fetchIconDataUrl(chromeFaviconUrl) : "";
    return {
      title: "",
      iconDataUrl: iconDataUrl || await fetchIconDataUrl(getDefaultFaviconUrl(pageUrl))
    };
  }
  function isFreshIconMeta(meta) {
    return Boolean(
      meta?.fetchedAt && Date.now() - meta.fetchedAt < QUICK_LINK_META_TTL_MS && meta.iconDataUrl && meta.iconSize >= FAVICON_SIZE
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
  function pruneQuickLinkMeta(app2, activeKeys) {
    for (const key of Object.keys(app2.quickLinkMeta)) {
      if (!activeKeys.has(key)) {
        delete app2.quickLinkMeta[key];
      }
    }
  }
  function pruneSearchEngineMeta(app2, activeKeys) {
    for (const key of Object.keys(app2.searchEngineMeta)) {
      if (!activeKeys.has(key)) {
        delete app2.searchEngineMeta[key];
      }
    }
  }

  // src/render.js
  function renderAll(app2) {
    renderSearchButtons(app2);
    renderQuickLinks(app2);
    renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
    renderVisitPanels(app2);
    setStatusFromCurrentData(app2);
  }
  function renderSearchButtons(app2) {
    const { refs } = app2;
    refs.searchButtons.replaceChildren();
    const engines = getVisibleSearchEngines(app2);
    for (const engine of engines) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-button";
      button.title = engine.title;
      button.setAttribute("aria-label", button.title || t("searchAria"));
      button.classList.toggle("active", engine.id === app2.state.search.defaultEngineId);
      button.append(createSearchEngineIcon(app2, engine));
      button.addEventListener("click", () => {
        const query = refs.searchInput.value.trim();
        if (query) {
          app2.runSearch(engine, query);
          return;
        }
        app2.localPatch.search.defaultEngineId = engine.id;
        void app2.persistLocalPatch();
        app2.state.search.defaultEngineId = engine.id;
        renderSearchButtons(app2);
        refs.searchInput.focus();
      });
      refs.searchButtons.append(button);
    }
  }
  function createSearchEngineIcon(app2, engine) {
    const icon = document.createElement("span");
    icon.className = "search-icon";
    const meta = getSearchEngineMeta(app2, engine);
    if (meta?.iconDataUrl) {
      const image = document.createElement("img");
      image.src = meta.iconDataUrl;
      image.alt = "";
      image.addEventListener("error", () => {
        image.remove();
        icon.textContent = makeInitial(engine.title || engine.id);
      });
      icon.append(image);
      return icon;
    }
    icon.textContent = makeInitial(engine.title || engine.id);
    return icon;
  }
  function renderQuickLinks(app2) {
    app2.refs.quickLinks.replaceChildren();
    for (const link of getVisibleQuickLinks(app2)) {
      app2.refs.quickLinks.append(createQuickLink(app2, link));
    }
  }
  function createQuickLink(app2, link) {
    const meta = getQuickLinkMeta(app2, link.url);
    const title = getQuickLinkTitle(link, meta);
    const iconDataUrl = meta?.iconDataUrl || "";
    const anchor = document.createElement("a");
    anchor.className = "quick-link";
    anchor.href = link.url;
    anchor.title = title;
    anchor.addEventListener("click", () => {
      void app2.addVisitHistoryItem({
        title,
        url: link.url,
        source: "quick"
      });
    });
    const icon = document.createElement("span");
    icon.className = "quick-icon";
    if (iconDataUrl) {
      const image = document.createElement("img");
      image.src = iconDataUrl;
      image.alt = "";
      image.addEventListener("error", () => {
        image.remove();
        icon.textContent = makeInitial(title);
      });
      icon.append(image);
    } else {
      icon.textContent = makeInitial(title);
    }
    const label = document.createElement("span");
    label.className = "quick-label";
    label.textContent = title;
    anchor.append(icon, label);
    return anchor;
  }
  function renderServices(app2, services, emptyMessage = t("servicesEmptyAfterSync")) {
    app2.refs.servicesGrid.replaceChildren();
    if (!services.length) {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = emptyMessage;
      app2.refs.servicesGrid.append(empty);
      return;
    }
    for (const group of services) {
      const article = document.createElement("article");
      article.className = "service-group";
      const heading = document.createElement("h2");
      heading.className = "service-heading";
      heading.append(createSectionIcon(group.icon, group.name), document.createTextNode(group.name || t("miscellaneous")));
      const card = document.createElement("div");
      card.className = "service-card";
      for (const item of group.items) {
        card.append(createServiceRow(app2, item));
      }
      article.append(heading, card);
      app2.refs.servicesGrid.append(article);
    }
  }
  function createSectionIcon(icon, name) {
    const span = document.createElement("span");
    span.className = "section-icon";
    const normalized = normalizeSectionIcon(icon, name);
    span.innerHTML = ICONS[normalized] || ICONS.network;
    return span;
  }
  function createServiceRow(app2, item) {
    const anchor = document.createElement("a");
    anchor.className = "service-row";
    anchor.href = item.url;
    anchor.target = item.target || "_self";
    if (anchor.target !== "_self") {
      anchor.rel = "noreferrer";
    }
    anchor.title = item.name;
    anchor.addEventListener("click", () => {
      void app2.addVisitHistoryItem({
        title: item.name || item.url,
        url: item.url,
        source: "homer"
      });
    });
    const logo = document.createElement("span");
    logo.className = "service-logo";
    if (item.logo) {
      const image = document.createElement("img");
      image.src = item.logo;
      image.alt = "";
      image.loading = "lazy";
      if (item.fallbackLogo && item.fallbackLogo !== item.logo) {
        image.dataset.fallbackLogo = item.fallbackLogo;
      }
      image.addEventListener("error", () => {
        if (image.dataset.fallbackLogo && image.src !== image.dataset.fallbackLogo) {
          image.src = image.dataset.fallbackLogo;
          delete image.dataset.fallbackLogo;
          return;
        }
        image.remove();
        logo.textContent = makeInitial(item.name);
      });
      logo.append(image);
    } else {
      logo.textContent = makeInitial(item.name);
    }
    const text = document.createElement("span");
    text.className = "service-title";
    text.textContent = item.name || item.url;
    anchor.append(logo, text);
    return anchor;
  }
  function renderVisitPanels(app2) {
    renderVisitList({
      panel: app2.refs.frequentPanel,
      list: app2.refs.frequentList,
      items: app2.frequentVisits,
      metaFormatter: formatFrequentMeta,
      showVisitCount: true,
      app: app2
    });
    renderVisitList({
      panel: app2.refs.historyPanel,
      list: app2.refs.historyList,
      items: app2.visitHistory,
      metaFormatter: formatHistoryMeta,
      app: app2
    });
  }
  function renderVisitList({ panel, list, items, metaFormatter, showVisitCount = false, app: app2 }) {
    list.replaceChildren();
    const isEmpty = !items.length;
    panel.classList.toggle("hidden", isEmpty);
    if (isEmpty) {
      return;
    }
    for (const item of items) {
      const anchor = document.createElement("a");
      anchor.className = "visit-row";
      anchor.href = item.url;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.title = item.url;
      anchor.addEventListener("click", () => {
        void app2.addVisitHistoryItem(item);
      });
      const title = document.createElement("span");
      title.className = "visit-title";
      title.textContent = item.title || toDomain(item.url) || item.url;
      const meta = document.createElement("span");
      meta.className = "visit-meta";
      meta.textContent = metaFormatter(item);
      if (showVisitCount && Number.isFinite(item.visitCount) && item.visitCount > 0) {
        const count = document.createElement("span");
        count.className = "visit-count";
        count.textContent = String(item.visitCount);
        count.title = t("visitCount", item.visitCount);
        anchor.append(title, count, meta);
      } else {
        anchor.append(title, meta);
      }
      list.append(anchor);
    }
  }
  function getVisibleServices(app2) {
    if (app2.localPatch?.homer?.disabled || !app2.state.homer.url) {
      return [];
    }
    if (app2.homerCache?.services?.length) {
      return app2.homerCache.services;
    }
    return [];
  }
  function getEmptyServicesMessage(app2) {
    if (app2.localPatch?.homer?.disabled) {
      return t("homerDisabled");
    }
    if (!app2.state.homer.url) {
      return t("homerUrlMissing");
    }
    if (app2.homerCache?.services?.length) {
      return "";
    }
    return t("servicesEmptyFirstSync");
  }
  function setStatusFromCurrentData(app2) {
    if (app2.localPatch?.homer?.disabled) {
      setStatus(app2, "local", "off", t("homerDisabled"));
      return;
    }
    if (!app2.state.homer.url) {
      setStatus(app2, "local", "no url", t("homerUrlMissing"));
      return;
    }
    if (app2.homerCache?.services?.length) {
      setStatus(app2, "cache", "cache", t("homerCache", formatDateTime(app2.homerCache.fetchedAt)));
      return;
    }
    setStatus(app2, "local", app2.homerCache?.services?.length ? "away" : "no homer", getEmptyServicesMessage(app2));
  }
  function setStatus(app2, kind, text, title) {
    app2.refs.statusButton.dataset.status = kind;
    app2.refs.statusText.textContent = text;
    app2.refs.statusButton.title = title;
  }

  // src/settings.js
  function openSettings(app2) {
    app2.settingsDraft = clone(app2.state);
    app2.localPatchDraft = clone(app2.localPatch);
    renderSettings(app2);
    app2.refs.settingsOverlay.classList.remove("hidden");
    app2.refs.homerUrlInput.focus();
  }
  function closeSettings(app2) {
    app2.refs.settingsOverlay.classList.add("hidden");
    app2.settingsDraft = null;
    app2.localPatchDraft = null;
  }
  function renderSettings(app2) {
    if (!app2.settingsDraft) {
      return;
    }
    renderEngineSettings(app2);
    renderQuickLinkSettings(app2);
    app2.refs.homerUrlInput.value = app2.settingsDraft.homer.url;
    app2.refs.homerDisabledInput.checked = app2.localPatchDraft?.homer?.disabled === true;
    app2.refs.frequentHistoryPoolInput.value = String(app2.settingsDraft.visits.frequentHistoryPool);
    app2.refs.frequentMinVisitsInput.value = String(app2.settingsDraft.visits.frequentMinVisits);
  }
  function renderEngineSettings(app2) {
    const { refs, settingsDraft } = app2;
    const localPatchDraft = ensureLocalPatchDraft(app2);
    refs.engineRows.replaceChildren();
    for (const [index, engine] of settingsDraft.search.engines.entries()) {
      const row = document.createElement("div");
      row.className = "settings-row engine-row";
      const dragHandle = createDragHandle();
      attachReorderHandlers(row, dragHandle, settingsDraft.search.engines, index, () => renderSettings(app2));
      const title = createInput(t("inputTitle"), engine.title);
      const template = createInput(t("inputSearchTemplate"), engine.template);
      const enabledWrap = createCheckField(t("localEnabled"), !localPatchDraft.search.disabledEngineIds.includes(engine.id));
      const defaultWrap = document.createElement("label");
      defaultWrap.className = "default-field";
      const defaultRadio = document.createElement("input");
      defaultRadio.type = "radio";
      defaultRadio.name = "defaultSearchEngine";
      defaultRadio.checked = engine.id === settingsDraft.search.defaultEngineId;
      defaultRadio.disabled = localPatchDraft.search.disabledEngineIds.includes(engine.id);
      defaultWrap.append(defaultRadio, document.createTextNode("Enter"));
      const remove = createSmallButton("\xD7", t("remove"));
      title.addEventListener("input", () => {
        engine.title = title.value;
      });
      template.addEventListener("input", () => {
        engine.template = template.value;
      });
      enabledWrap.input.addEventListener("change", () => {
        updateDisabledId(localPatchDraft.search.disabledEngineIds, engine.id, !enabledWrap.input.checked);
        if (!enabledWrap.input.checked && settingsDraft.search.defaultEngineId === engine.id) {
          settingsDraft.search.defaultEngineId = getFirstEnabledEngineId(settingsDraft, localPatchDraft) || "";
        }
        if (enabledWrap.input.checked && !settingsDraft.search.defaultEngineId) {
          settingsDraft.search.defaultEngineId = engine.id;
        }
        renderSettings(app2);
      });
      defaultRadio.addEventListener("change", () => {
        settingsDraft.search.defaultEngineId = engine.id;
      });
      remove.addEventListener("click", () => {
        settingsDraft.search.engines = settingsDraft.search.engines.filter((item) => item.id !== engine.id);
        updateDisabledId(localPatchDraft.search.disabledEngineIds, engine.id, false);
        if (settingsDraft.search.defaultEngineId === engine.id) {
          settingsDraft.search.defaultEngineId = getFirstEnabledEngineId(settingsDraft, localPatchDraft) || "";
        }
        renderSettings(app2);
      });
      row.append(dragHandle, title, template, enabledWrap.label, defaultWrap, remove);
      refs.engineRows.append(row);
    }
  }
  function renderQuickLinkSettings(app2) {
    const { refs, settingsDraft } = app2;
    const localPatchDraft = ensureLocalPatchDraft(app2);
    refs.quickLinkRows.replaceChildren();
    for (const [index, link] of settingsDraft.quickLinks.entries()) {
      const row = document.createElement("div");
      row.className = "settings-row quick-row";
      const dragHandle = createDragHandle();
      attachReorderHandlers(row, dragHandle, settingsDraft.quickLinks, index, () => renderSettings(app2));
      const title = createInput(t("inputQuickLinkTitle"), link.title);
      const url = createInput("URL", link.url, "url");
      const enabledWrap = createCheckField(t("localEnabled"), !localPatchDraft.quickLinks.disabledLinkIds.includes(link.id));
      const remove = createSmallButton("\xD7", t("remove"));
      title.addEventListener("input", () => {
        link.title = title.value;
      });
      url.addEventListener("input", () => {
        link.url = url.value;
      });
      enabledWrap.input.addEventListener("change", () => {
        updateDisabledId(localPatchDraft.quickLinks.disabledLinkIds, link.id, !enabledWrap.input.checked);
      });
      remove.addEventListener("click", () => {
        settingsDraft.quickLinks = settingsDraft.quickLinks.filter((item) => item.id !== link.id);
        updateDisabledId(localPatchDraft.quickLinks.disabledLinkIds, link.id, false);
        renderSettings(app2);
      });
      row.append(dragHandle, title, url, enabledWrap.label, remove);
      refs.quickLinkRows.append(row);
    }
  }
  function createDragHandle() {
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "drag-handle";
    handle.textContent = "\u2630";
    handle.title = t("dragToReorder");
    handle.setAttribute("aria-label", t("dragToReorder"));
    return handle;
  }
  function attachReorderHandlers(row, handle, items, index, onMove) {
    handle.draggable = true;
    handle.addEventListener("dragstart", (event) => {
      row.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    });
    handle.addEventListener("dragend", () => {
      row.classList.remove("dragging");
    });
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      row.classList.add("drag-over");
    });
    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("drag-over");
      const fromIndex = Number(event.dataTransfer.getData("text/plain"));
      if (Number.isNaN(fromIndex)) {
        return;
      }
      moveItem(items, fromIndex, index);
      onMove();
    });
  }
  function handleExportSettings(app2) {
    const result = validateSettingsDraft(app2);
    if (!result.ok) {
      window.alert(`${t("exportSettingsInvalid")}
${result.error}`);
      return;
    }
    const blob = new Blob([`${JSON.stringify(createSyncedState(result.state), null, 2)}
`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `homer-or-not-settings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
  async function handleImportSettings(app2, event) {
    if (!app2.settingsDraft) {
      return;
    }
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const raw = JSON.parse(await file.text());
      app2.settingsDraft = normalizeState(raw, app2.baseConfig);
      app2.localPatchDraft = normalizeLocalPatch(null, app2.settingsDraft);
      renderSettings(app2);
      window.alert(t("importSettingsLoaded"));
    } catch {
      window.alert(t("importSettingsInvalid"));
    }
  }
  function moveItem(items, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
      return;
    }
    const [item] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, item);
  }
  function validateSettingsDraft(app2) {
    const { settingsDraft } = app2;
    if (!settingsDraft) {
      return { ok: false, error: t("settingsNotOpen") };
    }
    const cleanedEngines = settingsDraft.search.engines.map((engine) => ({
      id: engine.id || makeId("engine"),
      title: engine.title.trim(),
      template: engine.template.trim()
    })).filter((engine) => engine.title && engine.template);
    if (!cleanedEngines.length) {
      return { ok: false, error: t("needSearchEngine") };
    }
    if (cleanedEngines.some((engine) => !engine.template.includes("{q}"))) {
      return { ok: false, error: t("searchTemplateMissingQuery") };
    }
    const cleanedLinks = settingsDraft.quickLinks.map((link) => ({
      id: link.id || makeId("quick"),
      title: typeof link.title === "string" ? link.title.trim() : "",
      url: link.url.trim()
    })).filter((link) => link.url);
    if (cleanedLinks.some((link) => !isHttpUrl(link.url))) {
      return { ok: false, error: t("quickLinkBadUrl") };
    }
    const nextHomer = readHomerDraft(app2);
    if (nextHomer.url && !deriveHomerEndpoints(nextHomer.url)) {
      return { ok: false, error: t("homerUrlInvalid") };
    }
    return {
      ok: true,
      state: {
        search: {
          engines: cleanedEngines,
          defaultEngineId: cleanedEngines.find((engine) => engine.id === settingsDraft.search.defaultEngineId)?.id || cleanedEngines[0].id
        },
        quickLinks: cleanedLinks,
        homer: nextHomer,
        visits: readVisitsDraft(app2)
      },
      localPatch: normalizeLocalPatch(
        {
          ...ensureLocalPatchDraft(app2),
          search: {
            ...ensureLocalPatchDraft(app2).search,
            defaultEngineId: cleanedEngines.find((engine) => engine.id === settingsDraft.search.defaultEngineId)?.id || cleanedEngines[0].id
          },
          homer: {
            disabled: app2.refs.homerDisabledInput.checked
          }
        },
        {
          search: {
            engines: cleanedEngines,
            defaultEngineId: ""
          },
          quickLinks: cleanedLinks,
          homer: nextHomer,
          visits: readVisitsDraft(app2)
        }
      )
    };
  }
  function readHomerDraft(app2) {
    return {
      url: app2.refs.homerUrlInput.value.trim()
    };
  }
  function readVisitsDraft(app2) {
    return normalizeVisitSettings(
      {
        frequentHistoryPool: app2.refs.frequentHistoryPoolInput.value,
        frequentMinVisits: app2.refs.frequentMinVisitsInput.value
      },
      FALLBACK_CONFIG.visits
    );
  }
  function createInput(placeholder, value, type = "text") {
    const input = document.createElement("input");
    input.type = type;
    input.placeholder = placeholder;
    input.name = placeholder.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zа-я0-9_{}]/gi, "");
    input.setAttribute("aria-label", placeholder);
    input.value = value || "";
    input.title = placeholder;
    return input;
  }
  function createCheckField(text, checked) {
    const label = document.createElement("label");
    label.className = "check-field";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    label.append(input, document.createTextNode(text));
    return { label, input };
  }
  function createSmallButton(text, title) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "row-button";
    button.textContent = text;
    button.title = title;
    return button;
  }
  function ensureLocalPatchDraft(app2) {
    if (!app2.localPatchDraft) {
      app2.localPatchDraft = normalizeLocalPatch(null, app2.settingsDraft);
    }
    return app2.localPatchDraft;
  }
  function updateDisabledId(list, id, disabled) {
    const index = list.indexOf(id);
    if (disabled && index === -1) {
      list.push(id);
      return;
    }
    if (!disabled && index !== -1) {
      list.splice(index, 1);
    }
  }
  function getFirstEnabledEngineId(settingsDraft, localPatchDraft) {
    return settingsDraft.search.engines.find((engine) => !localPatchDraft.search.disabledEngineIds.includes(engine.id))?.id || "";
  }

  // src/sync.js
  async function syncHomer(app2, { force }) {
    if (app2.localPatch?.homer?.disabled) {
      setStatus(app2, "local", "off", t("homerDisabled"));
      renderServices(app2, [], t("homerDisabled"));
      return;
    }
    if (!app2.state.homer.url) {
      setStatus(app2, "local", "no url", t("homerUrlMissing"));
      renderServices(app2, [], t("homerUrlMissing"));
      return;
    }
    const endpoints = deriveHomerEndpoints(app2.state.homer.url);
    if (!endpoints) {
      setStatus(app2, "error", "bad url", t("homerUrlInvalid"));
      renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
      return;
    }
    if (!force && isCacheFresh(app2.homerCache, HOMER_SYNC_INTERVAL_MINUTES)) {
      setStatus(app2, "cache", "cache", t("homerCache", formatDateTime(app2.homerCache.fetchedAt)));
      renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
      return;
    }
    if (!force && isFailureFresh(app2.syncMeta, HOMER_SYNC_INTERVAL_MINUTES, endpoints.configUrl)) {
      if (app2.homerCache?.services?.length) {
        renderServices(app2, app2.homerCache.services);
        setStatus(app2, "cache", "offline", t("homerRecentFailureCache", formatDateTime(app2.homerCache.fetchedAt)));
        return;
      }
      renderServices(app2, [], t("homerNeverFetched"));
      setStatus(app2, "local", "no homer", t("homerRecentFailureNoCache"));
      return;
    }
    if (!force && await shouldSkipHomerSyncByNetwork(endpoints)) {
      renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
      setStatus(app2, "cache", app2.homerCache?.services?.length ? "away" : "no homer", t("homerAway"));
      return;
    }
    setStatus(app2, "sync", "sync", t("homerSyncing"));
    try {
      const configText = await fetchTextWithTimeout(withCacheBuster(endpoints.configUrl), HOMER_FETCH_TIMEOUT_MS);
      const parsed = parseHomerConfig(configText, endpoints.configUrl);
      const services = normalizeServiceGroups(parsed.services, endpoints.configUrl);
      if (!services.length) {
        throw new Error("Homer config has no services.");
      }
      app2.homerCache = {
        fetchedAt: Date.now(),
        sourceUrl: endpoints.configUrl,
        theme: typeof parsed.theme === "string" ? parsed.theme : "",
        services
      };
      await storageSet(CACHE_KEY, app2.homerCache, LOCAL_AREA);
      app2.syncMeta = null;
      await storageRemove(META_KEY, LOCAL_AREA);
      app2.applyTheme();
      renderServices(app2, services);
      setStatus(app2, "live", "live", t("homerUpdated", formatDateTime(app2.homerCache.fetchedAt)));
    } catch (error) {
      app2.syncMeta = {
        failedAt: Date.now(),
        sourceUrl: endpoints.configUrl,
        message: error?.message || String(error)
      };
      await storageSet(META_KEY, app2.syncMeta, LOCAL_AREA);
      if (app2.homerCache?.services?.length) {
        renderServices(app2, app2.homerCache.services);
        setStatus(app2, "cache", "offline", t("homerOfflineCache", formatDateTime(app2.homerCache.fetchedAt)));
        return;
      }
      renderServices(app2, [], t("homerNeverFetched"));
      setStatus(app2, "local", "no homer", t("homerOfflineNoCache"));
    }
  }

  // src/theme.js
  function applyTheme(app2) {
    const setWallpaper = () => {
      const image = getHomerWallpaperUrl(app2);
      if (image) {
        document.documentElement.style.setProperty("--wallpaper-image", `url("${image}")`);
        return;
      }
      document.documentElement.style.removeProperty("--wallpaper-image");
    };
    setWallpaper();
    globalThis.matchMedia?.("(prefers-color-scheme: light)")?.addEventListener?.("change", setWallpaper);
  }
  function getHomerWallpaperUrl(app2) {
    const theme = String(app2.homerCache?.theme || "").trim();
    if (!theme) {
      return "";
    }
    const configUrl = app2.homerCache?.sourceUrl || deriveHomerEndpoints(app2.state.homer.url)?.configUrl || "";
    if (!configUrl) {
      return "";
    }
    const prefersLight = globalThis.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    const fileName = prefersLight ? "wallpaper-light.webp" : "wallpaper.webp";
    return resolveAssetUrl(`assets/themes/${theme}/${fileName}`, configUrl);
  }

  // src/main.js
  var app = {
    refs: {},
    baseConfig: normalizeBootConfig(globalThis.HOMER_OR_NOT_CONFIG || FALLBACK_CONFIG),
    state: null,
    localPatch: null,
    homerCache: null,
    syncMeta: null,
    quickLinkMeta: {},
    searchEngineMeta: {},
    visitHistory: [],
    frequentVisits: [],
    settingsDraft: null
  };
  app.state = createDefaultState(app.baseConfig);
  app.addVisitHistoryItem = (item) => addVisitHistoryItem(app, item);
  app.applyTheme = () => applyTheme(app);
  app.persistState = persistState;
  app.persistLocalPatch = persistLocalPatch;
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
    await loadSettingsState();
    app.homerCache = normalizeHomerCache(await storageGet(CACHE_KEY));
    app.syncMeta = normalizeSyncMeta(await storageGet(META_KEY));
    app.quickLinkMeta = normalizeQuickLinkMeta(await storageGet(QUICK_LINK_META_KEY));
    app.searchEngineMeta = normalizeSearchEngineMeta(await storageGet(SEARCH_ENGINE_META_KEY));
    app.visitHistory = await loadVisitHistory();
    app.frequentVisits = await loadFrequentVisits(app);
    applyTheme(app);
    renderAll(app);
    focusSearchInput(app);
    void refreshSearchEngineMetadata(app, { force: false });
    void refreshQuickLinkMetadata(app, { force: false });
    await syncHomer(app, { force: false });
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
    refs.homerDisabledInput = byId("homerDisabledInput");
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
        template: "https://example.com/search?q={q}"
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
        url: ""
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
  async function loadSettingsState() {
    const syncState = await storageGet(STATE_KEY, SYNC_AREA);
    let syncedState;
    let shouldPersistSyncedState = false;
    let sourceDefaultEngineId = "";
    if (syncState) {
      syncedState = normalizeSyncedState(syncState, app.baseConfig);
      sourceDefaultEngineId = typeof syncState.search?.defaultEngineId === "string" ? syncState.search.defaultEngineId : "";
      shouldPersistSyncedState = Boolean(sourceDefaultEngineId);
    } else {
      const legacyLocalState = await storageGet(STATE_KEY, LOCAL_AREA);
      if (legacyLocalState) {
        syncedState = normalizeSyncedState(legacyLocalState, app.baseConfig);
        sourceDefaultEngineId = typeof legacyLocalState.search?.defaultEngineId === "string" ? legacyLocalState.search.defaultEngineId : "";
        shouldPersistSyncedState = true;
        await storageRemove(STATE_KEY, LOCAL_AREA);
      } else {
        syncedState = normalizeSyncedState(null, app.baseConfig);
      }
    }
    const rawLocalPatch = await storageGet(LOCAL_PATCH_KEY);
    const localPatch = normalizeLocalPatch(rawLocalPatch, syncedState);
    let shouldPersistLocalPatch = !rawLocalPatch;
    if (!rawLocalPatch && sourceDefaultEngineId) {
      localPatch.search.defaultEngineId = sourceDefaultEngineId;
      shouldPersistLocalPatch = true;
    }
    app.localPatch = normalizeLocalPatch(localPatch, syncedState);
    app.state = applyLocalPatch(syncedState, app.localPatch);
    await Promise.all([
      shouldPersistSyncedState ? persistState() : Promise.resolve(),
      shouldPersistLocalPatch ? persistLocalPatch() : Promise.resolve()
    ]);
  }
  async function persistState() {
    await storageSet(STATE_KEY, createSyncedState(app.state), SYNC_AREA);
  }
  async function persistLocalPatch() {
    app.localPatch = normalizeLocalPatch(app.localPatch, app.state);
    app.state = applyLocalPatch(app.state, app.localPatch);
    await storageSet(LOCAL_PATCH_KEY, app.localPatch, LOCAL_AREA);
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
    const engines = getVisibleSearchEngines(app);
    return engines.find((item) => item.id === app.state.search.defaultEngineId) || engines[0];
  }
  function focusSearchInput(app2) {
    const active = document.activeElement;
    if (active && active !== document.body && active !== app2.refs.searchInput) {
      return;
    }
    app2.refs.searchInput.focus({ preventScroll: true });
  }
  async function runSearch(engine, query) {
    const target = engine.template.replace("{q}", encodeURIComponent(query));
    await addVisitHistoryItem(app, {
      title: `${engine.title}: ${query}`,
      url: target,
      source: "search"
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
    app.localPatch = normalizeLocalPatch(result.localPatch, app.state);
    app.state = applyLocalPatch(app.state, app.localPatch);
    await Promise.all([persistState(), persistLocalPatch()]);
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
    app.localPatch = normalizeLocalPatch(null, app.state);
    app.state = applyLocalPatch(app.state, app.localPatch);
    app.homerCache = null;
    app.quickLinkMeta = {};
    app.searchEngineMeta = {};
    app.visitHistory = [];
    app.frequentVisits = [];
    app.settingsDraft = clone(app.state);
    app.syncMeta = null;
    await Promise.all([
      storageRemove(STATE_KEY, SYNC_AREA),
      storageRemove([LOCAL_PATCH_KEY, CACHE_KEY, META_KEY, QUICK_LINK_META_KEY, SEARCH_ENGINE_META_KEY, HISTORY_KEY], LOCAL_AREA)
    ]);
    renderAll(app);
    renderSettings(app);
    void refreshSearchEngineMetadata(app, { force: true });
    await syncHomer(app, { force: true });
  }
})();
