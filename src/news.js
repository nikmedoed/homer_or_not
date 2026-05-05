import { LOCAL_AREA, NEWS_FEED_CACHE_KEY, NEWS_FEED_FETCH_TIMEOUT_MS } from "./constants.js";
import { LOCALE, t } from "./i18n.js";
import { renderNewsFeedWidgets } from "./render.js";
import {
  fetchJsonWithTimeout,
  fetchTextWithTimeout,
  formatDateTime,
  isCacheFresh,
  isHttpUrl,
  storageSet,
  toDomain,
  toPublicUrl,
} from "./utils.js";

const MAX_SOURCE_ITEMS = 60;
const HN_ITEM_LIMIT = 30;
const shirManPayloadRequests = new Map();

export function normalizeNewsFeedCache(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const rawFeeds = source.feeds && typeof source.feeds === "object" ? source.feeds : {};
  const feeds = {};
  for (const [id, value] of Object.entries(rawFeeds)) {
    const normalized = normalizeSingleFeedCache(value);
    if (normalized) {
      feeds[id] = normalized;
    }
  }

  const legacy = normalizeSingleFeedCache(source);
  if (legacy && !Object.keys(feeds).length) {
    feeds.legacy = legacy;
  }

  return { feeds };
}

export async function syncNewsFeeds(app, { force = false, sourceIds = null } = {}) {
  const sourceFilter = Array.isArray(sourceIds) ? new Set(sourceIds) : null;
  const feeds = getVisibleNewsSources(app).filter((source) => !sourceFilter || sourceFilter.has(source.id));
  if (!feeds.length) {
    app.newsStatuses = {};
    renderNewsFeedWidgets(app);
    return;
  }

  app.newsStatuses = app.newsStatuses || {};
  await Promise.all(feeds.map((source) => syncNewsFeed(app, source, { force })));
}

export function getVisibleNewsSources(app) {
  const disabled = new Set(app.localPatch?.news?.disabledFeedIds || []);
  return (app.state?.news?.sources || []).filter((source) => source.enabled !== false && !disabled.has(source.id));
}

export function getNewsFeedSummary(app, source) {
  const cache = app.newsFeedCache?.feeds?.[source.id] || null;
  return {
    updatedAt: cache?.fetchedAt ? formatUpdatedAt(cache.fetchedAt, { includeDate: false }) : "",
    updatedAtTitle: cache?.fetchedAt ? formatDateTime(cache.fetchedAt) : "",
    items: Array.isArray(cache?.items) ? cache.items : [],
  };
}

export function formatNewsMeta(item, { showAge = true, showDomain = true } = {}) {
  const parts = [];
  const score = formatScore(item);
  if (score) {
    parts.push(score);
  }
  if (item.comments > 0) {
    parts.push(t("newsComments", item.comments));
  }
  const age = formatNewsTime(item);
  if (showAge && age) {
    parts.push(age);
  }
  if (item.tag) {
    parts.push(item.tag);
  }
  if (item.author) {
    parts.push(`@${item.author}`);
  }
  if (showDomain && item.domain) {
    parts.push(item.domain);
  }
  return parts.join(" · ");
}

export function formatNewsTime(item) {
  return formatAge(item?.publishedAt);
}

async function syncNewsFeed(app, source, { force }) {
  const currentCache = app.newsFeedCache?.feeds?.[source.id] || null;
  const queryKey = getNewsFeedQueryKey(source);
  if (!force && isCacheFresh(currentCache, source.syncIntervalMinutes) && currentCache.queryKey === queryKey) {
    app.newsStatuses[source.id] = null;
    renderNewsFeedWidgets(app);
    return;
  }

  app.newsStatuses[source.id] = {
    kind: "loading",
    message: currentCache ? "" : t("newsLoading"),
  };
  renderNewsFeedWidgets(app);

  try {
    const items = sortAndDedupeItems(await fetchNewsSource(source)).slice(0, source.maxItems);
    const normalized = normalizeSingleFeedCache({
      fetchedAt: Date.now(),
      queryKey,
      items,
    });
    if (!normalized) {
      throw new Error(t("newsUnavailable"));
    }
    app.newsFeedCache = normalizeNewsFeedCache(app.newsFeedCache);
    app.newsFeedCache.feeds[source.id] = normalized;
    app.newsStatuses[source.id] = null;
    await storageSet(NEWS_FEED_CACHE_KEY, app.newsFeedCache, LOCAL_AREA);
  } catch (error) {
    app.newsStatuses[source.id] = {
      kind: "error",
      message: error?.message || t("newsUnavailable"),
    };
  }
  renderNewsFeedWidgets(app);
}

function normalizeSingleFeedCache(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const fetchedAt = Number.isFinite(raw.fetchedAt) ? raw.fetchedAt : 0;
  const queryKey = typeof raw.queryKey === "string" ? raw.queryKey : "";
  const items = Array.isArray(raw.items)
    ? raw.items.map(normalizeNewsItem).filter(Boolean).slice(0, MAX_SOURCE_ITEMS)
    : [];
  if (!fetchedAt || !items.length) {
    return null;
  }
  return {
    fetchedAt,
    queryKey,
    items,
  };
}

function getNewsFeedQueryKey(source) {
  return [source.type, source.url, source.sourceKey || "", source.maxItems].join("|");
}

async function fetchNewsSource(source) {
  if (source.type === "hackerNews") {
    return await fetchHackerNews(source);
  }
  if (source.type === "reddit") {
    return await fetchReddit(source);
  }
  if (source.type === "shirMan") {
    return await fetchShirManFeed(source);
  }
  return await fetchRss(source);
}

async function fetchHackerNews(source) {
  const ids = await fetchJsonWithTimeout(source.url, NEWS_FEED_FETCH_TIMEOUT_MS);
  if (!Array.isArray(ids)) {
    throw new Error(t("newsSourceFailed"));
  }
  const origin = new URL(source.url).origin;
  const itemUrls = ids.slice(0, Math.min(HN_ITEM_LIMIT, source.maxItems * 2)).map((id) => `${origin}/v0/item/${id}.json`);
  const results = await Promise.allSettled(itemUrls.map((url) => fetchJsonWithTimeout(url, NEWS_FEED_FETCH_TIMEOUT_MS)));
  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => normalizeHackerNewsItem(result.value, source))
    .filter(Boolean);
}

async function fetchReddit(source) {
  const data = await fetchJsonWithTimeout(source.url, NEWS_FEED_FETCH_TIMEOUT_MS);
  const children = Array.isArray(data?.data?.children) ? data.data.children : [];
  return children.map((child) => normalizeRedditItem(child?.data, source)).filter(Boolean);
}

async function fetchShirManFeed(source) {
  const data = await fetchShirManPayload(source.url);
  const items = Array.isArray(data?.[source.sourceKey]) ? data[source.sourceKey] : [];
  if (!items.length) {
    throw new Error(t("newsSourceFailed"));
  }
  return items.map((item) => normalizeShirManItem(item, source)).filter(Boolean);
}

function fetchShirManPayload(url) {
  if (!shirManPayloadRequests.has(url)) {
    const request = fetchJsonWithTimeout(url, NEWS_FEED_FETCH_TIMEOUT_MS).finally(() => {
      shirManPayloadRequests.delete(url);
    });
    shirManPayloadRequests.set(url, request);
  }
  return shirManPayloadRequests.get(url);
}

async function fetchRss(source) {
  const text = await fetchTextWithTimeout(source.url, NEWS_FEED_FETCH_TIMEOUT_MS);
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error(t("newsSourceFailed"));
  }
  return [...document.querySelectorAll("item, entry")].map((item) => normalizeRssItem(item, source)).filter(Boolean);
}

function normalizeHackerNewsItem(raw, source) {
  if (!raw || raw.type !== "story") {
    return null;
  }
  const title = normalizeText(raw.title);
  const commentsUrl = `https://news.ycombinator.com/item?id=${raw.id}`;
  const url = isHttpUrl(raw.url) ? raw.url : commentsUrl;
  if (!title || !isHttpUrl(url)) {
    return null;
  }
  return normalizeNewsItem({
    id: `${source.id}:${raw.id}`,
    sourceId: source.id,
    sourceTitle: source.title,
    title,
    url,
    commentsUrl,
    domain: toDomain(url),
    author: raw.by,
    description: normalizeText(raw.text),
    score: Number.isFinite(raw.score) ? raw.score : 0,
    comments: Number.isFinite(raw.descendants) ? raw.descendants : 0,
    publishedAt: Number.isFinite(raw.time) ? raw.time * 1000 : 0,
  });
}

function normalizeRedditItem(raw, source) {
  if (!raw || raw.stickied || raw.over_18) {
    return null;
  }
  const title = normalizeText(raw.title);
  const commentsUrl = raw.permalink ? `https://www.reddit.com${raw.permalink}` : "";
  const url = isHttpUrl(commentsUrl) ? commentsUrl : typeof raw.url === "string" ? raw.url : "";
  if (!title || !isHttpUrl(url)) {
    return null;
  }
  return normalizeNewsItem({
    id: `${source.id}:${raw.id || url}`,
    sourceId: source.id,
    sourceTitle: source.title,
    title,
    url,
    commentsUrl,
    domain: raw.subreddit_name_prefixed || toDomain(raw.url) || "reddit",
    author: raw.author,
    tag: raw.link_flair_text,
    description: getRedditDescription(raw),
    imageUrl: getRedditImageUrl(raw),
    score: Number.isFinite(raw.score) ? raw.score : 0,
    comments: Number.isFinite(raw.num_comments) ? raw.num_comments : 0,
    publishedAt: Number.isFinite(raw.created_utc) ? raw.created_utc * 1000 : 0,
  });
}

function normalizeShirManItem(raw, source) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const url = absolutizeUrl(raw.url, source.url);
  const title = normalizeText(raw.title || raw.repo || raw.prompt);
  if (!title || !isHttpUrl(url)) {
    return null;
  }
  const sourceKey = source.sourceKey || "";
  const commentsUrl =
    sourceKey === "hackerNews" && raw.id
      ? `https://news.ycombinator.com/item?id=${raw.id}`
      : absolutizeUrl(raw.comments_url || raw.commentsUrl || "", source.url);
  return normalizeNewsItem({
    id: `${source.id}:${raw.id || url}`,
    sourceId: source.id,
    sourceTitle: source.title,
    title,
    url,
    commentsUrl,
    domain: toDomain(url),
    author: raw.by || raw.author || raw.username || raw.submitter_user,
    tag: getShirManTag(raw),
    description: getShirManDescription(raw),
    imageUrl: getShirManImageUrl(raw, source.url),
    imageWidth: Number.isFinite(raw.width) ? raw.width : 0,
    imageHeight: Number.isFinite(raw.height) ? raw.height : 0,
    score: getShirManScore(raw),
    comments: getShirManCommentCount(raw),
    publishedAt: getShirManPublishedAt(raw),
  });
}

function getShirManDescription(raw) {
  return normalizeText(raw.ai_summary?.tldr || raw.description || raw.prompt);
}

function getShirManImageUrl(raw, baseUrl) {
  return [raw.img_preview, raw.img, raw.img_origin]
    .map((url) => absolutizeUrl(url, baseUrl))
    .find((url) => isUsableImageUrl(url)) || "";
}

function getShirManTag(raw) {
  if (Array.isArray(raw.tags) && raw.tags.length) {
    return raw.tags.map(normalizeText).filter(Boolean).slice(0, 3).join(", ");
  }
  return normalizeText(raw.language || raw.source);
}

function getShirManScore(raw) {
  const value = [raw.stars, raw.score, raw.baseScore, raw.agg_score, raw.score_computed].find(Number.isFinite);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function getShirManCommentCount(raw) {
  const value = [raw.descendants, raw.commentCount, raw.comment_count].find(Number.isFinite);
  return Number.isFinite(value) ? value : 0;
}

function getShirManPublishedAt(raw) {
  if (Number.isFinite(raw.time)) {
    return raw.time * 1000;
  }
  const parsed = Date.parse(raw.postedAt || raw.created_at || raw.pushed_at || raw.inserted_at || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRssItem(item, source) {
  const title = normalizeText(readNodeText(item, "title"));
  const link = readRssLink(item);
  if (!title || !isHttpUrl(link)) {
    return null;
  }
  const timestamp = Date.parse(readNodeText(item, "pubDate") || readNodeText(item, "updated") || readNodeText(item, "published"));
  const rawDescription =
    readNodeTextByLocalNames(item, ["description", "summary", "encoded", "content"]) ||
    readNodeText(item, "description") ||
    readNodeText(item, "summary");
  const description = normalizeText(rawDescription);
  return normalizeNewsItem({
    id: `${source.id}:${link}`,
    sourceId: source.id,
    sourceTitle: source.title,
    title,
    url: link,
    domain: toDomain(link),
    description,
    imageUrl: getRssImageUrl(item, rawDescription, link),
    publishedAt: Number.isFinite(timestamp) ? timestamp : 0,
  });
}

function normalizeNewsItem(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const title = normalizeText(raw.title);
  const url = toPublicUrl(raw.url);
  if (!title || !isHttpUrl(url)) {
    return null;
  }
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : url,
    sourceId: typeof raw.sourceId === "string" ? raw.sourceId : "",
    sourceTitle: typeof raw.sourceTitle === "string" ? raw.sourceTitle : "",
    title,
    url,
    commentsUrl: typeof raw.commentsUrl === "string" && isHttpUrl(raw.commentsUrl) ? raw.commentsUrl : "",
    domain: typeof raw.domain === "string" ? raw.domain : toDomain(url),
    description: truncateDescription(normalizeText(raw.description)),
    imageUrl: typeof raw.imageUrl === "string" && isHttpUrl(raw.imageUrl) ? raw.imageUrl : "",
    imageWidth: Number.isFinite(raw.imageWidth) ? raw.imageWidth : 0,
    imageHeight: Number.isFinite(raw.imageHeight) ? raw.imageHeight : 0,
    author: normalizeText(raw.author),
    tag: normalizeText(raw.tag),
    score: Number.isFinite(raw.score) ? raw.score : 0,
    comments: Number.isFinite(raw.comments) ? raw.comments : 0,
    publishedAt: Number.isFinite(raw.publishedAt) ? raw.publishedAt : 0,
  };
}

function readNodeText(parent, selector) {
  return parent.querySelector(selector)?.textContent || "";
}

function readNodeTextByLocalNames(parent, localNames) {
  const wanted = new Set(localNames);
  for (const node of parent.querySelectorAll("*")) {
    if (wanted.has(node.localName)) {
      const value = node.textContent || "";
      if (value.trim()) {
        return value;
      }
    }
  }
  return "";
}

function readRssLink(item) {
  const link = readNodeText(item, "link").trim();
  if (link) {
    return link;
  }
  return item.querySelector("link[href]")?.getAttribute("href") || "";
}

function getRssImageUrl(item, rawDescription, baseUrl) {
  for (const mediaNode of findNodesByLocalName(item, ["thumbnail", "content"])) {
    const mediaUrl = mediaNode.getAttribute("url") || "";
    if (isUsableImageUrl(mediaUrl, mediaNode.getAttribute("type"), mediaNode.getAttribute("medium"))) {
      return absolutizeUrl(mediaUrl, baseUrl);
    }
  }

  for (const enclosure of item.querySelectorAll("enclosure[url]")) {
    const url = enclosure.getAttribute("url") || "";
    if (isUsableImageUrl(url, enclosure.getAttribute("type"), enclosure.getAttribute("medium"))) {
      return absolutizeUrl(url, baseUrl);
    }
  }

  return readFirstImageFromHtml(rawDescription, baseUrl);
}

function getRedditImageUrl(raw) {
  const candidates = [
    raw.thumbnail,
    raw.url_overridden_by_dest,
    raw.preview?.images?.[0]?.source?.url,
  ];
  const imageUrl = candidates.map(decodeHtmlEntities).find((url) => isUsableImageUrl(url));
  return imageUrl || "";
}

function getRedditDescription(raw) {
  const crosspost = Array.isArray(raw.crosspost_parent_list) ? raw.crosspost_parent_list[0] : null;
  const text = [
    raw.selftext,
    raw.selftext_html,
    crosspost?.selftext,
    crosspost?.selftext_html,
  ]
    .map(decodeHtmlEntities)
    .map(normalizeText)
    .find(Boolean);
  if (text) {
    return text;
  }
  const flair = normalizeText(raw.link_flair_text);
  const domain = toDomain(raw.url);
  const details = [flair, domain && domain !== "reddit.com" ? domain : ""].filter(Boolean);
  if (details.length) {
    return details.join(" · ");
  }
  return "";
}

function findNodesByLocalName(parent, localNames) {
  const wanted = new Set(localNames);
  const matches = [];
  for (const node of parent.querySelectorAll("*")) {
    if (wanted.has(node.localName)) {
      matches.push(node);
    }
  }
  return matches;
}

function readFirstImageFromHtml(value, baseUrl) {
  const html = String(value || "");
  if (!html.includes("<img")) {
    return "";
  }
  const document = new DOMParser().parseFromString(html, "text/html");
  const src = document.querySelector("img[src]")?.getAttribute("src") || "";
  return isUsableImageUrl(src) ? absolutizeUrl(src, baseUrl) : "";
}

function isUsableImageUrl(url, type = "", medium = "") {
  const value = decodeHtmlEntities(url);
  if (!value || !isHttpUrl(value)) {
    return false;
  }
  const normalizedType = String(type || "").toLowerCase();
  const normalizedMedium = String(medium || "").toLowerCase();
  return (
    normalizedType.startsWith("image/") ||
    normalizedMedium === "image" ||
    /\.(avif|gif|jpe?g|png|webp)(\?|#|$)/i.test(value)
  );
}

function absolutizeUrl(url, baseUrl) {
  const value = decodeHtmlEntities(url);
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateDescription(value) {
  if (value.length <= 260) {
    return value;
  }
  return `${value.slice(0, 257).trim()}...`;
}

function sortAndDedupeItems(items) {
  const seen = new Set();
  const out = [];
  for (const item of items.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))) {
    const key = item.url.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(item);
  }
  return out;
}

function formatScore(item) {
  if (!Number.isFinite(item?.score) || item.score <= 0) {
    return "";
  }
  if (item.sourceId === "hacker-news") {
    return t("newsPoints", item.score);
  }
  return t("newsScore", item.score);
}

function formatAge(timestamp) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "";
  }
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) {
    return LOCALE === "ru" ? `${Math.max(1, minutes)} мин.` : `${Math.max(1, minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return LOCALE === "ru" ? `${hours} ч.` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return LOCALE === "ru" ? `${days} дн.` : `${days}d`;
}

function formatUpdatedAt(timestamp, { includeDate }) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }
  const locale = LOCALE === "ru" ? "ru-RU" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...(includeDate ? { day: "2-digit", month: "2-digit" } : {}),
  }).format(date);
}
