import {
  GITHUB_TRENDING_CACHE_KEY,
  GITHUB_TRENDING_FETCH_TIMEOUT_MS,
  GITHUB_TRENDING_SYNC_INTERVAL_MINUTES,
  LOCAL_AREA,
} from "./constants.js";
import { LOCALE, t } from "./i18n.js";
import { renderGitHubTrending } from "./render.js";
import { fetchJsonWithTimeout, isCacheFresh, storageSet } from "./utils.js";

const SEARCH_URL = "https://api.github.com/search/repositories";
const MAX_ITEMS = 12;
const SEARCH_PAGE_SIZE = 100;
const MIN_STARS = 50;
const CREATED_WITHIN_DAYS = 90;

export function normalizeGitHubTrendingCache(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const fetchedAt = Number.isFinite(raw.fetchedAt) ? raw.fetchedAt : 0;
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeTrendingItem).filter(Boolean).slice(0, MAX_ITEMS) : [];
  if (!fetchedAt || !items.length) {
    return null;
  }
  return {
    fetchedAt,
    queryKey: typeof raw.queryKey === "string" ? raw.queryKey : "",
    items,
  };
}

export async function syncGitHubTrending(app, { force = false } = {}) {
  if (app.localPatch?.githubTrending?.disabled) {
    app.githubTrendingStatus = null;
    renderGitHubTrending(app);
    return;
  }

  if (
    !force &&
    isCacheFresh(app.githubTrendingCache, GITHUB_TRENDING_SYNC_INTERVAL_MINUTES) &&
    app.githubTrendingCache.queryKey === getTrendingQueryKey(app)
  ) {
    app.githubTrendingStatus = null;
    renderGitHubTrending(app);
    return;
  }

  app.githubTrendingStatus = {
    kind: "loading",
    message: app.githubTrendingCache ? "" : t("githubTrendingLoading"),
  };
  renderGitHubTrending(app);

  try {
    const query = getTrendingQuery();
    const queryKey = getTrendingQueryKey(app);
    const data = await fetchTrendingRepositories(query);
    app.githubTrendingCache = normalizeGitHubTrendingCache({
      fetchedAt: Date.now(),
      queryKey,
      items: filterExcludedRepositories(Array.isArray(data?.items) ? data.items : [], getExcludedTerms(app)).slice(
        0,
        MAX_ITEMS,
      ),
    });
    if (!app.githubTrendingCache) {
      throw new Error(t("githubTrendingUnavailable"));
    }
    app.githubTrendingStatus = null;
    await storageSet(GITHUB_TRENDING_CACHE_KEY, app.githubTrendingCache, LOCAL_AREA);
  } catch (error) {
    app.githubTrendingStatus = {
      kind: "error",
      message: error?.message || t("githubTrendingUnavailable"),
    };
  }
  renderGitHubTrending(app);
}

export function getGitHubTrendingSummary(cache) {
  const updatedAt = cache?.fetchedAt ? formatUpdatedAt(cache.fetchedAt, { includeDate: false }) : "";
  return {
    updatedAt,
    updatedAtTitle: cache?.fetchedAt ? formatUpdatedAt(cache.fetchedAt, { includeDate: true }) : "",
    items: Array.isArray(cache?.items) ? cache.items : [],
  };
}

function normalizeTrendingItem(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const fullName = typeof raw.full_name === "string" ? raw.full_name.trim() : "";
  const url = typeof raw.html_url === "string" ? raw.html_url.trim() : "";
  if (!name || !fullName || !url) {
    return null;
  }
  return {
    name,
    fullName,
    url,
    description: normalizeDescription(raw.description),
    language: typeof raw.language === "string" ? raw.language.trim() : "",
    stars: Number.isFinite(raw.stargazers_count) ? raw.stargazers_count : 0,
    createdAt: typeof raw.created_at === "string" ? raw.created_at : "",
    pushedAt: typeof raw.pushed_at === "string" ? raw.pushed_at : "",
    ownerAvatarUrl: typeof raw.owner?.avatar_url === "string" ? raw.owner.avatar_url : "",
  };
}

function normalizeDescription(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTrendingQuery() {
  const createdAfter = new Date(Date.now() - CREATED_WITHIN_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return [`created:>=${createdAfter}`, `stars:>=${MIN_STARS}`, "archived:false", "fork:false", "topic:developer-tools"].join(
    " ",
  );
}

function getTrendingQueryKey(app) {
  return [getTrendingQuery(), ...getExcludedTerms(app).map((term) => `-${term}`)].join(" ");
}

function getExcludedTerms(app) {
  return Array.isArray(app.state?.githubTrending?.excludedTerms) ? app.state.githubTrending.excludedTerms : [];
}

function filterExcludedRepositories(items, excludedTerms) {
  if (!excludedTerms.length) {
    return items;
  }
  return items.filter((item) => !matchesExcludedTerm(item, excludedTerms));
}

function matchesExcludedTerm(item, excludedTerms) {
  const haystack = [item?.full_name, item?.name, item?.description, ...(Array.isArray(item?.topics) ? item.topics : [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return excludedTerms.some((term) => matchesTerm(haystack, term));
}

function matchesTerm(haystack, term) {
  const normalized = String(term || "").toLowerCase();
  if (!normalized) {
    return false;
  }
  if (/^[a-z0-9]+$/.test(normalized)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalized)}([^a-z0-9]|$)`, "i").test(haystack);
  }
  return haystack.includes(normalized);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchTrendingRepositories(query) {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(SEARCH_PAGE_SIZE));
  url.searchParams.set("page", "1");
  return await fetchJsonWithTimeout(url.href, GITHUB_TRENDING_FETCH_TIMEOUT_MS);
}

export function formatStars(value) {
  const stars = Number(value);
  if (!Number.isFinite(stars) || stars <= 0) {
    return "";
  }
  if (stars >= 1000) {
    const compact = stars / 1000;
    return `${compact >= 10 ? Math.round(compact) : compact.toFixed(1)}k`;
  }
  return String(Math.round(stars));
}

export function formatRepositoryAge(item) {
  const timestamp = Date.parse(item?.createdAt || "");
  if (!Number.isFinite(timestamp)) {
    return "";
  }
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));
  if (LOCALE === "ru") {
    if (days < 1) {
      return "сегодня";
    }
    if (days === 1) {
      return "1 день";
    }
    return `${days} дн.`;
  }
  if (days < 1) {
    return "today";
  }
  return days === 1 ? "1 day" : `${days} days`;
}

function formatUpdatedAt(timestamp, { includeDate }) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const locale = LOCALE === "ru" ? "ru-RU" : "en-GB";
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  if (includeDate || !isToday) {
    options.day = "2-digit";
    options.month = "2-digit";
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
}
