import { t } from "../i18n.js";
import { getQuickLinkMeta, getQuickLinkTitle, getSearchEngineMeta } from "../metadata.js";
import { getVisibleQuickLinks, getVisibleSearchEngines } from "../state.js";
import { makeInitial } from "../utils.js";

export function renderSearchButtons(app) {
  const { refs } = app;
  refs.searchButtons.replaceChildren();
  const engines = getVisibleSearchEngines(app);
  for (const engine of engines) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-button";
    button.title = engine.title;
    button.setAttribute("aria-label", button.title || t("searchAria"));
    button.classList.toggle("active", engine.id === app.state.search.defaultEngineId);
    button.append(createSearchEngineIcon(app, engine));
    button.addEventListener("click", () => {
      const query = refs.searchInput.value.trim();
      if (query) {
        app.runSearch(engine, query);
        return;
      }
      app.localPatch.search.defaultEngineId = engine.id;
      void app.persistLocalPatch();
      app.state.search.defaultEngineId = engine.id;
      renderSearchButtons(app);
      refs.searchInput.focus();
    });
    refs.searchButtons.append(button);
  }
}

function createSearchEngineIcon(app, engine) {
  const icon = document.createElement("span");
  icon.className = "search-icon";
  const meta = getSearchEngineMeta(app, engine);
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

export function renderQuickLinks(app) {
  app.refs.quickLinks.replaceChildren();
  for (const link of getVisibleQuickLinks(app)) {
    app.refs.quickLinks.append(createQuickLink(app, link));
  }
}

function createQuickLink(app, link) {
  const meta = getQuickLinkMeta(app, link.url);
  const title = getQuickLinkTitle(link, meta);
  const iconDataUrl = meta?.iconDataUrl || "";

  const anchor = document.createElement("a");
  anchor.className = "quick-link";
  anchor.href = link.url;
  anchor.title = title;
  anchor.addEventListener("click", () => {
    void app.addVisitHistoryItem({
      title,
      url: link.url,
      source: "quick",
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
