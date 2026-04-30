import { FALLBACK_CONFIG } from "./default-config.js";
import { deriveHomerEndpoints } from "./homer.js";
import { t } from "./i18n.js";
import {
  createSyncedState,
  normalizeGitHubTrendingSettings,
  normalizeLocalPatch,
  normalizeState,
  normalizeWeatherSettings,
  normalizeVisitSettings,
} from "./state.js";
import { clone, isHttpUrl, makeId } from "./utils.js";

export function openSettings(app) {
  app.settingsDraft = clone(app.state);
  app.localPatchDraft = clone(app.localPatch);
  renderSettings(app);
  app.refs.settingsOverlay.classList.remove("hidden");
  app.refs.homerUrlInput.focus();
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
  app.refs.homerUrlInput.value = app.settingsDraft.homer.url;
  app.refs.homerDisabledInput.checked = app.localPatchDraft?.homer?.disabled === true;
  app.refs.topWeatherEnabledInput.checked = app.localPatchDraft?.weather?.topDisabled !== true;
  app.refs.weatherCardEnabledInput.checked = app.localPatchDraft?.weather?.cardDisabled !== true;
  app.refs.weatherLocationInput.value = app.localPatchDraft?.weather?.locationName || "";
  app.refs.topWeatherPlacementInput.value = app.settingsDraft.weather.topWidgetPlacement;
  app.refs.githubTrendingEnabledInput.checked = app.localPatchDraft?.githubTrending?.disabled !== true;
  app.refs.githubTrendingExcludeInput.value = app.settingsDraft.githubTrending.excludedTerms.join(", ");
  app.refs.showFrequentVisitsInput.checked = app.localPatchDraft?.visits?.showFrequent !== false;
  app.refs.showRecentVisitsInput.checked = app.localPatchDraft?.visits?.showRecent !== false;
  app.refs.frequentHistoryPoolInput.value = String(app.settingsDraft.visits.frequentHistoryPool);
  app.refs.frequentMinVisitsInput.value = String(app.settingsDraft.visits.frequentMinVisits);
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
          disabled: app.refs.homerDisabledInput.checked,
        },
        weather: {
          topDisabled: !app.refs.topWeatherEnabledInput.checked,
          cardDisabled: !app.refs.weatherCardEnabledInput.checked,
          locationName: app.refs.weatherLocationInput.value,
        },
        githubTrending: {
          disabled: !app.refs.githubTrendingEnabledInput.checked,
        },
        visits: {
          showFrequent: app.refs.showFrequentVisitsInput.checked,
          showRecent: app.refs.showRecentVisitsInput.checked,
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
      },
    ),
  };
}

function readHomerDraft(app) {
  return {
    url: app.refs.homerUrlInput.value.trim(),
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
      excludedTerms: app.refs.githubTrendingExcludeInput.value,
    },
    FALLBACK_CONFIG.githubTrending,
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
