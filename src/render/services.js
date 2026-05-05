import { CACHE_KEY, LOCAL_AREA } from "../constants.js";
import { ICONS, normalizeSectionIcon } from "../homer.js";
import { t } from "../i18n.js";
import { updateWidgetLayoutState } from "../layout.js";
import { formatDateTime, makeInitial, storageSet } from "../utils.js";

const SERVICES_RENDER_VERSION = "servicesGrid:v1";

export function renderServices(app, services, emptyMessage = "") {
  const grid = app.refs.servicesGrid;
  ensureServiceGridEvents(app);
  grid.replaceChildren();
  grid.classList.toggle("hidden", !services.length && !emptyMessage);
  if (!services.length) {
    if (!emptyMessage) {
      updateWidgetLayoutState(app);
      return;
    }
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = emptyMessage;
    grid.append(empty);
    updateWidgetLayoutState(app);
    return;
  }

  if (canUseCachedServicesHtml(app, services)) {
    grid.innerHTML = app.homerCache.servicesHtml;
    updateWidgetLayoutState(app);
    return;
  }

  for (const group of services) {
    const article = document.createElement("article");
    article.className = "service-group";
    addClassTokens(article, group.className);

    const heading = document.createElement("h2");
    heading.className = "service-heading";
    heading.append(createSectionIcon(group), document.createTextNode(group.name || t("miscellaneous")));

    const card = document.createElement("div");
    card.className = "service-card";
    for (const item of group.items) {
      card.append(createServiceRow(item, group));
    }

    article.append(heading, card);
    grid.append(article);
  }
  saveServicesHtml(app, services, grid.innerHTML);
  updateWidgetLayoutState(app);
}

function createSectionIcon(group) {
  const span = document.createElement("span");
  span.className = "section-icon";
  if (group.logo) {
    const image = document.createElement("img");
    image.src = group.logo;
    image.alt = "";
    image.loading = "lazy";
    image.dataset.sectionIcon = normalizeSectionIcon(group.icon, group.name);
    span.append(image);
    return span;
  }
  const normalized = normalizeSectionIcon(group.icon, group.name);
  span.innerHTML = ICONS[normalized] || ICONS.network;
  return span;
}

function createServiceRow(item, group) {
  const anchor = document.createElement("a");
  anchor.className = "service-row";
  addClassTokens(anchor, group.className);
  addClassTokens(anchor, item.className);
  anchor.href = item.url;
  anchor.target = item.target || "_self";
  if (anchor.target !== "_self") {
    anchor.rel = "noreferrer";
  }
  anchor.title = item.name;
  anchor.dataset.serviceTitle = item.name || item.url;
  anchor.dataset.serviceUrl = item.url;

  const content = document.createElement("span");
  content.className = "service-content";

  const media = document.createElement("span");
  media.className = "service-media";
  media.classList.toggle("no-subtitle", !item.subtitle);

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
    image.dataset.initial = makeInitial(item.name);
    logo.append(image);
  } else {
    logo.textContent = makeInitial(item.name);
  }

  const body = document.createElement("span");
  body.className = "service-body";

  const text = document.createElement("span");
  text.className = "service-title";
  text.textContent = item.name || item.url;

  body.append(text);
  if (item.subtitle) {
    const subtitle = document.createElement("span");
    subtitle.className = "service-subtitle";
    subtitle.textContent = item.subtitle;
    body.append(subtitle);
  }
  media.append(logo, body);
  content.append(media);

  if (item.tag) {
    const tag = document.createElement("span");
    tag.className = "service-tag";
    addClassTokens(tag, item.tagstyle);
    const tagText = document.createElement("strong");
    tagText.className = "service-tag-text";
    tagText.textContent = `#${item.tag}`;
    tag.append(tagText);
    content.append(tag);
  }

  anchor.append(content);
  return anchor;
}

function addClassTokens(element, value) {
  if (!value) {
    return;
  }
  element.classList.add(...String(value).split(/\s+/).filter(Boolean));
}

export function getVisibleServices(app) {
  if (app.localPatch?.homer?.disabled || !app.state.homer.url) {
    return [];
  }
  if (app.homerCache?.services?.length) {
    return app.homerCache.services;
  }
  return [];
}

export function getEmptyServicesMessage(app) {
  return "";
}

export function setStatusFromCurrentData(app) {
  if (app.localPatch?.homer?.disabled) {
    setStatus(app, "local", "off", t("homerDisabled"));
    return;
  }
  if (!app.state.homer.url) {
    setStatus(app, "local", "no url", t("homerUrlMissing"));
    return;
  }
  if (app.homerCache?.services?.length) {
    setStatus(app, "cache", "cache", t("homerCache", formatDateTime(app.homerCache.fetchedAt)));
    return;
  }
  setStatus(app, "local", app.homerCache?.services?.length ? "away" : "no homer", getEmptyServicesMessage(app));
}

export function setStatus(app, kind, text, title) {
  app.refs.statusButton.dataset.status = kind;
  app.refs.statusText.textContent = text;
  app.refs.statusButton.title = title;
}

function ensureServiceGridEvents(app) {
  const grid = app.refs.servicesGrid;
  if (grid.dataset.eventsBound === "true") {
    return;
  }
  grid.dataset.eventsBound = "true";
  grid.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const anchor = event.target.closest("a[data-service-url]");
    if (!anchor || !grid.contains(anchor)) {
      return;
    }
    void app.addVisitHistoryItem({
      title: anchor.dataset.serviceTitle || anchor.textContent || anchor.href,
      url: anchor.dataset.serviceUrl || anchor.href,
      source: "homer",
    });
  });
  grid.addEventListener(
    "error",
    (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) {
        return;
      }
      if (image.dataset.sectionIcon) {
        const holder = image.closest(".section-icon");
        if (holder) {
          holder.innerHTML = ICONS[image.dataset.sectionIcon] || ICONS.network;
        }
        return;
      }
      const fallbackLogo = image.dataset.fallbackLogo;
      if (fallbackLogo && image.src !== fallbackLogo) {
        image.src = fallbackLogo;
        delete image.dataset.fallbackLogo;
        return;
      }
      const holder = image.closest(".service-logo");
      if (holder) {
        image.remove();
        holder.textContent = image.dataset.initial || "?";
      }
    },
    true,
  );
}

function canUseCachedServicesHtml(app, services) {
  const cache = app.homerCache;
  return Boolean(
    cache?.services === services &&
      cache.servicesHtml &&
      cache.renderKey === getServicesRenderKey(cache),
  );
}

function saveServicesHtml(app, services, servicesHtml) {
  const cache = app.homerCache;
  if (!cache || cache.services !== services || !servicesHtml) {
    return;
  }
  const renderKey = getServicesRenderKey(cache);
  if (cache.renderKey === renderKey && cache.servicesHtml === servicesHtml) {
    return;
  }
  cache.renderKey = renderKey;
  cache.servicesHtml = servicesHtml;
  scheduleHomerCachePersist(app);
}

function getServicesRenderKey(cache) {
  return [SERVICES_RENDER_VERSION, cache?.sourceUrl || "", cache?.fetchedAt || 0, cache?.theme || ""].join("|");
}

function scheduleHomerCachePersist(app) {
  if (app.homerCachePersistTimer) {
    return;
  }
  app.homerCachePersistTimer = window.setTimeout(() => {
    app.homerCachePersistTimer = 0;
    if (app.homerCache) {
      void storageSet(CACHE_KEY, app.homerCache, LOCAL_AREA);
    }
  }, 250);
}
