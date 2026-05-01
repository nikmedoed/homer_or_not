import { filterFrequentVisits } from "../history.js";
import { t } from "../i18n.js";
import { getVisibleQuickLinks } from "../state.js";
import { formatFrequentMeta, formatHistoryMeta, normalizeUrlKey, toDomain } from "../utils.js";

export function renderVisitPanels(app) {
  renderVisitList({
    panel: app.refs.frequentPanel,
    list: app.refs.frequentList,
    items: filterFrequentVisits(app, app.frequentVisits),
    isEnabled: app.localPatch?.visits?.showFrequent !== false,
    metaFormatter: formatFrequentMeta,
    showVisitCount: true,
    app,
  });
  renderVisitList({
    panel: app.refs.historyPanel,
    list: app.refs.historyList,
    items: app.visitHistory,
    isEnabled: app.localPatch?.visits?.showRecent !== false,
    metaFormatter: formatHistoryMeta,
    showAddButton: true,
    hideAddedAction: true,
    app,
  });
}

function renderVisitList({
  panel,
  list,
  items,
  isEnabled = true,
  metaFormatter,
  showVisitCount = false,
  showAddButton = false,
  hideAddedAction = false,
  app,
}) {
  list.replaceChildren();
  const isEmpty = !isEnabled || !items.length;
  panel.classList.toggle("hidden", isEmpty);
  if (isEmpty) {
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "visit-row";

    const anchor = document.createElement("a");
    anchor.className = "visit-link";
    anchor.href = item.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.title = item.url;
    anchor.addEventListener("click", () => {
      void app.addVisitHistoryItem(item);
    });

    const title = document.createElement("span");
    title.className = "visit-title";
    title.textContent = item.title || toDomain(item.url) || item.url;

    const meta = document.createElement("span");
    meta.className = "visit-meta";
    meta.textContent = metaFormatter(item);

    anchor.append(title, meta);
    row.append(anchor);

    if (showVisitCount || showAddButton) {
      const action = createVisitAddButton(app, item, { showVisitCount, hideAddedAction });
      if (action) {
        row.append(action);
      }
    }
    list.append(row);
  }
}

function createVisitAddButton(app, item, { showVisitCount, hideAddedAction }) {
  const isAdded = hasVisibleQuickLink(app, item.url);
  if (hideAddedAction && isAdded) {
    return null;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = showVisitCount ? "visit-action visit-count" : "visit-action visit-add";
  if (showVisitCount && Number.isFinite(item.visitCount) && item.visitCount > 0) {
    button.textContent = String(item.visitCount);
  } else {
    button.append(createPlusIcon());
  }
  button.title = t("quickAddLinkTooltip");
  button.setAttribute("aria-label", t("quickAddLinkAria", item.title || toDomain(item.url) || item.url));

  if (isAdded) {
    button.disabled = true;
    button.title = t("quickLinkAlreadyAdded");
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof app.addQuickLinkFromVisit === "function") {
      void app.addQuickLinkFromVisit(item);
    }
  });
  return button;
}

function createPlusIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "visit-add-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");

  const horizontal = document.createElementNS("http://www.w3.org/2000/svg", "path");
  horizontal.setAttribute("d", "M5 12h14");

  const vertical = document.createElementNS("http://www.w3.org/2000/svg", "path");
  vertical.setAttribute("d", "M12 5v14");

  icon.append(horizontal, vertical);
  return icon;
}

function hasVisibleQuickLink(app, url) {
  const key = normalizeUrlKey(url);
  if (!key) {
    return false;
  }
  return getVisibleQuickLinks(app).some((link) => normalizeUrlKey(link.url) === key);
}
