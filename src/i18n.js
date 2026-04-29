export const LOCALE = getPreferredLocale();

const I18N = {
  ru: {
    topActions: "Управление",
    homerStatus: "Статус Homer",
    syncHomer: "Обновить Homer",
    settings: "Настройки",
    launchPanel: "Поиск и быстрые ссылки",
    searchPlaceholder: "Что ищем?",
    searchServices: "Поисковые сервисы",
    quickLinks: "Быстрые ссылки",
    servicesArea: "Homer и посещённые сайты",
    frequentVisits: "Часто посещаемые",
    recentVisits: "Последние посещённые",
    close: "Закрыть",
    search: "Поиск",
    add: "Добавить",
    visits: "Посещения",
    historyPool: "Сколько записей истории смотреть",
    minVisits: "Минимум посещений для частых",
    exportSettings: "Выгрузить настройки",
    exportSettingsInvalid: "Сначала исправьте ошибки в настройках.",
    importSettings: "Загрузить настройки",
    importSettingsInvalid: "Не удалось загрузить настройки из файла.",
    importSettingsLoaded: "Настройки загружены. Нажмите «Сохранить», чтобы применить.",
    reset: "Сбросить",
    save: "Сохранить",
    searchAria: "Поиск",
    resetConfirm: "Сбросить настройки стартовой к newtab.config.js?",
    servicesEmptyAfterSync: "Плитки Homer появятся после успешной синхронизации.",
    miscellaneous: "Разное",
    homerUrlMissing: "URL Homer не задан.",
    homerUrlInvalid: "Некорректный URL Homer.",
    homerCache: (date) => `Кеш Homer: ${date}.`,
    homerRecentFailureCache: (date) => `Homer недавно не ответил, используется кеш: ${date}.`,
    homerNeverFetched: "Этот браузер еще ни разу не получил Homer.",
    homerRecentFailureNoCache: "Homer недавно не ответил, кеша пока нет.",
    homerAway: "Похоже, это не домашняя локальная сеть.",
    homerSyncing: "Синхронизация Homer...",
    homerUpdated: (date) => `Homer обновлен: ${date}.`,
    homerOfflineCache: (date) => `Homer недоступен, используется кеш: ${date}.`,
    homerOfflineNoCache: "Homer недоступен, кеша пока нет.",
    homerDisabled: "Homer отключен локально.",
    disableHomerLocally: "Отключить Homer локально",
    localEnabled: "Вкл",
    inputTitle: "Название",
    inputSearchTemplate: "URL с {q}",
    remove: "Удалить",
    dragToReorder: "Перетащить, чтобы изменить порядок",
    inputQuickLinkTitle: "Подпись",
    settingsNotOpen: "Настройки не открыты.",
    needSearchEngine: "Нужен хотя бы один поисковик.",
    searchTemplateMissingQuery: "В URL каждого поисковика должен быть {q}.",
    quickLinkBadUrl: "В быстрых ссылках есть некорректный URL.",
    servicesEmptyFirstSync: "Плитки Homer появятся после первой успешной синхронизации.",
    visitCount: (count) => `${count} посещ.`,
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
    visitCount: (count) => `${count} visits`,
  },
};

export function getPreferredLocale() {
  const language = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages[0] : navigator.language;
  return String(language || "").toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function t(key, ...args) {
  const value = I18N[LOCALE]?.[key] ?? I18N.ru[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

export function applyLocalization() {
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
