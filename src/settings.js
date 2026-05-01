import { FALLBACK_CONFIG } from "./default-config.js";
import { deriveHomerEndpoints } from "./homer.js";
import { t } from "./i18n.js";
import { WIDGET_LABEL_KEYS } from "./layout.js";
import {
  createSyncedState,
  getNewsWidgetId,
  normalizeGitHubTrendingSettings,
  normalizeLocalPatch,
  normalizeNewsSettings,
  normalizeState,
  normalizeWeatherSettings,
  normalizeVisitSettings,
  normalizeWidgetOrder,
} from "./state.js";
import { clone, isHttpUrl, makeId } from "./utils.js";

export function openSettings(app) {
  app.settingsDraft = clone(app.state);
  app.localPatchDraft = clone(app.localPatch);
  renderSettings(app);
  app.refs.settingsOverlay.classList.remove("hidden");
  app.refs.widgetRows.querySelector("input")?.focus();
}

export function closeSettings(app) {
  app.refs.settingsOverlay.classList.add("hidden");
  app.settingsDraft = null;
  app.localPatchDraft = null;
}

export function renderSettings(app) {
  if (!app.settingsDraft) {
    return;
  }
  renderEngineSettings(app);
  renderQuickLinkSettings(app);
  renderWidgetSettings(app);
  app.refs.topWeatherEnabledInput.checked = app.localPatchDraft?.weather?.topDisabled !== true;
  app.refs.weatherLocationInput.value = app.localPatchDraft?.weather?.locationName || "";
  app.refs.topWeatherPlacementInput.value = app.settingsDraft.weather.topWidgetPlacement;
  app.refs.showFrequentVisitsInput.checked = app.localPatchDraft?.visits?.showFrequent !== false;
  app.refs.showRecentVisitsInput.checked = app.localPatchDraft?.visits?.showRecent !== false;
  app.refs.frequentHistoryPoolInput.value = String(app.settingsDraft.visits.frequentHistoryPool);
  app.refs.frequentMinVisitsInput.value = String(app.settingsDraft.visits.frequentMinVisits);
}

function renderWidgetSettings(app) {
  const { refs } = app;
  const localPatchDraft = ensureLocalPatchDraft(app);
  const order = normalizeWidgetOrder(localPatchDraft.widgets?.order, app.settingsDraft);
  localPatchDraft.widgets.order = order;
  refs.widgetRows.replaceChildren();
  refs.widgetRows.append(createWidgetHeaderRow());
  for (const [index, id] of order.entries()) {
    const row = document.createElement("div");
    row.className = "settings-row widget-row";
    const dragHandle = createDragHandle();
    attachReorderHandlers(row, dragHandle, order, index, () => {
      localPatchDraft.widgets.order = order;
      renderSettings(app);
    });

    const enabledWrap = createCheckField(t("localEnabled"), isWidgetEnabled(localPatchDraft, id));

    const source = getNewsSourceForWidget(app, id);
    if (source) {
      row.classList.add("news-widget-row");
      const title = source.type === "rss" ? createInput(t("inputTitle"), source.title) : createStaticCell(source.title);
      const url = createInput("URL", source.url, "url");
      const interval = createInput(t("newsSyncInterval"), source.syncIntervalMinutes, "number");
      interval.min = "15";
      interval.max = "1440";
      interval.step = "15";
      const remove = source.type === "rss" ? createSmallButton("×", t("remove")) : createEmptyCell();

      if (source.type === "rss") {
        title.addEventListener("input", () => {
          source.title = title.value;
        });
        remove.addEventListener("click", () => {
          app.settingsDraft.news.sources = app.settingsDraft.news.sources.filter((item) => item.id !== source.id);
          updateDisabledId(localPatchDraft.news.disabledFeedIds, source.id, false);
          localPatchDraft.widgets.order = normalizeWidgetOrder(localPatchDraft.widgets?.order, app.settingsDraft);
          renderSettings(app);
        });
      }
      url.addEventListener("input", () => {
        source.url = url.value;
      });
      interval.addEventListener("input", () => {
        source.syncIntervalMinutes = interval.value;
      });
      enabledWrap.input.addEventListener("change", () => {
        source.enabled = enabledWrap.input.checked;
        setWidgetEnabled(localPatchDraft, id, enabledWrap.input.checked);
        renderSettings(app);
      });

      row.append(dragHandle, title, url, interval, enabledWrap.label, remove);
    } else if (id === "services") {
      row.classList.add("homer-widget-row");
      const name = document.createElement("strong");
      name.textContent = getWidgetLabel(app, id);
      const url = createInput("URL", app.settingsDraft.homer.url, "url");
      url.placeholder = "http://192.168.1.28/";
      url.addEventListener("input", () => {
        app.settingsDraft.homer.url = url.value;
      });
      enabledWrap.input.addEventListener("change", () => {
        setWidgetEnabled(localPatchDraft, id, enabledWrap.input.checked);
        renderSettings(app);
      });
      row.append(dragHandle, name, url, createEmptyCell(), enabledWrap.label, createEmptyCell());
    } else if (id === "githubTrending") {
      row.classList.add("github-widget-row");
      const name = document.createElement("strong");
      name.textContent = getWidgetLabel(app, id);
      const interval = createInput(t("githubTrendingSyncInterval"), app.settingsDraft.githubTrending.syncIntervalMinutes, "number");
      interval.min = "15";
      interval.max = "1440";
      interval.step = "15";
      const exclude = createInput(t("githubTrendingExcludedTerms"), app.settingsDraft.githubTrending.excludedTerms.join(", "));
      exclude.placeholder = t("githubTrendingExcludedTermsPlaceholder");
      interval.addEventListener("input", () => {
        app.settingsDraft.githubTrending.syncIntervalMinutes = interval.value;
      });
      exclude.addEventListener("input", () => {
        app.settingsDraft.githubTrending.excludedTerms = exclude.value;
      });
      enabledWrap.input.addEventListener("change", () => {
        setWidgetEnabled(localPatchDraft, id, enabledWrap.input.checked);
        renderSettings(app);
      });
      row.append(dragHandle, name, exclude, interval, enabledWrap.label, createEmptyCell());
    } else {
      enabledWrap.input.addEventListener("change", () => {
        setWidgetEnabled(localPatchDraft, id, enabledWrap.input.checked);
        renderSettings(app);
      });
      const name = document.createElement("strong");
      name.textContent = getWidgetLabel(app, id);
      row.append(dragHandle, name, createEmptyCell(), createEmptyCell(), enabledWrap.label, createEmptyCell());
    }
    refs.widgetRows.append(row);
  }
}

function createWidgetHeaderRow() {
  const row = document.createElement("div");
  row.className = "settings-row widget-row widget-label-row";
  for (const text of ["", t("widgetName"), t("widgetConfig"), t("widgetCache"), t("widgetVisible"), ""]) {
    const cell = document.createElement("span");
    cell.textContent = text;
    row.append(cell);
  }
  return row;
}

function renderEngineSettings(app) {
  const { refs, settingsDraft } = app;
  const localPatchDraft = ensureLocalPatchDraft(app);
  refs.engineRows.replaceChildren();
  for (const [index, engine] of settingsDraft.search.engines.entries()) {
    const row = document.createElement("div");
    row.className = "settings-row engine-row";
    const dragHandle = createDragHandle();
    attachReorderHandlers(row, dragHandle, settingsDraft.search.engines, index, () => renderSettings(app));

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
    const remove = createSmallButton("×", t("remove"));

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
      renderSettings(app);
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
      renderSettings(app);
    });

    row.append(dragHandle, title, template, enabledWrap.label, defaultWrap, remove);
    refs.engineRows.append(row);
  }
}

function renderQuickLinkSettings(app) {
  const { refs, settingsDraft } = app;
  const localPatchDraft = ensureLocalPatchDraft(app);
  refs.quickLinkRows.replaceChildren();
  for (const [index, link] of settingsDraft.quickLinks.entries()) {
    const row = document.createElement("div");
    row.className = "settings-row quick-row";
    const dragHandle = createDragHandle();
    attachReorderHandlers(row, dragHandle, settingsDraft.quickLinks, index, () => renderSettings(app));

    const title = createInput(t("inputQuickLinkTitle"), link.title);
    const url = createInput("URL", link.url, "url");
    const enabledWrap = createCheckField(t("localEnabled"), !localPatchDraft.quickLinks.disabledLinkIds.includes(link.id));
    const remove = createSmallButton("×", t("remove"));

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
      renderSettings(app);
    });

    row.append(dragHandle, title, url, enabledWrap.label, remove);
    refs.quickLinkRows.append(row);
  }
}

function createDragHandle() {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "drag-handle";
  handle.textContent = "☰";
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

export function handleExportSettings(app) {
  const result = validateSettingsDraft(app);
  if (!result.ok) {
    window.alert(`${t("exportSettingsInvalid")}\n${result.error}`);
    return;
  }
  const blob = new Blob([`${JSON.stringify(createSyncedState(result.state), null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `homer-or-not-settings-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function handleImportSettings(app, event) {
  if (!app.settingsDraft) {
    return;
  }
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) {
    return;
  }
  try {
    const raw = JSON.parse(await file.text());
    app.settingsDraft = normalizeState(raw, app.baseConfig);
    app.localPatchDraft = normalizeLocalPatch(null, app.settingsDraft);
    renderSettings(app);
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

export function validateSettingsDraft(app) {
  const { settingsDraft } = app;
  if (!settingsDraft) {
    return { ok: false, error: t("settingsNotOpen") };
  }

  const cleanedEngines = settingsDraft.search.engines
    .map((engine) => ({
      id: engine.id || makeId("engine"),
      title: engine.title.trim(),
      template: engine.template.trim(),
    }))
    .filter((engine) => engine.title && engine.template);

  if (!cleanedEngines.length) {
    return { ok: false, error: t("needSearchEngine") };
  }
  if (cleanedEngines.some((engine) => !engine.template.includes("{q}"))) {
    return { ok: false, error: t("searchTemplateMissingQuery") };
  }
  const cleanedLinks = settingsDraft.quickLinks
    .map((link) => ({
      id: link.id || makeId("quick"),
      title: typeof link.title === "string" ? link.title.trim() : "",
      url: link.url.trim(),
    }))
    .filter((link) => link.url);

  if (cleanedLinks.some((link) => !isHttpUrl(link.url))) {
    return { ok: false, error: t("quickLinkBadUrl") };
  }

  const nextHomer = readHomerDraft(app);
  if (nextHomer.url && !deriveHomerEndpoints(nextHomer.url)) {
    return { ok: false, error: t("homerUrlInvalid") };
  }
  const nextNews = readNewsDraft(app);
  if (app.settingsDraft.news.sources.some((source) => source.url && !isHttpUrl(source.url))) {
    return { ok: false, error: t("newsSourceBadUrl") };
  }

  return {
    ok: true,
    state: {
      search: {
        engines: cleanedEngines,
        defaultEngineId:
          cleanedEngines.find((engine) => engine.id === settingsDraft.search.defaultEngineId)?.id ||
          cleanedEngines[0].id,
      },
      quickLinks: cleanedLinks,
      homer: nextHomer,
      visits: readVisitsDraft(app),
      weather: readWeatherDraft(app),
      githubTrending: readGitHubTrendingDraft(app),
      news: nextNews,
    },
    localPatch: normalizeLocalPatch(
      {
        ...ensureLocalPatchDraft(app),
        search: {
          ...ensureLocalPatchDraft(app).search,
          defaultEngineId:
            cleanedEngines.find((engine) => engine.id === settingsDraft.search.defaultEngineId)?.id ||
            cleanedEngines[0].id,
        },
        homer: {
          disabled: ensureLocalPatchDraft(app).homer.disabled,
        },
        weather: {
          topDisabled: !app.refs.topWeatherEnabledInput.checked,
          cardDisabled: true,
          locationName: app.refs.weatherLocationInput.value,
        },
        githubTrending: {
          disabled: ensureLocalPatchDraft(app).githubTrending.disabled,
        },
        news: {
          disabledFeedIds: ensureLocalPatchDraft(app).news.disabledFeedIds,
        },
        visits: {
          showFrequent: app.refs.showFrequentVisitsInput.checked,
          showRecent: app.refs.showRecentVisitsInput.checked,
        },
        widgets: {
          order: normalizeWidgetOrder(ensureLocalPatchDraft(app).widgets?.order, {
            ...settingsDraft,
            news: nextNews,
          }),
        },
      },
      {
        search: {
          engines: cleanedEngines,
          defaultEngineId: "",
        },
        quickLinks: cleanedLinks,
        homer: nextHomer,
        visits: readVisitsDraft(app),
        weather: readWeatherDraft(app),
        githubTrending: readGitHubTrendingDraft(app),
        news: nextNews,
      },
    ),
  };
}

function readHomerDraft(app) {
  return {
    url: app.settingsDraft.homer.url.trim(),
  };
}

function readVisitsDraft(app) {
  return normalizeVisitSettings(
    {
      frequentHistoryPool: app.refs.frequentHistoryPoolInput.value,
      frequentMinVisits: app.refs.frequentMinVisitsInput.value,
    },
    FALLBACK_CONFIG.visits,
  );
}

function readWeatherDraft(app) {
  return normalizeWeatherSettings(
    {
      topWidgetPlacement: app.refs.topWeatherPlacementInput.value,
    },
    FALLBACK_CONFIG.weather,
  );
}

function readGitHubTrendingDraft(app) {
  return normalizeGitHubTrendingSettings(
    {
      excludedTerms: app.settingsDraft.githubTrending.excludedTerms,
      syncIntervalMinutes: app.settingsDraft.githubTrending.syncIntervalMinutes,
    },
    FALLBACK_CONFIG.githubTrending,
  );
}

function readNewsDraft(app) {
  return normalizeNewsSettings(
    app.settingsDraft.news,
    FALLBACK_CONFIG.news,
  );
}

function createInput(placeholder, value, type = "text") {
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  input.name = placeholder
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-zа-я0-9_{}]/gi, "");
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

function createStaticCell(text) {
  const cell = document.createElement("strong");
  cell.className = "settings-static";
  cell.textContent = text;
  return cell;
}

function createEmptyCell() {
  const cell = document.createElement("span");
  cell.className = "settings-empty-cell";
  cell.setAttribute("aria-hidden", "true");
  return cell;
}

function ensureLocalPatchDraft(app) {
  if (!app.localPatchDraft) {
    app.localPatchDraft = normalizeLocalPatch(null, app.settingsDraft);
  }
  return app.localPatchDraft;
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

function isWidgetEnabled(localPatch, id) {
  if (id === "services") {
    return localPatch.homer?.disabled !== true;
  }
  if (id.startsWith("news:")) {
    return !localPatch.news?.disabledFeedIds?.includes(id.slice("news:".length));
  }
  if (id === "githubTrending") {
    return localPatch.githubTrending?.disabled !== true;
  }
  if (id === "weather") {
    return localPatch.weather?.cardDisabled !== true;
  }
  return true;
}

function setWidgetEnabled(localPatch, id, enabled) {
  if (id === "services") {
    localPatch.homer.disabled = !enabled;
  } else if (id.startsWith("news:")) {
    updateDisabledId(localPatch.news.disabledFeedIds, id.slice("news:".length), !enabled);
  } else if (id === "githubTrending") {
    localPatch.githubTrending.disabled = !enabled;
  } else if (id === "weather") {
    localPatch.weather.cardDisabled = !enabled;
  }
}

function getWidgetLabel(app, id) {
  if (id.startsWith("news:")) {
    const sourceId = id.slice("news:".length);
    return app.settingsDraft.news.sources.find((source) => getNewsWidgetId(source.id) === getNewsWidgetId(sourceId))?.title || sourceId;
  }
  return t(WIDGET_LABEL_KEYS[id] || id);
}

function getNewsSourceForWidget(app, id) {
  if (!id.startsWith("news:")) {
    return null;
  }
  const sourceId = id.slice("news:".length);
  return app.settingsDraft.news.sources.find((source) => getNewsWidgetId(source.id) === getNewsWidgetId(sourceId)) || null;
}
