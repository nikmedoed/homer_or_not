import { ICONS, normalizeSectionIcon } from "../homer.js";
import { t } from "../i18n.js";
import { formatDateTime, makeInitial } from "../utils.js";

export function renderServices(app, services, emptyMessage = "") {
  app.refs.servicesGrid.replaceChildren();
  if (!services.length) {
    if (!emptyMessage) {
      return;
    }
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = emptyMessage;
    app.refs.servicesGrid.append(empty);
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
      card.append(createServiceRow(app, item, group));
    }

    article.append(heading, card);
    app.refs.servicesGrid.append(article);
  }
}

function createSectionIcon(group) {
  const span = document.createElement("span");
  span.className = "section-icon";
  if (group.logo) {
    const image = document.createElement("img");
    image.src = group.logo;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.remove();
      const normalized = normalizeSectionIcon(group.icon, group.name);
      span.innerHTML = ICONS[normalized] || ICONS.network;
    });
    span.append(image);
    return span;
  }
  const normalized = normalizeSectionIcon(group.icon, group.name);
  span.innerHTML = ICONS[normalized] || ICONS.network;
  return span;
}

function createServiceRow(app, item, group) {
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
  anchor.addEventListener("click", () => {
    void app.addVisitHistoryItem({
      title: item.name || item.url,
      url: item.url,
      source: "homer",
    });
  });

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
