import { formatNewsMeta, formatNewsTime, getNewsFeedSummary, getVisibleNewsSources } from "../news.js";
import { getNewsWidgetId } from "../state.js";
import { t } from "../i18n.js";
import { updateWidgetLayoutState } from "../layout.js";
import { renderFeedWidget } from "./feed-widget.js";

export function renderNewsFeedWidgets(app) {
  const { refs } = app;
  if (!refs.servicesLayout) {
    return;
  }
  refs.newsWidgetNodes = refs.newsWidgetNodes || {};

  const visibleIds = new Set(getVisibleNewsSources(app).map((source) => source.id));
  for (const [id, node] of Object.entries(refs.newsWidgetNodes)) {
    if (!visibleIds.has(id)) {
      node.classList.add("hidden");
    }
  }

  for (const source of getVisibleNewsSources(app)) {
    const section = getOrCreateNewsSection(app, source);
    const summary = getNewsFeedSummary(app, source);
    const status = app.newsStatuses?.[source.id] || null;
    renderFeedWidget({
      section,
      list: section.querySelector("[data-feed-list]"),
      meta: section.querySelector("[data-feed-meta]"),
      refreshButton: section.querySelector("[data-feed-refresh]"),
      title: source.title,
      sourceLabel: source.title,
      status,
      items: summary.items,
      emptyText: t("newsUnavailable"),
      sourceText: source.title,
      updatedText: summary.updatedAt ? t("newsUpdated", summary.updatedAt) : source.title,
      staleText: summary.updatedAt ? t("newsStale", summary.updatedAt) : t("newsUnavailable"),
      updatedTitle: summary.updatedAtTitle,
      createRow: (item) => createNewsRow(app, item, source),
    });
  }
  updateWidgetLayoutState(app);
}

function getOrCreateNewsSection(app, source) {
  const { refs } = app;
  if (refs.newsWidgetNodes[source.id]) {
    return refs.newsWidgetNodes[source.id];
  }

  const section = document.createElement("section");
  section.id = `newsWidget-${source.id}`;
  section.className = `feed-widget news-widget news-widget-${source.type}`;
  if (source.sourceKey) {
    section.classList.add(`news-widget-source-${source.sourceKey}`);
  }
  section.dataset.widgetId = getNewsWidgetId(source.id);

  const header = document.createElement("header");
  header.className = "feed-header news-header";

  const heading = document.createElement("h2");
  heading.dataset.feedTitle = "";
  heading.textContent = source.title;

  const meta = document.createElement("div");
  meta.className = "feed-meta news-meta";
  meta.dataset.feedMeta = "";

  const refresh = document.createElement("button");
  refresh.className = "icon-button feed-refresh news-refresh";
  refresh.type = "button";
  refresh.title = t("refreshNewsSource", source.title);
  refresh.dataset.feedRefresh = "";
  refresh.textContent = "↻";
  refresh.addEventListener("click", () => {
    void app.syncNewsFeed(source.id, { force: true });
  });

  const list = document.createElement("div");
  list.className = "feed-list news-list";
  list.dataset.feedList = "";

  header.append(heading, meta, refresh);
  section.append(header, list);
  refs.newsWidgetNodes[source.id] = section;
  refs.servicesLayout.append(section);
  return section;
}

function createNewsRow(app, item, source) {
  const isImageFeed = source.sourceKey === "midjourney";
  const anchor = document.createElement("a");
  anchor.className = `news-row news-row-${source.type}`;
  if (source.sourceKey) {
    anchor.classList.add(`news-row-source-${source.sourceKey}`);
  }
  anchor.href = item.url;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.title = item.description || item.title;
  anchor.addEventListener("click", () => {
    void app.addVisitHistoryItem({
      title: item.title,
      url: item.url,
      source: `news:${source.id}`,
    });
  });

  if (item.imageUrl) {
    anchor.classList.add("news-row-has-thumb");
    const media = document.createElement("span");
    media.className = "news-thumb";
    if (isImageFeed && item.imageWidth > 0 && item.imageHeight > 0) {
      media.style.aspectRatio = `${item.imageWidth} / ${item.imageHeight}`;
    }

    const image = document.createElement("img");
    image.src = item.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    if (item.imageWidth > 0 && item.imageHeight > 0) {
      image.width = item.imageWidth;
      image.height = item.imageHeight;
    }
    image.addEventListener("error", () => {
      anchor.classList.remove("news-row-has-thumb");
      media.remove();
    });

    media.append(image);
    anchor.append(media);
  }

  const body = document.createElement("span");
  body.className = "news-body";

  const titleLine = document.createElement("span");
  titleLine.className = "news-title-line";

  const title = document.createElement("span");
  title.className = "news-title";
  title.textContent = item.title;
  titleLine.append(title);

  const inlineTime = source.type === "rss" ? formatNewsTime(item) : "";
  if (inlineTime) {
    const time = document.createElement("span");
    time.className = "news-title-time";
    time.textContent = inlineTime;
    titleLine.append(time);
  }

  const meta = document.createElement("span");
  meta.className = "news-item-meta";
  meta.textContent = formatNewsMeta(item, { showAge: source.type !== "rss", showDomain: source.type !== "rss" });

  body.append(titleLine);
  if (item.description && !isImageFeed) {
    const description = document.createElement("span");
    description.className = "news-description";
    description.textContent = item.description;
    body.append(description);
  }
  if (meta.textContent && !isImageFeed) {
    body.append(meta);
  }
  anchor.append(body);
  return anchor;
}
