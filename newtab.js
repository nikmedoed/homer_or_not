(() => {
  // src/constants.js
  var STATE_KEY = "homerOrNot.state.v2";
  var LOCAL_PATCH_KEY = "homerOrNot.localPatch.v1";
  var CACHE_KEY = "homerOrNot.homerCache.v2";
  var META_KEY = "homerOrNot.homerMeta.v2";
  var QUICK_LINK_META_KEY = "homerOrNot.quickLinkMeta.v2";
  var SEARCH_ENGINE_META_KEY = "homerOrNot.searchEngineMeta.v2";
  var HISTORY_KEY = "homerOrNot.visitHistory.v1";
  var WEATHER_CACHE_KEY = "homerOrNot.weatherCache.v1";
  var GITHUB_TRENDING_CACHE_KEY = "homerOrNot.githubTrendingCache.v1";
  var SYNC_AREA = "sync";
  var LOCAL_AREA = "local";
  var QUICK_LINK_META_TTL_MS = 1e3 * 60 * 60 * 24 * 7;
  var VISIT_HISTORY_LIMIT = 50;
  var HOMER_SYNC_INTERVAL_MINUTES = 5;
  var HOMER_FETCH_TIMEOUT_MS = 7e3;
  var LOCAL_IP_DETECTION_TIMEOUT_MS = 1200;
  var WEATHER_SYNC_INTERVAL_MINUTES = 30;
  var WEATHER_FETCH_TIMEOUT_MS = 7e3;
  var GITHUB_TRENDING_FETCH_TIMEOUT_MS = 7e3;

  // src/i18n.js
  var LOCALE = getPreferredLocale();
  var I18N = {
    ru: {
      topActions: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
      viewMode: "\u0420\u0435\u0436\u0438\u043C \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
      viewModeFull: "\u041F\u043E\u043B\u043D\u044B\u0439",
      viewModeBase: "\u0411\u0430\u0437\u0430",
      viewModeZen: "\u0414\u0437\u0435\u043D",
      homerStatus: "\u0421\u0442\u0430\u0442\u0443\u0441 Homer",
      syncHomer: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C Homer",
      settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      launchPanel: "\u041F\u043E\u0438\u0441\u043A \u0438 \u0431\u044B\u0441\u0442\u0440\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      searchPlaceholder: "\u0427\u0442\u043E \u0438\u0449\u0435\u043C?",
      searchServices: "\u041F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u044B",
      quickLinks: "\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      servicesArea: "Homer \u0438 \u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u044B\u0435 \u0441\u0430\u0439\u0442\u044B",
      frequentVisits: "\u0427\u0430\u0441\u0442\u043E \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u044B\u0435",
      recentVisits: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u044B\u0435",
      close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
      search: "\u041F\u043E\u0438\u0441\u043A",
      add: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
      visits: "\u041F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F",
      historyPool: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C",
      minVisits: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u0447\u0430\u0441\u0442\u044B\u0445",
      showFrequentVisits: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0447\u0430\u0441\u0442\u043E \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u044B\u0435",
      showRecentVisits: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u044B\u0435",
      exportSettings: "\u0412\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      exportSettingsInvalid: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0438\u0441\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u043E\u0448\u0438\u0431\u043A\u0438 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
      importSettings: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      importSettingsInvalid: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0438\u0437 \u0444\u0430\u0439\u043B\u0430.",
      importSettingsLoaded: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C\xBB, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C.",
      reset: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C",
      save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
      searchAria: "\u041F\u043E\u0438\u0441\u043A",
      resetConfirm: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0439 \u043A newtab.config.js?",
      miscellaneous: "\u0420\u0430\u0437\u043D\u043E\u0435",
      homerUrlMissing: "URL Homer \u043D\u0435 \u0437\u0430\u0434\u0430\u043D.",
      homerUrlInvalid: "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 URL Homer.",
      homerCache: (date) => `\u041A\u0435\u0448 Homer: ${date}.`,
      homerRecentFailureCache: (date) => `Homer \u043D\u0435\u0434\u0430\u0432\u043D\u043E \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043A\u0435\u0448: ${date}.`,
      homerRecentFailureNoCache: "Homer \u043D\u0435\u0434\u0430\u0432\u043D\u043E \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B, \u043A\u0435\u0448\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.",
      homerAway: "\u041F\u043E\u0445\u043E\u0436\u0435, \u044D\u0442\u043E \u043D\u0435 \u0434\u043E\u043C\u0430\u0448\u043D\u044F\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0435\u0442\u044C.",
      homerSyncing: "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F Homer...",
      homerUpdated: (date) => `Homer \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D: ${date}.`,
      homerOfflineCache: (date) => `Homer \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043A\u0435\u0448: ${date}.`,
      homerOfflineNoCache: "Homer \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u043A\u0435\u0448\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.",
      homerDisabled: "Homer \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E.",
      disableHomerLocally: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C Homer \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E",
      weather: "\u041F\u043E\u0433\u043E\u0434\u0430",
      weatherTitle: "\u041F\u043E\u0433\u043E\u0434\u0430",
      weatherEnabled: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u043F\u043E\u0433\u043E\u0434\u0443",
      topWeatherEnabled: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0432\u0435\u0440\u0445\u043D\u044E\u044E \u043F\u043E\u0433\u043E\u0434\u0443",
      weatherCardEnabled: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443 \u043F\u043E\u0433\u043E\u0434\u044B",
      weatherLocation: "\u0413\u043E\u0440\u043E\u0434 \u0438\u043B\u0438 \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u044B",
      weatherLocationPlaceholder: "\u041F\u0443\u0441\u0442\u043E: \u0431\u0440\u0430\u0442\u044C \u0433\u0435\u043E\u043B\u043E\u043A\u0430\u0446\u0438\u044E \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430",
      topWeatherPlacement: "\u0412\u0435\u0440\u0445\u043D\u044F\u044F \u043F\u043E\u0433\u043E\u0434\u0430",
      topWeatherPlacementActions: "\u041A\u0430\u043A \u0441\u0435\u0439\u0447\u0430\u0441",
      topWeatherPlacementCenter: "\u041F\u043E \u0446\u0435\u043D\u0442\u0440\u0443 \u044D\u043A\u0440\u0430\u043D\u0430",
      refreshWeather: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u043E\u0433\u043E\u0434\u0443",
      currentLocation: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
      weatherLoadingGeo: "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u044E \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435...",
      weatherLoadingManual: "\u0418\u0449\u0443 \u043F\u043E\u0433\u043E\u0434\u0443...",
      weatherNeedsLocation: "\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u0433\u0435\u043E\u043B\u043E\u043A\u0430\u0446\u0438\u044E \u0438\u043B\u0438 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u0433\u043E\u0440\u043E\u0434 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
      weatherOpenSettingsHint: "Open-Meteo, \u0431\u0435\u0437 API-\u043A\u043B\u044E\u0447\u0430",
      weatherUnavailable: "\u041F\u043E\u0433\u043E\u0434\u0430 \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430.",
      weatherLocationNotFound: "\u041B\u043E\u043A\u0430\u0446\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.",
      weatherGeolocationUnsupported: "\u0413\u0435\u043E\u043B\u043E\u043A\u0430\u0446\u0438\u044F \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044F.",
      weatherGeolocationFailed: "\u0413\u0435\u043E\u043B\u043E\u043A\u0430\u0446\u0438\u044F \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430. \u0417\u0430\u0434\u0430\u0439\u0442\u0435 \u0433\u043E\u0440\u043E\u0434 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
      weatherFeelsLike: (temp) => `\u041E\u0449\u0443\u0449\u0430\u0435\u0442\u0441\u044F \u043A\u0430\u043A ${temp}`,
      weatherRange: (min, max) => `${min} / ${max}`,
      weatherHumidity: (humidity) => `\u{1F4A7} ${humidity}`,
      weatherWind: (wind) => `\u224B ${wind}`,
      weatherRain: (chance) => `\u2614 ${chance}`,
      weatherUpdated: (date) => `\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E ${date}`,
      githubTrending: "GitHub Trending",
      githubTrendingEnabled: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C GitHub Trending",
      githubTrendingSyncInterval: "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0442\u044C \u043A\u0435\u0448, \u043C\u0438\u043D\u0443\u0442",
      githubTrendingExcludedTerms: "\u0418\u0441\u043A\u043B\u044E\u0447\u0430\u0442\u044C \u0441\u043B\u043E\u0432\u0430",
      githubTrendingExcludedTermsPlaceholder: "ai, llm, claude, agent",
      refreshGithubTrending: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C GitHub Trending",
      githubTrendingLoading: "\u0418\u0449\u0443 \u0441\u0432\u0435\u0436\u0438\u0435 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0438...",
      githubTrendingUnavailable: "GitHub Trending \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D.",
      githubTrendingSource: "\u043D\u043E\u0432\u044B\u0435 dev-tool \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0438",
      githubTrendingUpdated: (elapsed) => `\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E ${elapsed}`,
      githubTrendingStale: (elapsed) => `\u043A\u0435\u0448 ${elapsed}`,
      githubTrendingNoDescription: "\u0411\u0435\u0437 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F",
      localEnabled: "\u0412\u043A\u043B",
      inputTitle: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
      inputSearchTemplate: "URL \u0441 {q}",
      remove: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
      dragToReorder: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u044C, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0440\u044F\u0434\u043E\u043A",
      inputQuickLinkTitle: "\u041F\u043E\u0434\u043F\u0438\u0441\u044C",
      settingsNotOpen: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043D\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u044B.",
      needSearchEngine: "\u041D\u0443\u0436\u0435\u043D \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u0438\u043D \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u0438\u043A.",
      searchTemplateMissingQuery: "\u0412 URL \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u0438\u043A\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C {q}.",
      quickLinkBadUrl: "\u0412 \u0431\u044B\u0441\u0442\u0440\u044B\u0445 \u0441\u0441\u044B\u043B\u043A\u0430\u0445 \u0435\u0441\u0442\u044C \u043D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 URL.",
      visitCount: (count) => `${count} \u043F\u043E\u0441\u0435\u0449.`,
      quickAddLinkTooltip: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u0431\u044B\u0441\u0442\u0440\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      quickAddLinkAria: (title) => `\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \xAB${title}\xBB \u0432 \u0431\u044B\u0441\u0442\u0440\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438`,
      quickLinkAlreadyAdded: "\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0432 \u0431\u044B\u0441\u0442\u0440\u044B\u0445 \u0441\u0441\u044B\u043B\u043A\u0430\u0445"
    },
    en: {
      topActions: "Controls",
      viewMode: "View mode",
      viewModeFull: "Full",
      viewModeBase: "Base",
      viewModeZen: "Zen",
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
      showFrequentVisits: "Show frequently visited",
      showRecentVisits: "Show recently visited",
      exportSettings: "Export settings",
      exportSettingsInvalid: "Fix the settings errors first.",
      importSettings: "Import settings",
      importSettingsInvalid: "Could not load settings from the file.",
      importSettingsLoaded: "Settings loaded. Click Save to apply them.",
      reset: "Reset",
      save: "Save",
      searchAria: "Search",
      resetConfirm: "Reset new tab settings to newtab.config.js?",
      miscellaneous: "Other",
      homerUrlMissing: "Homer URL is not set.",
      homerUrlInvalid: "Invalid Homer URL.",
      homerCache: (date) => `Homer cache: ${date}.`,
      homerRecentFailureCache: (date) => `Homer did not respond recently, using cache: ${date}.`,
      homerRecentFailureNoCache: "Homer did not respond recently, and there is no cache yet.",
      homerAway: "This does not look like the home local network.",
      homerSyncing: "Syncing Homer...",
      homerUpdated: (date) => `Homer updated: ${date}.`,
      homerOfflineCache: (date) => `Homer is unavailable, using cache: ${date}.`,
      homerOfflineNoCache: "Homer is unavailable, and there is no cache yet.",
      homerDisabled: "Homer is disabled locally.",
      disableHomerLocally: "Disable Homer locally",
      weather: "Weather",
      weatherTitle: "Weather",
      weatherEnabled: "Show weather",
      topWeatherEnabled: "Show top weather",
      weatherCardEnabled: "Show weather card",
      weatherLocation: "City or coordinates for this machine",
      weatherLocationPlaceholder: "Blank: use browser geolocation",
      topWeatherPlacement: "Top weather",
      topWeatherPlacementActions: "Current position",
      topWeatherPlacementCenter: "Centered on screen",
      refreshWeather: "Refresh weather",
      currentLocation: "Current location",
      weatherLoadingGeo: "Detecting location...",
      weatherLoadingManual: "Loading weather...",
      weatherNeedsLocation: "Allow geolocation or set a city in settings.",
      weatherOpenSettingsHint: "Open-Meteo, no API key",
      weatherUnavailable: "Weather is unavailable right now.",
      weatherLocationNotFound: "Location was not found.",
      weatherGeolocationUnsupported: "Geolocation is not supported.",
      weatherGeolocationFailed: "Geolocation is unavailable. Set a city in settings.",
      weatherFeelsLike: (temp) => `Feels like ${temp}`,
      weatherRange: (min, max) => `${min} / ${max}`,
      weatherHumidity: (humidity) => `\u{1F4A7} ${humidity}`,
      weatherWind: (wind) => `\u224B ${wind}`,
      weatherRain: (chance) => `\u2614 ${chance}`,
      weatherUpdated: (date) => `Updated ${date}`,
      githubTrending: "GitHub Trending",
      githubTrendingEnabled: "Show GitHub Trending",
      githubTrendingSyncInterval: "Refresh cache, minutes",
      githubTrendingExcludedTerms: "Exclude words",
      githubTrendingExcludedTermsPlaceholder: "ai, llm, claude, agent",
      refreshGithubTrending: "Refresh GitHub Trending",
      githubTrendingLoading: "Looking for fresh repositories...",
      githubTrendingUnavailable: "GitHub Trending is unavailable right now.",
      githubTrendingSource: "new dev-tool repositories",
      githubTrendingUpdated: (elapsed) => `updated ${elapsed}`,
      githubTrendingStale: (elapsed) => `cache ${elapsed}`,
      githubTrendingNoDescription: "No description",
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
      visitCount: (count) => `${count} visits`,
      quickAddLinkTooltip: "Add to quick links",
      quickAddLinkAria: (title) => `Add ${title} to quick links`,
      quickLinkAlreadyAdded: "Already in quick links"
    }
  };
  function getPreferredLocale() {
    const language = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages[0] : navigator.language;
    return String(language || "").toLowerCase().startsWith("ru") ? "ru" : "en";
  }
  function t(key, ...args) {
    const value = I18N[LOCALE]?.[key] ?? I18N.ru[key] ?? key;
    return typeof value === "function" ? value(...args) : value;
  }
  function applyLocalization() {
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

  // src/default-config.js
  var FALLBACK_CONFIG = {
    homer: {
      url: ""
    },
    theme: {},
    search: {
      defaultEngineId: "yandex",
      engines: [
        {
          id: "yandex",
          title: LOCALE === "ru" ? "\u042F\u043D\u0434\u0435\u043A\u0441" : "Yandex",
          template: "https://yandex.ru/search/?text={q}"
        }
      ]
    },
    quickLinks: [],
    visits: {
      frequentHistoryPool: 5e3,
      frequentMinVisits: 3
    },
    weather: {
      topWidgetPlacement: "center"
    },
    githubTrending: {
      excludedTerms: [],
      syncIntervalMinutes: 60
    },
    services: []
  };

  // src/utils.js
  function byId(id) {
    const node = document.getElementById(id);
    if (!node) {
      throw new Error(`Missing #${id}`);
    }
    return node;
  }
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function makeId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
  function makeInitial(text) {
    const value = String(text || "").trim();
    return value ? value.slice(0, 1).toUpperCase() : "?";
  }
  function toDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  }
  function normalizeUrlKey(raw) {
    try {
      const url = new URL(raw);
      url.hash = "";
      url.search = "";
      url.pathname = url.pathname.replace(/\/+$/, "") || "/";
      return url.href;
    } catch {
      return "";
    }
  }
  function truncateTitle(title) {
    const value = String(title || "").replace(/\s+/g, " ").trim();
    return value.length > 22 ? `${value.slice(0, 21).trim()}\u2026` : value;
  }
  function truncateHistoryTitle(title) {
    const value = String(title || "").replace(/\s+/g, " ").trim();
    return value.length > 64 ? `${value.slice(0, 63).trim()}\u2026` : value;
  }
  function formatHistoryMeta(item) {
    const domain = toDomain(item.url);
    const time = formatTime(item.visitedAt);
    if (domain && time) {
      return `${domain} \xB7 ${time}`;
    }
    return domain || time || "";
  }
  function formatFrequentMeta(item) {
    return toDomain(item.url);
  }
  function formatTime(timestamp) {
    try {
      return new Intl.DateTimeFormat(LOCALE === "ru" ? "ru-RU" : "en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch {
      return "";
    }
  }
  function formatDateTime(timestamp) {
    try {
      return new Intl.DateTimeFormat(LOCALE === "ru" ? "ru-RU" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch {
      return "";
    }
  }
  function blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve(typeof reader.result === "string" ? reader.result : "");
      });
      reader.addEventListener("error", () => {
        resolve("");
      });
      reader.readAsDataURL(blob);
    });
  }
  function isHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
  function clampInt(value, min, max, fallback) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, parsed));
  }
  function isCacheFresh(cache, minutes) {
    if (!cache?.fetchedAt) {
      return false;
    }
    return Date.now() - cache.fetchedAt < minutes * 60 * 1e3;
  }
  function isFailureFresh(meta, minutes, sourceUrl) {
    if (!meta?.failedAt) {
      return false;
    }
    if (meta.sourceUrl && sourceUrl && meta.sourceUrl !== sourceUrl) {
      return false;
    }
    return Date.now() - meta.failedAt < minutes * 60 * 1e3;
  }
  function withCacheBuster(url) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("_", String(Date.now()));
      return parsed.href;
    } catch {
      return url;
    }
  }
  async function fetchTextWithTimeout(url, timeoutMs) {
    const response = await fetchWithTimeout(url, timeoutMs, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  }
  async function fetchJsonWithTimeout(url, timeoutMs) {
    const response = await fetchWithTimeout(url, timeoutMs, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  }
  async function fetchWithTimeout(url, timeoutMs, options = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timer);
    }
  }
  async function storageGet(key, area = LOCAL_AREA) {
    const chromeApi = globalThis.chrome;
    const storageArea = chromeApi?.storage?.[area] || chromeApi?.storage?.local;
    if (storageArea) {
      return await new Promise((resolve) => {
        storageArea.get([key], (result) => {
          if (chromeApi.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve(result?.[key] ?? null);
        });
      });
    }
    try {
      const raw = globalThis.localStorage?.getItem(`${area}:${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  async function storageSet(key, value, area = LOCAL_AREA) {
    const chromeApi = globalThis.chrome;
    const storageArea = chromeApi?.storage?.[area] || chromeApi?.storage?.local;
    if (storageArea) {
      await new Promise((resolve) => {
        storageArea.set({ [key]: value }, resolve);
      });
      return;
    }
    try {
      globalThis.localStorage?.setItem(`${area}:${key}`, JSON.stringify(value));
    } catch {
    }
  }
  async function storageRemove(keys, area = LOCAL_AREA) {
    const list = Array.isArray(keys) ? keys : [keys];
    const chromeApi = globalThis.chrome;
    const storageArea = chromeApi?.storage?.[area] || chromeApi?.storage?.local;
    if (storageArea) {
      await new Promise((resolve) => {
        storageArea.remove(list, resolve);
      });
      return;
    }
    for (const key of list) {
      try {
        globalThis.localStorage?.removeItem(`${area}:${key}`);
      } catch {
      }
    }
  }

  // src/render/github-trending-widget.js
  function renderGitHubTrending(app2) {
    const { refs } = app2;
    if (!refs.githubTrending) {
      return;
    }
    if (app2.localPatch?.githubTrending?.disabled) {
      refs.githubTrending.classList.add("hidden");
      return;
    }
    const status = app2.githubTrendingStatus;
    const summary = getGitHubTrendingSummary(app2.githubTrendingCache);
    const hasItems = summary.items.length > 0;
    refs.githubTrending.classList.toggle("hidden", !hasItems && !status);
    refs.githubTrending.dataset.state = status?.kind || (hasItems ? "ready" : "empty");
    refs.githubTrendingRefreshButton.disabled = status?.kind === "loading";
    refs.githubTrendingList.replaceChildren();
    if (!hasItems) {
      const empty = document.createElement("p");
      empty.className = "github-trending-message";
      empty.textContent = status?.message || t("githubTrendingUnavailable");
      refs.githubTrendingList.append(empty);
      refs.githubTrendingMeta.textContent = t("githubTrendingSource");
      return;
    }
    for (const item of summary.items) {
      refs.githubTrendingList.append(createGitHubTrendingRow(app2, item));
    }
    if (status?.kind === "error") {
      refs.githubTrendingMeta.textContent = t("githubTrendingStale", summary.updatedAt);
      refs.githubTrendingMeta.title = [status.message, summary.updatedAtTitle].filter(Boolean).join(" \xB7 ");
      return;
    }
    refs.githubTrendingMeta.textContent = summary.updatedAt ? t("githubTrendingUpdated", summary.updatedAt) : t("githubTrendingSource");
    refs.githubTrendingMeta.title = summary.updatedAtTitle;
  }
  function createGitHubTrendingRow(app2, item) {
    const anchor = document.createElement("a");
    anchor.className = "github-trending-row";
    anchor.href = item.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.title = item.description || item.fullName;
    anchor.addEventListener("click", () => {
      void app2.addVisitHistoryItem({
        title: item.fullName,
        url: item.url,
        source: "github"
      });
    });
    const avatar = document.createElement("span");
    avatar.className = "github-trending-avatar";
    if (item.ownerAvatarUrl) {
      const image = document.createElement("img");
      image.src = item.ownerAvatarUrl;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.remove();
        avatar.textContent = makeInitial(item.name);
      });
      avatar.append(image);
    } else {
      avatar.textContent = makeInitial(item.name);
    }
    const body = document.createElement("span");
    body.className = "github-trending-body";
    const title = document.createElement("span");
    title.className = "github-trending-name";
    title.textContent = item.fullName;
    const description = document.createElement("span");
    description.className = "github-trending-description";
    description.textContent = item.description || t("githubTrendingNoDescription");
    const meta = document.createElement("span");
    meta.className = "github-trending-repo-meta";
    const stars = formatStars(item.stars);
    meta.textContent = [stars ? `\u2605 ${stars}` : "", item.language, formatRepositoryAge(item)].filter(Boolean).join(" \xB7 ");
    body.append(title, description, meta);
    anchor.append(avatar, body);
    return anchor;
  }

  // src/icons.js
  var ICONS = {
    network: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v5m-7 7v-3h14v3M5 20h4v-4H5v4Zm10 0h4v-4h-4v4Zm-5 0h4v-4h-4v4Z"/></svg>',
    media: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4V5Zm3 3v8l6-4-6-4Zm9 0h2m-2 4h2m-2 4h2"/></svg>',
    sync: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5m10.4-2A7.5 7.5 0 0 0 6.2 7.2M4.6 14a7.5 7.5 0 0 0 13.2 3.8"/></svg>',
    ethernet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15h16v5H4v-5Zm2-9h3v9H6V6Zm5 3h3v6h-3V9Zm5-3h3v9h-3V6Z"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7v9h-6v-6H9v6H3v-9Z"/></svg>'
  };
  var ICON_ALIASES = /* @__PURE__ */ new Map([
    ["fas fa-network-wired", "network"],
    ["fa-network-wired", "network"],
    ["fas fa-photo-video", "media"],
    ["fa-photo-video", "media"],
    ["fas fa-rotate", "sync"],
    ["fa-rotate", "sync"],
    ["fas fa-sync", "sync"],
    ["fas fa-ethernet", "ethernet"],
    ["fa-ethernet", "ethernet"],
    ["fas fa-home", "home"],
    ["fa-home", "home"]
  ]);
  function normalizeSectionIcon(icon, name) {
    const key = String(icon || "").trim().toLowerCase();
    if (ICONS[key]) {
      return key;
    }
    if (ICON_ALIASES.has(key)) {
      return ICON_ALIASES.get(key);
    }
    const text = `${key} ${name || ""}`.toLowerCase();
    if (text.includes("\u043C\u0435\u0434\u0438\u0430") || text.includes("media") || text.includes("photo")) {
      return "media";
    }
    if (text.includes("sync") || text.includes("syncthing") || text.includes("rotate")) {
      return "sync";
    }
    if (text.includes("\u0441\u0435\u0442\u044C") || text.includes("ethernet") || text.includes("router")) {
      return "ethernet";
    }
    if (text.includes("\u0434\u043E\u043C") || text.includes("home")) {
      return "home";
    }
    return "network";
  }

  // src/homer.js
  function normalizeHomerCache(raw) {
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.services)) {
      return null;
    }
    const services = normalizeServiceGroups(raw.services, raw.sourceUrl || "");
    if (!services.length) {
      return null;
    }
    return {
      fetchedAt: Number.isFinite(raw.fetchedAt) ? raw.fetchedAt : Date.now(),
      sourceUrl: typeof raw.sourceUrl === "string" ? raw.sourceUrl : "",
      theme: typeof raw.theme === "string" ? raw.theme : "",
      services
    };
  }
  function normalizeSyncMeta(raw) {
    if (!raw || typeof raw !== "object" || !Number.isFinite(raw.failedAt)) {
      return null;
    }
    return {
      failedAt: raw.failedAt,
      sourceUrl: typeof raw.sourceUrl === "string" ? raw.sourceUrl : "",
      message: typeof raw.message === "string" ? raw.message : ""
    };
  }
  function normalizeServiceGroups(raw, configUrl) {
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map((group) => {
      const items = Array.isArray(group?.items) ? group.items.map((item) => normalizeServiceItem(item, configUrl)).filter(Boolean) : [];
      return {
        name: typeof group?.name === "string" && group.name.trim() ? group.name.trim() : t("miscellaneous"),
        icon: typeof group?.icon === "string" ? group.icon : "",
        logo: resolveAssetUrl(String(group?.logo ?? "").trim(), configUrl),
        className: normalizeClassName(group?.class ?? group?.className),
        items
      };
    }).filter((group) => group.items.length);
  }
  function normalizeServiceItem(raw, configUrl) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const name = String(raw.name ?? raw.title ?? "").trim();
    const url = resolveMaybeRelativeUrl(String(raw.url ?? "").trim(), configUrl);
    if (!name || !url || !isHttpUrl(url)) {
      return null;
    }
    const logoRaw = String(raw.logo ?? "").trim();
    const remoteLogo = resolveAssetUrl(logoRaw, configUrl);
    return {
      name,
      url,
      target: typeof raw.target === "string" ? raw.target : "_self",
      logo: remoteLogo,
      fallbackLogo: "",
      subtitle: normalizeText(raw.subtitle, 180),
      tag: normalizeText(raw.tag, 64),
      tagstyle: normalizeClassName(raw.tagstyle),
      background: normalizeCssColor(raw.background),
      className: normalizeClassName(raw.class ?? raw.className)
    };
  }
  function parseHomerConfig(text) {
    const payload = text.trim();
    if (!payload) {
      throw new Error("Empty Homer config.");
    }
    if (payload.startsWith("{") || payload.startsWith("[")) {
      const parsed = JSON.parse(payload);
      return {
        services: Array.isArray(parsed) ? parsed : parsed.services,
        theme: Array.isArray(parsed) ? "" : parsed.theme
      };
    }
    return parseHomerYaml(payload);
  }
  function parseHomerYaml(yamlText) {
    const lines = yamlText.split(/\r?\n/);
    const services = [];
    let theme = "";
    let inServices = false;
    let currentGroup = null;
    let currentItem = null;
    const flushItem = () => {
      if (currentGroup && currentItem) {
        currentGroup.items.push(currentItem);
      }
      currentItem = null;
    };
    const flushGroup = () => {
      if (!currentGroup) {
        return;
      }
      flushItem();
      if (currentGroup.items.length) {
        services.push(currentGroup);
      }
      currentGroup = null;
    };
    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!inServices) {
        const themeMatch = rawLine.match(/^theme:\s*(.*)$/);
        if (themeMatch) {
          theme = parseYamlScalar(themeMatch[1]);
        }
        if (trimmed === "services:") {
          inServices = true;
        }
        continue;
      }
      if (/^\S/.test(rawLine) && trimmed && !trimmed.startsWith("#")) {
        break;
      }
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const groupStart = rawLine.match(/^ {2}-\s+name:\s*(.*)$/);
      if (groupStart) {
        flushGroup();
        currentGroup = {
          name: parseYamlScalar(groupStart[1]),
          icon: "",
          items: []
        };
        continue;
      }
      if (!currentGroup) {
        continue;
      }
      const itemStart = rawLine.match(/^ {6}-\s+name:\s*(.*)$/);
      if (itemStart) {
        flushItem();
        currentItem = {
          name: parseYamlScalar(itemStart[1])
        };
        continue;
      }
      const groupField = rawLine.match(/^ {4}([A-Za-z0-9_]+):\s*(.*)$/);
      if (groupField && !currentItem) {
        if (groupField[1] !== "items") {
          currentGroup[groupField[1]] = parseYamlScalar(groupField[2]);
        }
        continue;
      }
      const itemField = rawLine.match(/^ {8,}([A-Za-z0-9_]+):\s*(.*)$/);
      if (itemField && currentItem) {
        currentItem[itemField[1]] = parseYamlScalar(itemField[2]);
      }
    }
    flushGroup();
    return { services, theme };
  }
  function parseYamlScalar(raw) {
    const value = stripYamlComment(raw).trim();
    if (!value) {
      return "";
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1).replace(/''/g, "'");
    }
    return value;
  }
  function stripYamlComment(raw) {
    let inSingle = false;
    let inDouble = false;
    for (let index = 0; index < raw.length; index += 1) {
      const char = raw[index];
      if (char === "'" && !inDouble) {
        inSingle = !inSingle;
        continue;
      }
      if (char === '"' && !inSingle) {
        inDouble = !inDouble;
        continue;
      }
      if (char === "#" && !inSingle && !inDouble) {
        return raw.slice(0, index);
      }
    }
    return raw;
  }
  function normalizeText(value, maxLength) {
    return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
  }
  function normalizeClassName(value) {
    if (typeof value !== "string") {
      return "";
    }
    return value.split(/\s+/).map((part) => part.trim()).filter((part) => /^[A-Za-z0-9_-]+$/.test(part)).join(" ");
  }
  function normalizeCssColor(value) {
    if (typeof value !== "string") {
      return "";
    }
    const color = value.trim();
    return color && color.length <= 80 && !/[;{}]/.test(color) ? color : "";
  }
  async function shouldSkipHomerSyncByNetwork(endpoints) {
    const homerIp = getPrivateIPv4FromUrl(endpoints.configUrl);
    if (!homerIp) {
      return false;
    }
    const localIps = await getLocalIPv4Candidates(LOCAL_IP_DETECTION_TIMEOUT_MS);
    if (!localIps.length) {
      return false;
    }
    return !localIps.some((ip) => isSameLikelyLan(ip, homerIp));
  }
  function getPrivateIPv4FromUrl(rawUrl) {
    try {
      const host = new URL(rawUrl).hostname;
      return isPrivateIPv4(host) ? host : "";
    } catch {
      return "";
    }
  }
  async function getLocalIPv4Candidates(timeoutMs) {
    if (typeof RTCPeerConnection !== "function") {
      return [];
    }
    const ips = /* @__PURE__ */ new Set();
    const peer = new RTCPeerConnection({ iceServers: [] });
    const done = new Promise((resolve) => {
      const timer = window.setTimeout(resolve, timeoutMs);
      peer.addEventListener("icecandidate", (event) => {
        const candidate = event.candidate?.candidate || "";
        for (const match of candidate.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)) {
          const ip = match[0];
          if (isPrivateIPv4(ip)) {
            ips.add(ip);
          }
        }
        if (!event.candidate) {
          window.clearTimeout(timer);
          resolve();
        }
      });
    });
    try {
      peer.createDataChannel("lan-check");
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await done;
    } catch {
    } finally {
      peer.close();
    }
    return Array.from(ips);
  }
  function isPrivateIPv4(ip) {
    const parts = parseIPv4(ip);
    if (!parts) {
      return false;
    }
    const [a, b] = parts;
    return a === 10 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168;
  }
  function isSameLikelyLan(localIp, homerIp) {
    const local = parseIPv4(localIp);
    const homer = parseIPv4(homerIp);
    if (!local || !homer) {
      return false;
    }
    if (homer[0] === 10) {
      return local[0] === homer[0];
    }
    if (homer[0] === 172) {
      return local[0] === homer[0] && local[1] === homer[1];
    }
    return local[0] === homer[0] && local[1] === homer[1] && local[2] === homer[2];
  }
  function parseIPv4(ip) {
    const parts = String(ip).split(".").map((part) => Number.parseInt(part, 10));
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return null;
    }
    return parts;
  }
  function deriveHomerEndpoints(input) {
    if (!input || !input.trim()) {
      return null;
    }
    let raw = input.trim();
    if (!/^https?:\/\//i.test(raw)) {
      raw = `http://${raw}`;
    }
    try {
      const source = new URL(raw);
      const cleanPath = source.pathname.replace(/\/+$/, "");
      const isConfig = /\.(yml|yaml|json)$/i.test(cleanPath);
      if (isConfig) {
        const configUrl = source.href;
        const iframeUrl = /\/assets\/config\.(yml|yaml|json)$/i.test(cleanPath) ? `${source.origin}/` : new URL(".", configUrl).href;
        return { configUrl, iframeUrl };
      }
      if (/\/assets$/i.test(cleanPath)) {
        const assetsUrl = source.href.endsWith("/") ? source.href : `${source.href}/`;
        return {
          configUrl: new URL("config.yml", assetsUrl).href,
          iframeUrl: `${source.origin}/`
        };
      }
      const rootUrl = source.href.endsWith("/") ? source.href : `${source.href}/`;
      return {
        configUrl: new URL("assets/config.yml", rootUrl).href,
        iframeUrl: rootUrl
      };
    } catch {
      return null;
    }
  }
  function resolveMaybeRelativeUrl(value, configUrl) {
    if (!value) {
      return "";
    }
    if (/^https?:\/\//i.test(value)) {
      return value;
    }
    if (!configUrl) {
      return value;
    }
    try {
      return new URL(value, configUrl).href;
    } catch {
      return value;
    }
  }
  function resolveAssetUrl(value, configUrl) {
    if (!value) {
      return "";
    }
    if (!configUrl) {
      return value;
    }
    try {
      if (/^https?:\/\//i.test(value)) {
        return repairDuplicatedAssetsUrl(value);
      }
      if (/^\/\//i.test(value) || value.startsWith("data:")) {
        return value;
      }
      const base = new URL(configUrl);
      const cleaned = value.replace(/^\.?\//, "");
      if (/^assets\//i.test(cleaned)) {
        return `${base.origin}/${cleaned}`;
      }
      if (value.startsWith("/")) {
        return `${base.origin}${value}`;
      }
      return new URL(value, configUrl).href;
    } catch {
      return "";
    }
  }
  function repairDuplicatedAssetsUrl(value) {
    try {
      const url = new URL(value);
      url.pathname = url.pathname.replace(/\/assets\/assets\//i, "/assets/");
      return url.href;
    } catch {
      return value;
    }
  }

  // src/state.js
  function normalizeBootConfig(raw) {
    const fallback = clone(FALLBACK_CONFIG);
    const source = raw && typeof raw === "object" ? raw : {};
    return {
      homer: normalizeHomerSettings(source.homer, fallback.homer),
      theme: {
        backgroundDark: typeof source.theme?.backgroundDark === "string" ? source.theme.backgroundDark : fallback.theme.backgroundDark,
        backgroundLight: typeof source.theme?.backgroundLight === "string" ? source.theme.backgroundLight : fallback.theme.backgroundLight
      },
      search: normalizeSearch(source.search, fallback.search),
      quickLinks: normalizeQuickLinks(source.quickLinks, fallback.quickLinks),
      visits: normalizeVisitSettings(source.visits, fallback.visits),
      weather: normalizeWeatherSettings(source.weather, fallback.weather),
      githubTrending: normalizeGitHubTrendingSettings(source.githubTrending, fallback.githubTrending),
      services: normalizeServiceGroups(source.services, "")
    };
  }
  function createDefaultState(baseConfig) {
    return {
      search: clone(baseConfig.search),
      quickLinks: clone(baseConfig.quickLinks),
      homer: clone(baseConfig.homer),
      visits: clone(baseConfig.visits),
      weather: clone(baseConfig.weather),
      githubTrending: clone(baseConfig.githubTrending)
    };
  }
  function normalizeState(raw, baseConfig) {
    const base = createDefaultState(baseConfig);
    if (!raw || typeof raw !== "object") {
      return base;
    }
    return {
      search: normalizeSearch(raw.search, base.search),
      quickLinks: normalizeQuickLinks(raw.quickLinks, base.quickLinks),
      homer: normalizeHomerSettings(raw.homer, base.homer),
      visits: normalizeVisitSettings(raw.visits, base.visits),
      weather: normalizeWeatherSettings(raw.weather, base.weather),
      githubTrending: normalizeGitHubTrendingSettings(raw.githubTrending, base.githubTrending)
    };
  }
  function normalizeSyncedState(raw, baseConfig) {
    const state = normalizeState(raw, baseConfig);
    state.search.defaultEngineId = "";
    return state;
  }
  function createSyncedState(state) {
    return {
      search: {
        engines: clone(state.search.engines)
      },
      quickLinks: clone(state.quickLinks),
      homer: clone(state.homer),
      visits: clone(state.visits),
      weather: clone(state.weather),
      githubTrending: clone(state.githubTrending)
    };
  }
  function normalizeLocalPatch(raw, state) {
    const source = raw && typeof raw === "object" ? raw : {};
    const engineIds = new Set(state.search.engines.map((engine) => engine.id));
    const quickLinkIds = new Set(state.quickLinks.map((link) => link.id));
    const disabledEngineIds = normalizeIdList(source.search?.disabledEngineIds, engineIds);
    const disabledLinkIds = normalizeIdList(source.quickLinks?.disabledLinkIds, quickLinkIds);
    const visibleEngineIds = state.search.engines.map((engine) => engine.id).filter((id) => !disabledEngineIds.includes(id));
    const defaultEngineId = typeof source.search?.defaultEngineId === "string" && visibleEngineIds.includes(source.search.defaultEngineId) ? source.search.defaultEngineId : visibleEngineIds[0] || "";
    return {
      viewMode: normalizeViewMode(source.viewMode),
      search: {
        defaultEngineId,
        disabledEngineIds
      },
      quickLinks: {
        disabledLinkIds
      },
      homer: {
        disabled: source.homer?.disabled === true
      },
      weather: {
        topDisabled: source.weather?.disabled === true || source.weather?.topDisabled === true,
        cardDisabled: source.weather?.disabled === true || source.weather?.cardDisabled === true,
        locationName: normalizeWeatherLocationName(source.weather?.locationName)
      },
      githubTrending: {
        disabled: source.githubTrending?.disabled === true
      },
      visits: {
        showFrequent: source.visits?.showFrequent !== false,
        showRecent: source.visits?.showRecent !== false
      }
    };
  }
  function normalizeViewMode(value) {
    return ["full", "base", "zen"].includes(value) ? value : "full";
  }
  function applyLocalPatch(state, localPatch) {
    const next = normalizeState(state, state);
    const patch = normalizeLocalPatch(localPatch, next);
    next.search.defaultEngineId = patch.search.defaultEngineId || getVisibleSearchEngines({ state: next, localPatch: patch })[0]?.id || "";
    return next;
  }
  function getVisibleSearchEngines(app2) {
    const disabled = new Set(app2.localPatch?.search?.disabledEngineIds || []);
    return app2.state.search.engines.filter((engine) => !disabled.has(engine.id));
  }
  function getVisibleQuickLinks(app2) {
    const disabled = new Set(app2.localPatch?.quickLinks?.disabledLinkIds || []);
    return app2.state.quickLinks.filter((link) => !disabled.has(link.id));
  }
  function normalizeIdList(raw, allowedIds) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const value of raw) {
      const id = typeof value === "string" ? value.trim() : "";
      if (!id || !allowedIds.has(id) || seen.has(id)) {
        continue;
      }
      seen.add(id);
      out.push(id);
    }
    return out;
  }
  function normalizeWeatherLocationName(value) {
    if (typeof value !== "string") {
      return "";
    }
    return value.replace(/\s+/g, " ").trim().slice(0, 120);
  }
  function normalizeSearch(raw, fallback) {
    const fallbackSearch = fallback || FALLBACK_CONFIG.search;
    const engines = Array.isArray(raw?.engines) ? raw.engines.map(normalizeSearchEngine).filter(Boolean) : clone(fallbackSearch.engines);
    if (!engines.length) {
      engines.push(...clone(FALLBACK_CONFIG.search.engines));
    }
    const defaultEngineId = typeof raw?.defaultEngineId === "string" && engines.some((engine) => engine.id === raw.defaultEngineId) ? raw.defaultEngineId : engines[0].id;
    return { engines, defaultEngineId };
  }
  function normalizeSearchEngine(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const template = typeof raw.template === "string" ? raw.template.trim() : "";
    if (!title || !template) {
      return null;
    }
    return {
      id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : makeId("engine"),
      title,
      template
    };
  }
  function normalizeQuickLinks(raw, fallback) {
    const source = Array.isArray(raw) ? raw : fallback || [];
    return source.map((link) => ({
      id: typeof link?.id === "string" && link.id ? link.id : makeId("quick"),
      title: typeof link?.title === "string" ? link.title.trim() : "",
      url: typeof link?.url === "string" ? link.url.trim() : ""
    })).filter((link) => link.url);
  }
  function normalizeHomerSettings(raw, fallback) {
    const base = fallback || FALLBACK_CONFIG.homer;
    return {
      url: typeof raw?.url === "string" ? raw.url : base.url || ""
    };
  }
  function normalizeVisitSettings(raw, fallback) {
    const base = fallback || FALLBACK_CONFIG.visits;
    return {
      frequentHistoryPool: clampInt(raw?.frequentHistoryPool, 50, 5e4, base.frequentHistoryPool),
      frequentMinVisits: clampInt(raw?.frequentMinVisits, 2, 1e3, base.frequentMinVisits)
    };
  }
  function normalizeWeatherSettings(raw, fallback) {
    const base = fallback || FALLBACK_CONFIG.weather;
    return {
      topWidgetPlacement: normalizeTopWeatherPlacement(raw?.topWidgetPlacement, base.topWidgetPlacement)
    };
  }
  function normalizeTopWeatherPlacement(value, fallback = "actions") {
    return ["actions", "center"].includes(value) ? value : fallback;
  }
  function normalizeGitHubTrendingSettings(raw, fallback) {
    const base = fallback || FALLBACK_CONFIG.githubTrending;
    return {
      excludedTerms: normalizeGitHubTrendingExcludedTerms(raw?.excludedTerms, base.excludedTerms),
      syncIntervalMinutes: clampInt(raw?.syncIntervalMinutes, 15, 1440, base.syncIntervalMinutes)
    };
  }
  function normalizeGitHubTrendingExcludedTerms(raw, fallback = []) {
    const source = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[\s,;]+/) : fallback;
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const value of source || []) {
      const term = String(value || "").trim().replace(/^-+/, "").toLowerCase();
      if (!term || term.length > 40 || !/^[a-z0-9_.#+-]+$/i.test(term) || seen.has(term)) {
        continue;
      }
      seen.add(term);
      out.push(term);
      if (out.length >= 20) {
        break;
      }
    }
    return out;
  }
  function normalizeQuickLinkMeta(raw) {
    if (!raw || typeof raw !== "object") {
      return {};
    }
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!key || !value || typeof value !== "object") {
        continue;
      }
      out[key] = {
        fetchedAt: Number.isFinite(value.fetchedAt) ? value.fetchedAt : 0,
        title: typeof value.title === "string" ? value.title : "",
        iconDataUrl: typeof value.iconDataUrl === "string" && value.iconDataUrl.startsWith("data:image/") ? value.iconDataUrl : "",
        iconSize: Number.isFinite(value.iconSize) ? value.iconSize : 0
      };
    }
    return out;
  }
  function normalizeSearchEngineMeta(raw) {
    if (!raw || typeof raw !== "object") {
      return {};
    }
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!key || !value || typeof value !== "object") {
        continue;
      }
      out[key] = {
        fetchedAt: Number.isFinite(value.fetchedAt) ? value.fetchedAt : 0,
        iconDataUrl: typeof value.iconDataUrl === "string" && value.iconDataUrl.startsWith("data:image/") ? value.iconDataUrl : "",
        iconSize: Number.isFinite(value.iconSize) ? value.iconSize : 0
      };
    }
    return out;
  }
  function normalizeVisitHistory(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const item of raw) {
      const normalized = normalizeVisitHistoryItem(item);
      const key = normalized ? normalizeUrlKey(normalized.url) : "";
      if (!normalized || !key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      out.push(normalized);
      if (out.length >= VISIT_HISTORY_LIMIT) {
        break;
      }
    }
    return out;
  }
  function normalizeVisitHistoryItem(raw) {
    if (!raw || typeof raw !== "object" || !isHttpUrl(raw.url)) {
      return null;
    }
    const title = String(raw.title || "").replace(/\s+/g, " ").trim();
    const fallbackTitle = toDomain(raw.url) || raw.url;
    return {
      title: title ? truncateHistoryTitle(title) : fallbackTitle,
      url: raw.url,
      source: typeof raw.source === "string" ? raw.source : "",
      visitCount: Number.isFinite(raw.visitCount) ? raw.visitCount : 0,
      visitedAt: Number.isFinite(raw.visitedAt) ? raw.visitedAt : Number.isFinite(raw.lastVisitTime) ? raw.lastVisitTime : Date.now()
    };
  }

  // src/metadata.js
  var FAVICON_SIZE = 128;
  var MIN_FRESH_ICON_SIZE = 96;
  var MAX_ICON_BYTES = 512 * 1024;
  function getQuickLinkMeta(app2, url) {
    const key = normalizeUrlKey(url);
    return key ? app2.quickLinkMeta[key] || null : null;
  }
  function getSearchEngineMeta(app2, engine) {
    const key = getSearchEngineMetaKey(engine);
    return key ? app2.searchEngineMeta[key] || null : null;
  }
  function getSearchEngineMetaKey(engine) {
    return normalizeUrlKey(getSearchEngineIconPageUrl(engine));
  }
  function getSearchEngineIconPageUrl(engine) {
    const template = typeof engine?.template === "string" ? engine.template.trim() : "";
    if (!template) {
      return "";
    }
    try {
      const url = new URL(template.replace(/\{q\}/g, ""));
      return `${url.origin}/`;
    } catch {
      return "";
    }
  }
  function getQuickLinkTitle(link, meta) {
    const customTitle = typeof link.title === "string" ? link.title.trim() : "";
    if (customTitle) {
      return truncateTitle(customTitle);
    }
    if (meta?.title) {
      return truncateTitle(meta.title);
    }
    return truncateTitle(toDomain(link.url) || link.url);
  }
  async function refreshQuickLinkMetadata(app2, { force }) {
    const links = getVisibleQuickLinks(app2).filter((link) => isHttpUrl(link.url));
    let changed = false;
    const seen = /* @__PURE__ */ new Set();
    for (const link of links) {
      const key = normalizeUrlKey(link.url);
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      const cached = app2.quickLinkMeta[key];
      if (!force && isFreshIconMeta(cached)) {
        continue;
      }
      const meta = await fetchQuickLinkMetadata(link.url);
      app2.quickLinkMeta[key] = {
        fetchedAt: Date.now(),
        title: meta.title || cached?.title || "",
        iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
        iconSize: meta.iconDataUrl ? meta.iconSize : cached?.iconSize || 0
      };
      changed = true;
      app2.renderQuickLinks();
    }
    if (changed) {
      pruneQuickLinkMeta(app2, seen);
      await storageSet(QUICK_LINK_META_KEY, app2.quickLinkMeta, LOCAL_AREA);
    }
  }
  async function refreshSearchEngineMetadata(app2, { force }) {
    const engines = getVisibleSearchEngines(app2);
    let changed = false;
    const seen = /* @__PURE__ */ new Set();
    for (const engine of engines) {
      const key = getSearchEngineMetaKey(engine);
      const iconPageUrl = getSearchEngineIconPageUrl(engine);
      if (!key || !iconPageUrl || seen.has(key)) {
        continue;
      }
      seen.add(key);
      const cached = app2.searchEngineMeta[key];
      if (!force && isFreshIconMeta(cached)) {
        continue;
      }
      const meta = await fetchQuickLinkMetadata(iconPageUrl);
      app2.searchEngineMeta[key] = {
        fetchedAt: Date.now(),
        iconDataUrl: meta.iconDataUrl || cached?.iconDataUrl || "",
        iconSize: meta.iconDataUrl ? meta.iconSize : cached?.iconSize || 0
      };
      changed = true;
      app2.renderSearchButtons();
    }
    if (changed) {
      pruneSearchEngineMeta(app2, seen);
      await storageSet(SEARCH_ENGINE_META_KEY, app2.searchEngineMeta, LOCAL_AREA);
    }
  }
  async function fetchQuickLinkMetadata(url) {
    const pageUrl = url;
    const pageMeta = await fetchPageMetadata(pageUrl);
    const candidates = [
      ...pageMeta.iconCandidates,
      createIconCandidate(getChromeFaviconUrl(pageUrl, FAVICON_SIZE), 1, FAVICON_SIZE),
      createIconCandidate(getDefaultFaviconUrl(pageUrl), 0, 16)
    ].filter(Boolean).sort(compareIconCandidates);
    for (const candidate of uniqueIconCandidates(candidates)) {
      const icon = await fetchIconDataUrl(candidate.url, candidate.size);
      if (icon.iconDataUrl) {
        return {
          title: pageMeta.title,
          iconDataUrl: icon.iconDataUrl,
          iconSize: icon.iconSize
        };
      }
    }
    return {
      title: pageMeta.title,
      iconDataUrl: "",
      iconSize: 0
    };
  }
  function isFreshIconMeta(meta) {
    return Boolean(
      meta?.fetchedAt && Date.now() - meta.fetchedAt < QUICK_LINK_META_TTL_MS && meta.iconDataUrl && meta.iconSize >= MIN_FRESH_ICON_SIZE
    );
  }
  async function fetchPageMetadata(pageUrl) {
    try {
      const response = await fetchWithTimeout(pageUrl, 6500, { cache: "force-cache" });
      if (!response.ok) {
        return { title: "", iconCandidates: [] };
      }
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        return { title: "", iconCandidates: [] };
      }
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const title = normalizeTitle(doc.querySelector("title")?.textContent);
      const candidates = collectHtmlIconCandidates(doc, pageUrl);
      const manifestCandidates = await collectManifestIconCandidates(doc, pageUrl);
      return { title, iconCandidates: [...manifestCandidates, ...candidates] };
    } catch {
      return { title: "", iconCandidates: [] };
    }
  }
  function collectHtmlIconCandidates(doc, pageUrl) {
    const candidates = [];
    doc.querySelectorAll("link[rel][href]").forEach((link) => {
      const rel = String(link.getAttribute("rel") || "").toLowerCase();
      if (!/\b(icon|apple-touch-icon|mask-icon)\b/.test(rel)) {
        return;
      }
      const href = resolveUrl(link.getAttribute("href"), pageUrl);
      if (!href) {
        return;
      }
      const size = parseSizes(link.getAttribute("sizes"));
      let weight = 2;
      if (rel.includes("apple-touch-icon")) {
        weight = 5;
      } else if (rel.includes("mask-icon")) {
        weight = 3;
      } else if (size >= 96) {
        weight = 4;
      }
      candidates.push(createIconCandidate(href, weight, size));
    });
    return candidates.filter(Boolean);
  }
  async function collectManifestIconCandidates(doc, pageUrl) {
    const manifestUrl = resolveUrl(doc.querySelector('link[rel~="manifest"][href]')?.getAttribute("href"), pageUrl);
    if (!manifestUrl) {
      return [];
    }
    try {
      const response = await fetchWithTimeout(manifestUrl, 6500, { cache: "force-cache" });
      if (!response.ok) {
        return [];
      }
      const manifest = await response.json();
      if (!Array.isArray(manifest.icons)) {
        return [];
      }
      return manifest.icons.map((icon) => {
        const url = resolveUrl(icon?.src, manifestUrl);
        const size = parseSizes(icon?.sizes);
        const purpose = String(icon?.purpose || "").toLowerCase();
        const type = String(icon?.type || "").toLowerCase();
        let weight = purpose.includes("maskable") ? 4 : 6;
        if (type.includes("svg")) {
          weight += 1;
        }
        return createIconCandidate(url, weight, size);
      }).filter(Boolean);
    } catch {
      return [];
    }
  }
  async function fetchIconDataUrl(iconUrl, expectedSize = 0) {
    try {
      const response = await fetchWithTimeout(iconUrl, 6500, { cache: "force-cache" });
      if (!response.ok) {
        return { iconDataUrl: "", iconSize: 0 };
      }
      const blob = normalizeIconBlob(await response.blob(), iconUrl);
      if (!isSupportedIconBlob(blob)) {
        return { iconDataUrl: "", iconSize: 0 };
      }
      const iconDataUrl = await blobToDataUrl(blob);
      return {
        iconDataUrl,
        iconSize: blob.type.includes("svg") ? Math.max(expectedSize, FAVICON_SIZE) : await getImageSize(iconDataUrl)
      };
    } catch {
      return { iconDataUrl: "", iconSize: 0 };
    }
  }
  function normalizeIconBlob(blob, iconUrl) {
    const isIco = /\.ico(?:[?#].*)?$/i.test(iconUrl);
    if (!blob || !isIco || blob.type.startsWith("image/")) {
      return blob;
    }
    return new Blob([blob], { type: "image/x-icon" });
  }
  function isSupportedIconBlob(blob) {
    if (!blob || blob.size > MAX_ICON_BYTES) {
      return false;
    }
    return blob.type.startsWith("image/") || blob.type === "application/octet-stream";
  }
  function getImageSize(dataUrl) {
    if (!dataUrl) {
      return 0;
    }
    return new Promise((resolve) => {
      const image = new Image();
      image.addEventListener("load", () => {
        resolve(Math.max(image.naturalWidth || 0, image.naturalHeight || 0));
      });
      image.addEventListener("error", () => {
        resolve(0);
      });
      image.src = dataUrl;
    });
  }
  function createIconCandidate(url, weight, size) {
    if (!url || !isHttpUrl(url)) {
      return null;
    }
    return { url, weight, size: Number.isFinite(size) ? size : 0 };
  }
  function compareIconCandidates(a, b) {
    const weightDiff = b.weight - a.weight;
    if (weightDiff) {
      return weightDiff;
    }
    return b.size - a.size;
  }
  function uniqueIconCandidates(candidates) {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const candidate of candidates) {
      const key = normalizeUrlKey(candidate.url) || candidate.url;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      out.push(candidate);
    }
    return out;
  }
  function parseSizes(value) {
    const matches = String(value || "").match(/\d+x\d+/gi);
    if (!matches) {
      return 0;
    }
    return Math.max(
      ...matches.map((item) => {
        const [width, height] = item.split("x").map((part) => Number.parseInt(part, 10));
        return Math.max(width || 0, height || 0);
      })
    );
  }
  function resolveUrl(value, baseUrl) {
    try {
      const raw = String(value || "").trim();
      return raw ? new URL(raw, baseUrl).href : "";
    } catch {
      return "";
    }
  }
  function normalizeTitle(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function getDefaultFaviconUrl(url) {
    try {
      return new URL("/favicon.ico", url).href;
    } catch {
      return "";
    }
  }
  function getChromeFaviconUrl(pageUrl, size) {
    if (typeof globalThis.chrome?.runtime?.getURL !== "function" || !isHttpUrl(pageUrl)) {
      return "";
    }
    const url = new URL(globalThis.chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", pageUrl);
    url.searchParams.set("size", String(size));
    return url.href;
  }
  function pruneQuickLinkMeta(app2, activeKeys) {
    for (const key of Object.keys(app2.quickLinkMeta)) {
      if (!activeKeys.has(key)) {
        delete app2.quickLinkMeta[key];
      }
    }
  }
  function pruneSearchEngineMeta(app2, activeKeys) {
    for (const key of Object.keys(app2.searchEngineMeta)) {
      if (!activeKeys.has(key)) {
        delete app2.searchEngineMeta[key];
      }
    }
  }

  // src/render/search.js
  function renderSearchButtons(app2) {
    const { refs } = app2;
    refs.searchButtons.replaceChildren();
    const engines = getVisibleSearchEngines(app2);
    for (const engine of engines) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-button";
      button.title = engine.title;
      button.setAttribute("aria-label", button.title || t("searchAria"));
      button.classList.toggle("active", engine.id === app2.state.search.defaultEngineId);
      button.append(createSearchEngineIcon(app2, engine));
      button.addEventListener("click", () => {
        const query = refs.searchInput.value.trim();
        if (query) {
          app2.runSearch(engine, query);
          return;
        }
        app2.localPatch.search.defaultEngineId = engine.id;
        void app2.persistLocalPatch();
        app2.state.search.defaultEngineId = engine.id;
        renderSearchButtons(app2);
        refs.searchInput.focus();
      });
      refs.searchButtons.append(button);
    }
  }
  function createSearchEngineIcon(app2, engine) {
    const icon = document.createElement("span");
    icon.className = "search-icon";
    const meta = getSearchEngineMeta(app2, engine);
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
  function renderQuickLinks(app2) {
    app2.refs.quickLinks.replaceChildren();
    for (const link of getVisibleQuickLinks(app2)) {
      app2.refs.quickLinks.append(createQuickLink(app2, link));
    }
  }
  function createQuickLink(app2, link) {
    const meta = getQuickLinkMeta(app2, link.url);
    const title = getQuickLinkTitle(link, meta);
    const iconDataUrl = meta?.iconDataUrl || "";
    const anchor = document.createElement("a");
    anchor.className = "quick-link";
    anchor.href = link.url;
    anchor.title = title;
    anchor.addEventListener("click", () => {
      void app2.addVisitHistoryItem({
        title,
        url: link.url,
        source: "quick"
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

  // src/render/services.js
  function renderServices(app2, services, emptyMessage = "") {
    app2.refs.servicesGrid.replaceChildren();
    if (!services.length) {
      if (!emptyMessage) {
        return;
      }
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = emptyMessage;
      app2.refs.servicesGrid.append(empty);
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
        card.append(createServiceRow(app2, item, group));
      }
      article.append(heading, card);
      app2.refs.servicesGrid.append(article);
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
        const normalized2 = normalizeSectionIcon(group.icon, group.name);
        span.innerHTML = ICONS[normalized2] || ICONS.network;
      });
      span.append(image);
      return span;
    }
    const normalized = normalizeSectionIcon(group.icon, group.name);
    span.innerHTML = ICONS[normalized] || ICONS.network;
    return span;
  }
  function createServiceRow(app2, item, group) {
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
      void app2.addVisitHistoryItem({
        title: item.name || item.url,
        url: item.url,
        source: "homer"
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
  function getVisibleServices(app2) {
    if (app2.localPatch?.homer?.disabled || !app2.state.homer.url) {
      return [];
    }
    if (app2.homerCache?.services?.length) {
      return app2.homerCache.services;
    }
    return [];
  }
  function getEmptyServicesMessage(app2) {
    return "";
  }
  function setStatusFromCurrentData(app2) {
    if (app2.localPatch?.homer?.disabled) {
      setStatus(app2, "local", "off", t("homerDisabled"));
      return;
    }
    if (!app2.state.homer.url) {
      setStatus(app2, "local", "no url", t("homerUrlMissing"));
      return;
    }
    if (app2.homerCache?.services?.length) {
      setStatus(app2, "cache", "cache", t("homerCache", formatDateTime(app2.homerCache.fetchedAt)));
      return;
    }
    setStatus(app2, "local", app2.homerCache?.services?.length ? "away" : "no homer", getEmptyServicesMessage(app2));
  }
  function setStatus(app2, kind, text, title) {
    app2.refs.statusButton.dataset.status = kind;
    app2.refs.statusText.textContent = text;
    app2.refs.statusButton.title = title;
  }

  // src/history.js
  async function addVisitHistoryItem(app2, item) {
    const normalized = normalizeVisitHistoryItem(item);
    if (!normalized) {
      return;
    }
    normalized.visitedAt = Date.now();
    app2.visitHistory = [
      normalized,
      ...app2.visitHistory.filter((existing) => normalizeUrlKey(existing.url) !== normalizeUrlKey(normalized.url))
    ].slice(0, VISIT_HISTORY_LIMIT);
    app2.renderVisitPanels();
    if (hasBrowserHistoryApi()) {
      return;
    }
    await storageSet(HISTORY_KEY, app2.visitHistory, LOCAL_AREA);
  }
  async function loadVisitHistory() {
    if (!hasBrowserHistoryApi()) {
      return normalizeVisitHistory(await storageGet(HISTORY_KEY));
    }
    return await new Promise((resolve) => {
      const chromeApi = globalThis.chrome;
      chromeApi.history.search(
        {
          text: "",
          startTime: 0,
          maxResults: VISIT_HISTORY_LIMIT * 3
        },
        (results) => {
          if (chromeApi.runtime.lastError) {
            resolve([]);
            return;
          }
          resolve(normalizeVisitHistory((results || []).filter((item) => isHttpUrl(item.url))));
        }
      );
    });
  }
  async function refreshVisitHistory(app2) {
    const [nextHistory, nextFrequent] = await Promise.all([loadVisitHistory(), loadFrequentVisits(app2)]);
    if (!nextHistory.length && !app2.visitHistory.length && !nextFrequent.length && !app2.frequentVisits.length) {
      return;
    }
    app2.visitHistory = nextHistory;
    app2.frequentVisits = nextFrequent;
    app2.renderVisitPanels();
  }
  function hasBrowserHistoryApi() {
    return typeof globalThis.chrome?.history?.search === "function";
  }
  async function loadFrequentVisits(app2) {
    if (!hasBrowserHistoryApi()) {
      return [];
    }
    const settings = normalizeVisitSettings(app2.state.visits, FALLBACK_CONFIG.visits);
    return await new Promise((resolve) => {
      const chromeApi = globalThis.chrome;
      chromeApi.history.search(
        {
          text: "",
          startTime: 0,
          maxResults: settings.frequentHistoryPool
        },
        (results) => {
          if (chromeApi.runtime.lastError) {
            resolve([]);
            return;
          }
          const frequent = (results || []).filter(
            (item) => isHttpUrl(item.url) && Number.isFinite(item.visitCount) && item.visitCount >= settings.frequentMinVisits
          ).sort((a, b) => {
            const visitsDiff = b.visitCount - a.visitCount;
            if (visitsDiff) {
              return visitsDiff;
            }
            return (b.lastVisitTime || 0) - (a.lastVisitTime || 0);
          });
          resolve(filterFrequentVisits(app2, normalizeVisitHistory(frequent)).slice(0, VISIT_HISTORY_LIMIT));
        }
      );
    });
  }
  function filterFrequentVisits(app2, items) {
    const excludedKeys = getFrequentVisitExcludedKeys(app2);
    if (!excludedKeys.size) {
      return items;
    }
    return items.filter((item) => {
      const key = normalizeUrlKey(item.url);
      return key && !excludedKeys.has(key);
    });
  }
  function getFrequentVisitExcludedKeys(app2) {
    const keys = /* @__PURE__ */ new Set();
    for (const link of getVisibleQuickLinks(app2)) {
      const key = normalizeUrlKey(link.url);
      if (key) {
        keys.add(key);
      }
    }
    const homerKey = normalizeUrlKey(app2.state?.homer?.url);
    if (homerKey) {
      keys.add(homerKey);
    }
    return keys;
  }

  // src/render/visits.js
  function renderVisitPanels(app2) {
    renderVisitList({
      panel: app2.refs.frequentPanel,
      list: app2.refs.frequentList,
      items: filterFrequentVisits(app2, app2.frequentVisits),
      isEnabled: app2.localPatch?.visits?.showFrequent !== false,
      metaFormatter: formatFrequentMeta,
      showVisitCount: true,
      app: app2
    });
    renderVisitList({
      panel: app2.refs.historyPanel,
      list: app2.refs.historyList,
      items: app2.visitHistory,
      isEnabled: app2.localPatch?.visits?.showRecent !== false,
      metaFormatter: formatHistoryMeta,
      showAddButton: true,
      hideAddedAction: true,
      app: app2
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
    app: app2
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
        void app2.addVisitHistoryItem(item);
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
        const action = createVisitAddButton(app2, item, { showVisitCount, hideAddedAction });
        if (action) {
          row.append(action);
        }
      }
      list.append(row);
    }
  }
  function createVisitAddButton(app2, item, { showVisitCount, hideAddedAction }) {
    const isAdded = hasVisibleQuickLink(app2, item.url);
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
      if (typeof app2.addQuickLinkFromVisit === "function") {
        void app2.addQuickLinkFromVisit(item);
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
  function hasVisibleQuickLink(app2, url) {
    const key = normalizeUrlKey(url);
    if (!key) {
      return false;
    }
    return getVisibleQuickLinks(app2).some((link) => normalizeUrlKey(link.url) === key);
  }

  // src/weather.js
  var FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
  var GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
  function normalizeWeatherCache(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const current = raw.current && typeof raw.current === "object" ? raw.current : {};
    const daily = raw.daily && typeof raw.daily === "object" ? raw.daily : {};
    const fetchedAt = Number.isFinite(raw.fetchedAt) ? raw.fetchedAt : 0;
    const latitude = Number.isFinite(raw.latitude) ? raw.latitude : null;
    const longitude = Number.isFinite(raw.longitude) ? raw.longitude : null;
    if (!fetchedAt || latitude === null || longitude === null || !Number.isFinite(current.temperature)) {
      return null;
    }
    return {
      fetchedAt,
      source: raw.source === "manual" ? "manual" : "geolocation",
      locationQuery: typeof raw.locationQuery === "string" ? raw.locationQuery : "",
      place: typeof raw.place === "string" ? raw.place : "",
      country: typeof raw.country === "string" ? raw.country : "",
      timezone: typeof raw.timezone === "string" ? raw.timezone : "",
      latitude,
      longitude,
      accuracy: Number.isFinite(raw.accuracy) ? raw.accuracy : null,
      current: {
        temperature: current.temperature,
        apparentTemperature: Number.isFinite(current.apparentTemperature) ? current.apparentTemperature : null,
        humidity: Number.isFinite(current.humidity) ? current.humidity : null,
        weatherCode: Number.isFinite(current.weatherCode) ? current.weatherCode : 0,
        windSpeed: Number.isFinite(current.windSpeed) ? current.windSpeed : null,
        windDirection: Number.isFinite(current.windDirection) ? current.windDirection : null,
        precipitation: Number.isFinite(current.precipitation) ? current.precipitation : null,
        isDay: current.isDay === 1 || current.isDay === true ? 1 : 0,
        time: typeof current.time === "string" ? current.time : ""
      },
      daily: {
        temperatureMax: Number.isFinite(daily.temperatureMax) ? daily.temperatureMax : null,
        temperatureMin: Number.isFinite(daily.temperatureMin) ? daily.temperatureMin : null,
        precipitationProbability: Number.isFinite(daily.precipitationProbability) ? daily.precipitationProbability : null
      }
    };
  }
  async function syncWeather(app2, { force = false } = {}) {
    if (app2.localPatch?.weather?.topDisabled && app2.localPatch?.weather?.cardDisabled) {
      app2.weatherStatus = null;
      renderWeatherWidget(app2);
      return;
    }
    if (!force && isWeatherCacheUsable(app2)) {
      app2.weatherStatus = null;
      renderWeatherWidget(app2);
      return;
    }
    if (!isWeatherCacheForCurrentSettings(app2)) {
      app2.weatherCache = null;
    }
    app2.weatherStatus = {
      kind: "loading",
      message: hasManualLocation(app2) ? t("weatherLoadingManual") : t("weatherLoadingGeo")
    };
    renderWeatherWidget(app2);
    try {
      const location = hasManualLocation(app2) ? await resolveManualLocation(app2.localPatch.weather.locationName) : await getBrowserLocation();
      const forecast = await fetchForecast(location);
      app2.weatherCache = normalizeWeatherCache({
        fetchedAt: Date.now(),
        source: location.source,
        locationQuery: location.locationQuery || "",
        place: location.place,
        country: location.country,
        timezone: forecast.timezone || "",
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        current: {
          temperature: forecast.current.temperature_2m,
          apparentTemperature: forecast.current.apparent_temperature,
          humidity: forecast.current.relative_humidity_2m,
          weatherCode: forecast.current.weather_code,
          windSpeed: forecast.current.wind_speed_10m,
          windDirection: forecast.current.wind_direction_10m,
          precipitation: forecast.current.precipitation,
          isDay: forecast.current.is_day,
          time: forecast.current.time
        },
        daily: {
          temperatureMax: forecast.daily.temperature_2m_max?.[0],
          temperatureMin: forecast.daily.temperature_2m_min?.[0],
          precipitationProbability: forecast.daily.precipitation_probability_max?.[0]
        }
      });
      await storageSet(WEATHER_CACHE_KEY, app2.weatherCache, LOCAL_AREA);
      app2.weatherStatus = null;
    } catch (error) {
      app2.weatherStatus = {
        kind: "error",
        message: error?.message || t("weatherUnavailable")
      };
    }
    renderWeatherWidget(app2);
  }
  function getWeatherSummary(cache) {
    const code = cache?.current?.weatherCode ?? 0;
    const condition = getWeatherCondition(code, cache?.current?.isDay !== 0);
    const place = cache?.source === "geolocation" ? formatGeoPlace(cache) : [cache?.place, cache?.country].filter(Boolean).join(", ");
    return {
      place: place || t("currentLocation"),
      placeTitle: formatGeoTitle(cache),
      icon: condition.icon,
      description: condition.description,
      temperature: formatTemperature(cache?.current?.temperature),
      apparentTemperature: formatTemperature(cache?.current?.apparentTemperature),
      minTemperature: formatTemperature(cache?.daily?.temperatureMin),
      maxTemperature: formatTemperature(cache?.daily?.temperatureMax),
      humidity: formatPercent(cache?.current?.humidity),
      precipitationProbability: formatPercent(cache?.daily?.precipitationProbability),
      wind: formatWind(cache?.current?.windSpeed, cache?.current?.windDirection),
      updatedAt: cache?.fetchedAt ? formatUpdatedLabel(cache, formatClockTime(cache.fetchedAt)) : "",
      updatedAtTitle: cache?.fetchedAt ? formatDateTime(cache.fetchedAt) : ""
    };
  }
  function isWeatherCacheUsable(app2) {
    if (!isCacheFresh(app2.weatherCache, WEATHER_SYNC_INTERVAL_MINUTES)) {
      return false;
    }
    return isWeatherCacheForCurrentSettings(app2);
  }
  function isWeatherCacheForCurrentSettings(app2) {
    if (!app2.weatherCache) {
      return false;
    }
    const locationName = normalizeLocationName(app2.localPatch?.weather?.locationName);
    if (locationName) {
      return app2.weatherCache.source === "manual" && app2.weatherCache.locationQuery === locationName;
    }
    return app2.weatherCache.source === "geolocation";
  }
  function hasManualLocation(app2) {
    return Boolean(normalizeLocationName(app2.localPatch?.weather?.locationName));
  }
  async function resolveManualLocation(rawLocationName) {
    const locationQuery = normalizeLocationName(rawLocationName);
    const coordinates = parseCoordinates(locationQuery);
    if (coordinates) {
      return {
        ...coordinates,
        source: "manual",
        locationQuery,
        place: locationQuery,
        country: ""
      };
    }
    const url = new URL(GEOCODING_URL);
    url.searchParams.set("name", locationQuery);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", LOCALE === "ru" ? "ru" : "en");
    url.searchParams.set("format", "json");
    const data = await fetchJsonWithTimeout(url.href, WEATHER_FETCH_TIMEOUT_MS);
    const match = Array.isArray(data?.results) ? data.results[0] : null;
    if (!match || !Number.isFinite(match.latitude) || !Number.isFinite(match.longitude)) {
      throw new Error(t("weatherLocationNotFound"));
    }
    return {
      source: "manual",
      locationQuery,
      latitude: match.latitude,
      longitude: match.longitude,
      place: makePlaceName(match),
      country: match.country || ""
    };
  }
  function getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t("weatherGeolocationUnsupported")));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            source: "geolocation",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            place: t("currentLocation"),
            country: ""
          });
        },
        () => reject(new Error(t("weatherGeolocationFailed"))),
        {
          enableHighAccuracy: false,
          maximumAge: WEATHER_SYNC_INTERVAL_MINUTES * 60 * 1e3,
          timeout: WEATHER_FETCH_TIMEOUT_MS
        }
      );
    });
  }
  async function fetchForecast(location) {
    const url = new URL(FORECAST_URL);
    url.searchParams.set("latitude", String(location.latitude));
    url.searchParams.set("longitude", String(location.longitude));
    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m"
      ].join(",")
    );
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("timezone", "auto");
    const data = await fetchJsonWithTimeout(url.href, WEATHER_FETCH_TIMEOUT_MS);
    if (!data?.current || !Number.isFinite(data.current.temperature_2m)) {
      throw new Error(t("weatherUnavailable"));
    }
    return data;
  }
  function parseCoordinates(value) {
    const match = value.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)\s*$/);
    if (!match) {
      return null;
    }
    const latitude = Number(match[1].replace(",", "."));
    const longitude = Number(match[2].replace(",", "."));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return null;
    }
    return { latitude, longitude };
  }
  function normalizeLocationName(value) {
    return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 120) : "";
  }
  function makePlaceName(location) {
    const parts = [];
    for (const value of [location.name, location.admin1]) {
      if (value && !parts.includes(value)) {
        parts.push(value);
      }
    }
    return parts.join(", ");
  }
  function formatGeoPlace(cache) {
    const coords = formatCoordinates(cache?.latitude, cache?.longitude, 2);
    const accuracy = formatAccuracy(cache?.accuracy);
    if (coords && accuracy) {
      return `${coords} \xB1${accuracy}`;
    }
    return coords;
  }
  function formatGeoTitle(cache) {
    const coords = formatCoordinates(cache?.latitude, cache?.longitude, 5);
    const accuracy = formatAccuracy(cache?.accuracy);
    if (coords && accuracy) {
      return `${t("currentLocation")}: ${coords}, ${accuracy}`;
    }
    return coords || "";
  }
  function formatCoordinates(latitude, longitude, digits) {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return "";
    }
    return `${latitude.toFixed(digits)}, ${longitude.toFixed(digits)}`;
  }
  function formatAccuracy(value) {
    if (!Number.isFinite(value)) {
      return "";
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)} km`;
    }
    return `${Math.round(value)} m`;
  }
  function formatClockTime(timestamp) {
    return new Intl.DateTimeFormat(LOCALE === "ru" ? "ru-RU" : "en-US", {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit"
    }).format(new Date(timestamp));
  }
  function formatUpdatedLabel(cache, updatedTime) {
    const label = cache?.source === "geolocation" ? LOCALE === "ru" ? "\u0442\u0443\u0442" : "here" : compactPlaceName(cache?.place);
    return [label, updatedTime].filter(Boolean).join(" \xB7 ");
  }
  function compactPlaceName(value) {
    return String(value || "").split(",")[0].trim();
  }
  function formatTemperature(value) {
    return Number.isFinite(value) ? `${Math.round(value)}\xB0` : "";
  }
  function formatPercent(value) {
    return Number.isFinite(value) ? `${Math.round(value)}%` : "";
  }
  function formatWind(speed, direction) {
    if (!Number.isFinite(speed)) {
      return "";
    }
    const rounded = Math.round(speed);
    const unit = LOCALE === "ru" ? "\u043A\u043C/\u0447" : "km/h";
    const point = getWindPoint(direction);
    return point ? `${rounded} ${unit} ${point}` : `${rounded} ${unit}`;
  }
  function getWindPoint(degrees) {
    if (!Number.isFinite(degrees)) {
      return "";
    }
    const points = LOCALE === "ru" ? ["\u0441\u0435\u0432\u0435\u0440", "\u0441-\u0432", "\u0432\u043E\u0441\u0442\u043E\u043A", "\u044E-\u0432", "\u044E\u0433", "\u044E-\u0437", "\u0437\u0430\u043F\u0430\u0434", "\u0441-\u0437"] : ["north", "NE", "east", "SE", "south", "SW", "west", "NW"];
    return points[Math.round(degrees / 45) % 8];
  }
  function getWeatherCondition(code, isDay) {
    const descriptions = {
      ru: {
        clear: "\u042F\u0441\u043D\u043E",
        mainlyClear: "\u041F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E \u044F\u0441\u043D\u043E",
        partlyCloudy: "\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u043E\u0431\u043B\u0430\u0447\u043D\u043E\u0441\u0442\u044C",
        overcast: "\u041F\u0430\u0441\u043C\u0443\u0440\u043D\u043E",
        fog: "\u0422\u0443\u043C\u0430\u043D",
        drizzle: "\u041C\u043E\u0440\u043E\u0441\u044C",
        rain: "\u0414\u043E\u0436\u0434\u044C",
        freezingRain: "\u041B\u0435\u0434\u044F\u043D\u043E\u0439 \u0434\u043E\u0436\u0434\u044C",
        snow: "\u0421\u043D\u0435\u0433",
        shower: "\u041B\u0438\u0432\u0435\u043D\u044C",
        thunderstorm: "\u0413\u0440\u043E\u0437\u0430",
        unknown: "\u041F\u043E\u0433\u043E\u0434\u0430"
      },
      en: {
        clear: "Clear",
        mainlyClear: "Mainly clear",
        partlyCloudy: "Partly cloudy",
        overcast: "Overcast",
        fog: "Fog",
        drizzle: "Drizzle",
        rain: "Rain",
        freezingRain: "Freezing rain",
        snow: "Snow",
        shower: "Showers",
        thunderstorm: "Thunderstorm",
        unknown: "Weather"
      }
    };
    const text = descriptions[LOCALE === "ru" ? "ru" : "en"];
    const byCode = {
      0: ["\u2600", text.clear],
      1: [isDay ? "\u2600" : "\u263E", text.mainlyClear],
      2: ["\u25D0", text.partlyCloudy],
      3: ["\u2601", text.overcast],
      45: ["\u224B", text.fog],
      48: ["\u224B", text.fog],
      51: ["\u2602", text.drizzle],
      53: ["\u2602", text.drizzle],
      55: ["\u2602", text.drizzle],
      56: ["\u2602", text.freezingRain],
      57: ["\u2602", text.freezingRain],
      61: ["\u2602", text.rain],
      63: ["\u2602", text.rain],
      65: ["\u2602", text.rain],
      66: ["\u2602", text.freezingRain],
      67: ["\u2602", text.freezingRain],
      71: ["\u2744", text.snow],
      73: ["\u2744", text.snow],
      75: ["\u2744", text.snow],
      77: ["\u2744", text.snow],
      80: ["\u2602", text.shower],
      81: ["\u2602", text.shower],
      82: ["\u2602", text.shower],
      85: ["\u2744", text.snow],
      86: ["\u2744", text.snow],
      95: ["\u26A1", text.thunderstorm],
      96: ["\u26A1", text.thunderstorm],
      99: ["\u26A1", text.thunderstorm]
    };
    const [icon, description] = byCode[code] || ["\u2601", text.unknown];
    return { icon, description };
  }

  // src/render/weather-widget.js
  function renderWeatherWidget(app2) {
    const { refs } = app2;
    document.body.dataset.topWeatherPlacement = app2.state.weather?.topWidgetPlacement || "actions";
    renderWeatherBlock(app2, {
      widget: refs.weatherWidget,
      icon: refs.weatherIcon,
      temp: refs.weatherTemp,
      place: refs.weatherPlace,
      condition: refs.weatherCondition,
      feels: refs.weatherFeels,
      range: refs.weatherRange,
      humidity: refs.weatherHumidity,
      wind: refs.weatherWind,
      rain: refs.weatherRain,
      updated: refs.weatherUpdated,
      refreshButton: refs.weatherRefreshButton,
      disabled: app2.localPatch?.weather?.cardDisabled === true
    });
    renderWeatherBlock(app2, {
      widget: refs.topWeatherWidget,
      icon: refs.topWeatherIcon,
      temp: refs.topWeatherTemp,
      place: refs.topWeatherPlace,
      condition: refs.topWeatherCondition,
      feels: refs.topWeatherFeels,
      range: refs.topWeatherRange,
      humidity: refs.topWeatherHumidity,
      wind: refs.topWeatherWind,
      rain: refs.topWeatherRain,
      updated: refs.topWeatherUpdated,
      refreshButton: refs.topWeatherRefreshButton,
      disabled: app2.localPatch?.weather?.topDisabled === true,
      splitUpdated: true
    });
  }
  function renderWeatherBlock(app2, refs) {
    if (!refs.widget) {
      return;
    }
    const disabled = refs.disabled === true;
    refs.widget.classList.toggle("hidden", disabled);
    if (disabled) {
      return;
    }
    const status = app2.weatherStatus;
    const cache = app2.weatherCache;
    refs.widget.dataset.state = status?.kind || (cache ? "ready" : "empty");
    if (cache) {
      const summary = getWeatherSummary(cache);
      refs.icon.textContent = summary.icon;
      refs.temp.textContent = "";
      refs.place.textContent = "";
      refs.place.title = summary.placeTitle || summary.place;
      refs.widget.title = summary.placeTitle || "";
      refs.condition.replaceChildren(createWeatherTempLine(summary));
      refs.feels.textContent = summary.description;
      refs.range.textContent = "";
      refs.humidity.textContent = summary.humidity ? t("weatherHumidity", summary.humidity) : "";
      refs.wind.textContent = summary.wind ? t("weatherWind", summary.wind) : "";
      refs.rain.textContent = summary.precipitationProbability ? t("weatherRain", summary.precipitationProbability) : "";
      setWeatherUpdated(refs, summary.updatedAt);
      refs.updated.title = status?.kind === "error" ? status.message : t("weatherUpdated", summary.updatedAtTitle);
      refs.refreshButton.disabled = status?.kind === "loading";
      return;
    }
    refs.icon.textContent = status?.kind === "loading" ? "\u2026" : "\u2601";
    refs.temp.textContent = "";
    refs.place.textContent = t("weatherTitle");
    refs.place.title = "";
    refs.widget.title = "";
    refs.condition.textContent = status?.message || t("weatherNeedsLocation");
    refs.feels.textContent = "";
    refs.range.textContent = "";
    refs.humidity.textContent = "";
    refs.wind.textContent = "";
    refs.rain.textContent = "";
    setWeatherUpdated(refs, t("weatherOpenSettingsHint"));
    refs.updated.title = "";
    refs.refreshButton.disabled = status?.kind === "loading";
  }
  function setWeatherUpdated(refs, value) {
    if (!refs.splitUpdated) {
      refs.updated.textContent = value;
      return;
    }
    const parts = String(value || "").split(" \xB7 ").filter(Boolean);
    if (parts.length < 2) {
      refs.updated.textContent = value;
      return;
    }
    refs.updated.replaceChildren(...parts.map(createWeatherUpdatedLine));
  }
  function createWeatherUpdatedLine(text) {
    const line = document.createElement("span");
    line.textContent = text;
    return line;
  }
  function createWeatherTempLine(summary) {
    const fragment = document.createDocumentFragment();
    const current = document.createElement("span");
    current.className = "weather-current-temp";
    current.textContent = summary.temperature;
    fragment.append(current);
    if (summary.minTemperature && summary.maxTemperature) {
      const range = document.createElement("span");
      range.className = "weather-temp-range";
      range.textContent = t("weatherRange", summary.minTemperature, summary.maxTemperature);
      fragment.append(range);
    }
    return fragment;
  }

  // src/render.js
  function renderAll(app2) {
    renderSearchButtons(app2);
    renderQuickLinks(app2);
    renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
    renderWeatherWidget(app2);
    renderGitHubTrending(app2);
    renderVisitPanels(app2);
    setStatusFromCurrentData(app2);
  }

  // src/github-trending.js
  var SEARCH_URL = "https://api.github.com/search/repositories";
  var MAX_ITEMS = 12;
  var SEARCH_PAGE_SIZE = 100;
  var MIN_STARS = 50;
  var CREATED_WITHIN_DAYS = 90;
  function normalizeGitHubTrendingCache(raw) {
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
      items
    };
  }
  async function syncGitHubTrending(app2, { force = false } = {}) {
    if (app2.localPatch?.githubTrending?.disabled) {
      app2.githubTrendingStatus = null;
      renderGitHubTrending(app2);
      return;
    }
    if (!force && isCacheFresh(app2.githubTrendingCache, getSyncIntervalMinutes(app2)) && app2.githubTrendingCache.queryKey === getTrendingQueryKey(app2)) {
      app2.githubTrendingStatus = null;
      renderGitHubTrending(app2);
      return;
    }
    app2.githubTrendingStatus = {
      kind: "loading",
      message: app2.githubTrendingCache ? "" : t("githubTrendingLoading")
    };
    renderGitHubTrending(app2);
    try {
      const query = getTrendingQuery();
      const queryKey = getTrendingQueryKey(app2);
      const data = await fetchTrendingRepositories(query);
      app2.githubTrendingCache = normalizeGitHubTrendingCache({
        fetchedAt: Date.now(),
        queryKey,
        items: filterExcludedRepositories(Array.isArray(data?.items) ? data.items : [], getExcludedTerms(app2)).slice(
          0,
          MAX_ITEMS
        )
      });
      if (!app2.githubTrendingCache) {
        throw new Error(t("githubTrendingUnavailable"));
      }
      app2.githubTrendingStatus = null;
      await storageSet(GITHUB_TRENDING_CACHE_KEY, app2.githubTrendingCache, LOCAL_AREA);
    } catch (error) {
      app2.githubTrendingStatus = {
        kind: "error",
        message: error?.message || t("githubTrendingUnavailable")
      };
    }
    renderGitHubTrending(app2);
  }
  function getGitHubTrendingSummary(cache) {
    const updatedAt = cache?.fetchedAt ? formatUpdatedAt(cache.fetchedAt, { includeDate: false }) : "";
    return {
      updatedAt,
      updatedAtTitle: cache?.fetchedAt ? formatUpdatedAt(cache.fetchedAt, { includeDate: true }) : "",
      items: Array.isArray(cache?.items) ? cache.items : []
    };
  }
  function normalizeTrendingItem(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const fullName = typeof raw.fullName === "string" ? raw.fullName.trim() : typeof raw.full_name === "string" ? raw.full_name.trim() : "";
    const url = typeof raw.url === "string" ? raw.url.trim() : typeof raw.html_url === "string" ? raw.html_url.trim() : "";
    if (!name || !fullName || !url) {
      return null;
    }
    const stars = Number.isFinite(raw.stars) ? raw.stars : Number.isFinite(raw.stargazers_count) ? raw.stargazers_count : 0;
    return {
      name,
      fullName,
      url,
      description: normalizeDescription(raw.description),
      language: typeof raw.language === "string" ? raw.language.trim() : "",
      stars,
      createdAt: typeof raw.createdAt === "string" ? raw.createdAt : typeof raw.created_at === "string" ? raw.created_at : "",
      pushedAt: typeof raw.pushedAt === "string" ? raw.pushedAt : typeof raw.pushed_at === "string" ? raw.pushed_at : "",
      ownerAvatarUrl: typeof raw.ownerAvatarUrl === "string" ? raw.ownerAvatarUrl : typeof raw.owner?.avatar_url === "string" ? raw.owner.avatar_url : ""
    };
  }
  function normalizeDescription(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function getTrendingQuery() {
    const createdAfter = new Date(Date.now() - CREATED_WITHIN_DAYS * 24 * 60 * 60 * 1e3).toISOString().slice(0, 10);
    return [`created:>=${createdAfter}`, `stars:>=${MIN_STARS}`, "archived:false", "fork:false", "topic:developer-tools"].join(
      " "
    );
  }
  function getTrendingQueryKey(app2) {
    return [getTrendingQuery(), ...getExcludedTerms(app2).map((term) => `-${term}`)].join(" ");
  }
  function getExcludedTerms(app2) {
    return Array.isArray(app2.state?.githubTrending?.excludedTerms) ? app2.state.githubTrending.excludedTerms : [];
  }
  function getSyncIntervalMinutes(app2) {
    const interval = Number(app2.state?.githubTrending?.syncIntervalMinutes);
    return Number.isFinite(interval) && interval > 0 ? interval : 60;
  }
  function filterExcludedRepositories(items, excludedTerms) {
    if (!excludedTerms.length) {
      return items;
    }
    return items.filter((item) => !matchesExcludedTerm(item, excludedTerms));
  }
  function matchesExcludedTerm(item, excludedTerms) {
    const haystack = [item?.full_name, item?.name, item?.description, ...Array.isArray(item?.topics) ? item.topics : []].filter(Boolean).join(" ").toLowerCase();
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
  function formatStars(value) {
    const stars = Number(value);
    if (!Number.isFinite(stars) || stars <= 0) {
      return "";
    }
    if (stars >= 1e3) {
      const compact = stars / 1e3;
      return `${compact >= 10 ? Math.round(compact) : compact.toFixed(1)}k`;
    }
    return String(Math.round(stars));
  }
  function formatRepositoryAge(item) {
    const timestamp = Date.parse(item?.createdAt || "");
    if (!Number.isFinite(timestamp)) {
      return "";
    }
    const days = Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1e3)));
    if (LOCALE === "ru") {
      if (days < 1) {
        return "\u0441\u0435\u0433\u043E\u0434\u043D\u044F";
      }
      if (days === 1) {
        return "1 \u0434\u0435\u043D\u044C";
      }
      return `${days} \u0434\u043D.`;
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
    const today = /* @__PURE__ */ new Date();
    const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    const locale = LOCALE === "ru" ? "ru-RU" : "en-GB";
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    };
    if (includeDate || !isToday) {
      options.day = "2-digit";
      options.month = "2-digit";
    }
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  // src/settings.js
  function openSettings(app2) {
    app2.settingsDraft = clone(app2.state);
    app2.localPatchDraft = clone(app2.localPatch);
    renderSettings(app2);
    app2.refs.settingsOverlay.classList.remove("hidden");
    app2.refs.homerUrlInput.focus();
  }
  function closeSettings(app2) {
    app2.refs.settingsOverlay.classList.add("hidden");
    app2.settingsDraft = null;
    app2.localPatchDraft = null;
  }
  function renderSettings(app2) {
    if (!app2.settingsDraft) {
      return;
    }
    renderEngineSettings(app2);
    renderQuickLinkSettings(app2);
    app2.refs.homerUrlInput.value = app2.settingsDraft.homer.url;
    app2.refs.homerDisabledInput.checked = app2.localPatchDraft?.homer?.disabled === true;
    app2.refs.topWeatherEnabledInput.checked = app2.localPatchDraft?.weather?.topDisabled !== true;
    app2.refs.weatherCardEnabledInput.checked = app2.localPatchDraft?.weather?.cardDisabled !== true;
    app2.refs.weatherLocationInput.value = app2.localPatchDraft?.weather?.locationName || "";
    app2.refs.topWeatherPlacementInput.value = app2.settingsDraft.weather.topWidgetPlacement;
    app2.refs.githubTrendingEnabledInput.checked = app2.localPatchDraft?.githubTrending?.disabled !== true;
    app2.refs.githubTrendingExcludeInput.value = app2.settingsDraft.githubTrending.excludedTerms.join(", ");
    app2.refs.githubTrendingSyncIntervalInput.value = String(app2.settingsDraft.githubTrending.syncIntervalMinutes);
    app2.refs.showFrequentVisitsInput.checked = app2.localPatchDraft?.visits?.showFrequent !== false;
    app2.refs.showRecentVisitsInput.checked = app2.localPatchDraft?.visits?.showRecent !== false;
    app2.refs.frequentHistoryPoolInput.value = String(app2.settingsDraft.visits.frequentHistoryPool);
    app2.refs.frequentMinVisitsInput.value = String(app2.settingsDraft.visits.frequentMinVisits);
  }
  function renderEngineSettings(app2) {
    const { refs, settingsDraft } = app2;
    const localPatchDraft = ensureLocalPatchDraft(app2);
    refs.engineRows.replaceChildren();
    for (const [index, engine] of settingsDraft.search.engines.entries()) {
      const row = document.createElement("div");
      row.className = "settings-row engine-row";
      const dragHandle = createDragHandle();
      attachReorderHandlers(row, dragHandle, settingsDraft.search.engines, index, () => renderSettings(app2));
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
      const remove = createSmallButton("\xD7", t("remove"));
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
        renderSettings(app2);
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
        renderSettings(app2);
      });
      row.append(dragHandle, title, template, enabledWrap.label, defaultWrap, remove);
      refs.engineRows.append(row);
    }
  }
  function renderQuickLinkSettings(app2) {
    const { refs, settingsDraft } = app2;
    const localPatchDraft = ensureLocalPatchDraft(app2);
    refs.quickLinkRows.replaceChildren();
    for (const [index, link] of settingsDraft.quickLinks.entries()) {
      const row = document.createElement("div");
      row.className = "settings-row quick-row";
      const dragHandle = createDragHandle();
      attachReorderHandlers(row, dragHandle, settingsDraft.quickLinks, index, () => renderSettings(app2));
      const title = createInput(t("inputQuickLinkTitle"), link.title);
      const url = createInput("URL", link.url, "url");
      const enabledWrap = createCheckField(t("localEnabled"), !localPatchDraft.quickLinks.disabledLinkIds.includes(link.id));
      const remove = createSmallButton("\xD7", t("remove"));
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
        renderSettings(app2);
      });
      row.append(dragHandle, title, url, enabledWrap.label, remove);
      refs.quickLinkRows.append(row);
    }
  }
  function createDragHandle() {
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "drag-handle";
    handle.textContent = "\u2630";
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
  function handleExportSettings(app2) {
    const result = validateSettingsDraft(app2);
    if (!result.ok) {
      window.alert(`${t("exportSettingsInvalid")}
${result.error}`);
      return;
    }
    const blob = new Blob([`${JSON.stringify(createSyncedState(result.state), null, 2)}
`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `homer-or-not-settings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
  async function handleImportSettings(app2, event) {
    if (!app2.settingsDraft) {
      return;
    }
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const raw = JSON.parse(await file.text());
      app2.settingsDraft = normalizeState(raw, app2.baseConfig);
      app2.localPatchDraft = normalizeLocalPatch(null, app2.settingsDraft);
      renderSettings(app2);
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
  function validateSettingsDraft(app2) {
    const { settingsDraft } = app2;
    if (!settingsDraft) {
      return { ok: false, error: t("settingsNotOpen") };
    }
    const cleanedEngines = settingsDraft.search.engines.map((engine) => ({
      id: engine.id || makeId("engine"),
      title: engine.title.trim(),
      template: engine.template.trim()
    })).filter((engine) => engine.title && engine.template);
    if (!cleanedEngines.length) {
      return { ok: false, error: t("needSearchEngine") };
    }
    if (cleanedEngines.some((engine) => !engine.template.includes("{q}"))) {
      return { ok: false, error: t("searchTemplateMissingQuery") };
    }
    const cleanedLinks = settingsDraft.quickLinks.map((link) => ({
      id: link.id || makeId("quick"),
      title: typeof link.title === "string" ? link.title.trim() : "",
      url: link.url.trim()
    })).filter((link) => link.url);
    if (cleanedLinks.some((link) => !isHttpUrl(link.url))) {
      return { ok: false, error: t("quickLinkBadUrl") };
    }
    const nextHomer = readHomerDraft(app2);
    if (nextHomer.url && !deriveHomerEndpoints(nextHomer.url)) {
      return { ok: false, error: t("homerUrlInvalid") };
    }
    return {
      ok: true,
      state: {
        search: {
          engines: cleanedEngines,
          defaultEngineId: cleanedEngines.find((engine) => engine.id === settingsDraft.search.defaultEngineId)?.id || cleanedEngines[0].id
        },
        quickLinks: cleanedLinks,
        homer: nextHomer,
        visits: readVisitsDraft(app2),
        weather: readWeatherDraft(app2),
        githubTrending: readGitHubTrendingDraft(app2)
      },
      localPatch: normalizeLocalPatch(
        {
          ...ensureLocalPatchDraft(app2),
          search: {
            ...ensureLocalPatchDraft(app2).search,
            defaultEngineId: cleanedEngines.find((engine) => engine.id === settingsDraft.search.defaultEngineId)?.id || cleanedEngines[0].id
          },
          homer: {
            disabled: app2.refs.homerDisabledInput.checked
          },
          weather: {
            topDisabled: !app2.refs.topWeatherEnabledInput.checked,
            cardDisabled: !app2.refs.weatherCardEnabledInput.checked,
            locationName: app2.refs.weatherLocationInput.value
          },
          githubTrending: {
            disabled: !app2.refs.githubTrendingEnabledInput.checked
          },
          visits: {
            showFrequent: app2.refs.showFrequentVisitsInput.checked,
            showRecent: app2.refs.showRecentVisitsInput.checked
          }
        },
        {
          search: {
            engines: cleanedEngines,
            defaultEngineId: ""
          },
          quickLinks: cleanedLinks,
          homer: nextHomer,
          visits: readVisitsDraft(app2),
          weather: readWeatherDraft(app2),
          githubTrending: readGitHubTrendingDraft(app2)
        }
      )
    };
  }
  function readHomerDraft(app2) {
    return {
      url: app2.refs.homerUrlInput.value.trim()
    };
  }
  function readVisitsDraft(app2) {
    return normalizeVisitSettings(
      {
        frequentHistoryPool: app2.refs.frequentHistoryPoolInput.value,
        frequentMinVisits: app2.refs.frequentMinVisitsInput.value
      },
      FALLBACK_CONFIG.visits
    );
  }
  function readWeatherDraft(app2) {
    return normalizeWeatherSettings(
      {
        topWidgetPlacement: app2.refs.topWeatherPlacementInput.value
      },
      FALLBACK_CONFIG.weather
    );
  }
  function readGitHubTrendingDraft(app2) {
    return normalizeGitHubTrendingSettings(
      {
        excludedTerms: app2.refs.githubTrendingExcludeInput.value,
        syncIntervalMinutes: app2.refs.githubTrendingSyncIntervalInput.value
      },
      FALLBACK_CONFIG.githubTrending
    );
  }
  function createInput(placeholder, value, type = "text") {
    const input = document.createElement("input");
    input.type = type;
    input.placeholder = placeholder;
    input.name = placeholder.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zа-я0-9_{}]/gi, "");
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
  function ensureLocalPatchDraft(app2) {
    if (!app2.localPatchDraft) {
      app2.localPatchDraft = normalizeLocalPatch(null, app2.settingsDraft);
    }
    return app2.localPatchDraft;
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

  // src/sync.js
  async function syncHomer(app2, { force }) {
    if (app2.localPatch?.homer?.disabled) {
      setStatus(app2, "local", "off", t("homerDisabled"));
      renderServices(app2, [], "");
      return;
    }
    if (!app2.state.homer.url) {
      setStatus(app2, "local", "no url", t("homerUrlMissing"));
      renderServices(app2, [], "");
      return;
    }
    const endpoints = deriveHomerEndpoints(app2.state.homer.url);
    if (!endpoints) {
      setStatus(app2, "error", "bad url", t("homerUrlInvalid"));
      renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
      return;
    }
    if (!force && isCacheFresh(app2.homerCache, HOMER_SYNC_INTERVAL_MINUTES)) {
      setStatus(app2, "cache", "cache", t("homerCache", formatDateTime(app2.homerCache.fetchedAt)));
      renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
      return;
    }
    if (!force && isFailureFresh(app2.syncMeta, HOMER_SYNC_INTERVAL_MINUTES, endpoints.configUrl)) {
      if (app2.homerCache?.services?.length) {
        renderServices(app2, app2.homerCache.services);
        setStatus(app2, "cache", "offline", t("homerRecentFailureCache", formatDateTime(app2.homerCache.fetchedAt)));
        return;
      }
      renderServices(app2, [], "");
      setStatus(app2, "local", "no homer", t("homerRecentFailureNoCache"));
      return;
    }
    if (!force && await shouldSkipHomerSyncByNetwork(endpoints)) {
      renderServices(app2, getVisibleServices(app2), getEmptyServicesMessage(app2));
      setStatus(app2, "cache", app2.homerCache?.services?.length ? "away" : "no homer", t("homerAway"));
      return;
    }
    setStatus(app2, "sync", "sync", t("homerSyncing"));
    try {
      const configText = await fetchTextWithTimeout(withCacheBuster(endpoints.configUrl), HOMER_FETCH_TIMEOUT_MS);
      const parsed = parseHomerConfig(configText, endpoints.configUrl);
      const services = normalizeServiceGroups(parsed.services, endpoints.configUrl);
      if (!services.length) {
        throw new Error("Homer config has no services.");
      }
      app2.homerCache = {
        fetchedAt: Date.now(),
        sourceUrl: endpoints.configUrl,
        theme: typeof parsed.theme === "string" ? parsed.theme : "",
        services
      };
      await storageSet(CACHE_KEY, app2.homerCache, LOCAL_AREA);
      app2.syncMeta = null;
      await storageRemove(META_KEY, LOCAL_AREA);
      app2.applyTheme();
      renderServices(app2, services);
      setStatus(app2, "live", "live", t("homerUpdated", formatDateTime(app2.homerCache.fetchedAt)));
    } catch (error) {
      app2.syncMeta = {
        failedAt: Date.now(),
        sourceUrl: endpoints.configUrl,
        message: error?.message || String(error)
      };
      await storageSet(META_KEY, app2.syncMeta, LOCAL_AREA);
      if (app2.homerCache?.services?.length) {
        renderServices(app2, app2.homerCache.services);
        setStatus(app2, "cache", "offline", t("homerOfflineCache", formatDateTime(app2.homerCache.fetchedAt)));
        return;
      }
      renderServices(app2, [], "");
      setStatus(app2, "local", "no homer", t("homerOfflineNoCache"));
    }
  }

  // src/theme.js
  function applyTheme(app2) {
    const setWallpaper = () => {
      const image = getHomerWallpaperUrl(app2);
      if (image) {
        document.documentElement.style.setProperty("--wallpaper-image", `url("${image}")`);
        return;
      }
      document.documentElement.style.removeProperty("--wallpaper-image");
    };
    setWallpaper();
    globalThis.matchMedia?.("(prefers-color-scheme: light)")?.addEventListener?.("change", setWallpaper);
  }
  function getHomerWallpaperUrl(app2) {
    const theme = String(app2.homerCache?.theme || "").trim();
    if (!theme) {
      return "";
    }
    const configUrl = app2.homerCache?.sourceUrl || deriveHomerEndpoints(app2.state.homer.url)?.configUrl || "";
    if (!configUrl) {
      return "";
    }
    const prefersLight = globalThis.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    const fileName = prefersLight ? "wallpaper-light.webp" : "wallpaper.webp";
    return resolveAssetUrl(`assets/themes/${theme}/${fileName}`, configUrl);
  }

  // src/main.js
  var app = {
    refs: {},
    baseConfig: normalizeBootConfig(globalThis.HOMER_OR_NOT_CONFIG || FALLBACK_CONFIG),
    state: null,
    localPatch: null,
    homerCache: null,
    syncMeta: null,
    quickLinkMeta: {},
    searchEngineMeta: {},
    weatherCache: null,
    weatherStatus: null,
    githubTrendingCache: null,
    githubTrendingStatus: null,
    visitHistory: [],
    frequentVisits: [],
    settingsDraft: null
  };
  app.state = createDefaultState(app.baseConfig);
  app.addVisitHistoryItem = (item) => addVisitHistoryItem(app, item);
  app.addQuickLinkFromVisit = addQuickLinkFromVisit;
  app.applyTheme = () => applyTheme(app);
  app.persistState = persistState;
  app.persistLocalPatch = persistLocalPatch;
  app.renderQuickLinks = () => renderQuickLinks(app);
  app.renderSearchButtons = () => renderSearchButtons(app);
  app.renderVisitPanels = () => renderVisitPanels(app);
  app.renderWeatherWidget = () => renderWeatherWidget(app);
  app.renderGitHubTrending = () => renderGitHubTrending(app);
  app.runSearch = runSearch;
  app.setViewMode = setViewMode;
  document.addEventListener("DOMContentLoaded", () => {
    void init();
  });
  async function init() {
    bindRefs();
    applyLocalization();
    bindEvents();
    await loadSettingsState();
    app.homerCache = normalizeHomerCache(await storageGet(CACHE_KEY));
    app.syncMeta = normalizeSyncMeta(await storageGet(META_KEY));
    app.quickLinkMeta = normalizeQuickLinkMeta(await storageGet(QUICK_LINK_META_KEY));
    app.searchEngineMeta = normalizeSearchEngineMeta(await storageGet(SEARCH_ENGINE_META_KEY));
    app.weatherCache = normalizeWeatherCache(await storageGet(WEATHER_CACHE_KEY));
    app.githubTrendingCache = normalizeGitHubTrendingCache(await storageGet(GITHUB_TRENDING_CACHE_KEY));
    app.visitHistory = await loadVisitHistory();
    app.frequentVisits = await loadFrequentVisits(app);
    applyTheme(app);
    renderViewMode(app);
    renderAll(app);
    void refreshSearchEngineMetadata(app, { force: false });
    void refreshQuickLinkMetadata(app, { force: false });
    void syncWeather(app, { force: false });
    void syncGitHubTrending(app, { force: false });
    await syncHomer(app, { force: false });
  }
  function bindRefs() {
    const { refs } = app;
    refs.statusButton = byId("statusButton");
    refs.statusDot = byId("statusDot");
    refs.statusText = byId("statusText");
    refs.modeSwitcher = byId("modeSwitcher");
    refs.syncButton = byId("syncButton");
    refs.settingsButton = byId("settingsButton");
    refs.searchForm = byId("searchForm");
    refs.searchInput = byId("searchInput");
    refs.searchButtons = byId("searchButtons");
    refs.quickLinks = byId("quickLinks");
    refs.servicesLayout = byId("servicesLayout");
    refs.servicesGrid = byId("servicesGrid");
    refs.topWeatherWidget = byId("topWeatherWidget");
    refs.topWeatherIcon = byId("topWeatherIcon");
    refs.topWeatherTemp = byId("topWeatherTemp");
    refs.topWeatherPlace = byId("topWeatherPlace");
    refs.topWeatherCondition = byId("topWeatherCondition");
    refs.topWeatherFeels = byId("topWeatherFeels");
    refs.topWeatherRange = byId("topWeatherRange");
    refs.topWeatherHumidity = byId("topWeatherHumidity");
    refs.topWeatherWind = byId("topWeatherWind");
    refs.topWeatherRain = byId("topWeatherRain");
    refs.topWeatherUpdated = byId("topWeatherUpdated");
    refs.topWeatherRefreshButton = byId("topWeatherRefreshButton");
    refs.weatherWidget = byId("weatherWidget");
    refs.weatherIcon = byId("weatherIcon");
    refs.weatherTemp = byId("weatherTemp");
    refs.weatherPlace = byId("weatherPlace");
    refs.weatherCondition = byId("weatherCondition");
    refs.weatherFeels = byId("weatherFeels");
    refs.weatherRange = byId("weatherRange");
    refs.weatherHumidity = byId("weatherHumidity");
    refs.weatherWind = byId("weatherWind");
    refs.weatherRain = byId("weatherRain");
    refs.weatherUpdated = byId("weatherUpdated");
    refs.weatherRefreshButton = byId("weatherRefreshButton");
    refs.githubTrending = byId("githubTrending");
    refs.githubTrendingList = byId("githubTrendingList");
    refs.githubTrendingMeta = byId("githubTrendingMeta");
    refs.githubTrendingRefreshButton = byId("githubTrendingRefreshButton");
    refs.frequentPanel = byId("frequentPanel");
    refs.frequentList = byId("frequentList");
    refs.historyPanel = byId("historyPanel");
    refs.historyList = byId("historyList");
    refs.settingsOverlay = byId("settingsOverlay");
    refs.closeSettingsButton = byId("closeSettingsButton");
    refs.engineRows = byId("engineRows");
    refs.quickLinkRows = byId("quickLinkRows");
    refs.addEngineButton = byId("addEngineButton");
    refs.addQuickLinkButton = byId("addQuickLinkButton");
    refs.homerUrlInput = byId("homerUrlInput");
    refs.homerDisabledInput = byId("homerDisabledInput");
    refs.topWeatherEnabledInput = byId("topWeatherEnabledInput");
    refs.weatherCardEnabledInput = byId("weatherCardEnabledInput");
    refs.weatherLocationInput = byId("weatherLocationInput");
    refs.topWeatherPlacementInput = byId("topWeatherPlacementInput");
    refs.githubTrendingEnabledInput = byId("githubTrendingEnabledInput");
    refs.githubTrendingExcludeInput = byId("githubTrendingExcludeInput");
    refs.githubTrendingSyncIntervalInput = byId("githubTrendingSyncIntervalInput");
    refs.frequentHistoryPoolInput = byId("frequentHistoryPoolInput");
    refs.frequentMinVisitsInput = byId("frequentMinVisitsInput");
    refs.showFrequentVisitsInput = byId("showFrequentVisitsInput");
    refs.showRecentVisitsInput = byId("showRecentVisitsInput");
    refs.exportSettingsButton = byId("exportSettingsButton");
    refs.importSettingsInput = byId("importSettingsInput");
    refs.resetButton = byId("resetButton");
    refs.saveButton = byId("saveButton");
  }
  function bindEvents() {
    const { refs } = app;
    refs.searchForm.addEventListener("submit", handleSearchSubmit);
    refs.modeSwitcher.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mode]");
      if (button) {
        void setViewMode(button.dataset.mode);
      }
    });
    refs.syncButton.addEventListener("click", () => {
      void syncHomer(app, { force: true });
    });
    refs.weatherRefreshButton.addEventListener("click", () => {
      void syncWeather(app, { force: true });
    });
    refs.topWeatherRefreshButton.addEventListener("click", () => {
      void syncWeather(app, { force: true });
    });
    refs.githubTrendingRefreshButton.addEventListener("click", () => {
      void syncGitHubTrending(app, { force: true });
    });
    refs.statusButton.addEventListener("click", () => openSettings(app));
    refs.settingsButton.addEventListener("click", () => openSettings(app));
    refs.closeSettingsButton.addEventListener("click", () => closeSettings(app));
    refs.settingsOverlay.addEventListener("click", (event) => {
      if (event.target === refs.settingsOverlay) {
        closeSettings(app);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !refs.settingsOverlay.classList.contains("hidden")) {
        closeSettings(app);
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void refreshVisitHistory(app);
        void syncWeather(app, { force: false });
      }
    });
    window.addEventListener("focus", () => {
      void refreshVisitHistory(app);
      void syncWeather(app, { force: false });
    });
    refs.addEngineButton.addEventListener("click", () => {
      if (!app.settingsDraft) {
        return;
      }
      app.settingsDraft.search.engines.push({
        id: makeId("engine"),
        title: "",
        template: "https://example.com/search?q={q}"
      });
      renderSettings(app);
    });
    refs.addQuickLinkButton.addEventListener("click", () => {
      if (!app.settingsDraft) {
        return;
      }
      app.settingsDraft.quickLinks.push({
        id: makeId("quick"),
        title: "",
        url: ""
      });
      renderSettings(app);
    });
    refs.exportSettingsButton.addEventListener("click", () => handleExportSettings(app));
    refs.importSettingsInput.addEventListener("change", (event) => {
      void handleImportSettings(app, event);
    });
    refs.saveButton.addEventListener("click", saveSettings);
    refs.resetButton.addEventListener("click", resetSettings);
  }
  async function loadSettingsState() {
    const syncState = await storageGet(STATE_KEY, SYNC_AREA);
    let syncedState;
    let shouldPersistSyncedState = false;
    let sourceDefaultEngineId = "";
    if (syncState) {
      syncedState = normalizeSyncedState(syncState, app.baseConfig);
      sourceDefaultEngineId = typeof syncState.search?.defaultEngineId === "string" ? syncState.search.defaultEngineId : "";
      shouldPersistSyncedState = Boolean(sourceDefaultEngineId);
    } else {
      const legacyLocalState = await storageGet(STATE_KEY, LOCAL_AREA);
      if (legacyLocalState) {
        syncedState = normalizeSyncedState(legacyLocalState, app.baseConfig);
        sourceDefaultEngineId = typeof legacyLocalState.search?.defaultEngineId === "string" ? legacyLocalState.search.defaultEngineId : "";
        shouldPersistSyncedState = true;
        await storageRemove(STATE_KEY, LOCAL_AREA);
      } else {
        syncedState = normalizeSyncedState(null, app.baseConfig);
      }
    }
    const rawLocalPatch = await storageGet(LOCAL_PATCH_KEY);
    const localPatch = normalizeLocalPatch(rawLocalPatch, syncedState);
    let shouldPersistLocalPatch = !rawLocalPatch;
    if (!rawLocalPatch && sourceDefaultEngineId) {
      localPatch.search.defaultEngineId = sourceDefaultEngineId;
      shouldPersistLocalPatch = true;
    }
    app.localPatch = normalizeLocalPatch(localPatch, syncedState);
    app.state = applyLocalPatch(syncedState, app.localPatch);
    await Promise.all([
      shouldPersistSyncedState ? persistState() : Promise.resolve(),
      shouldPersistLocalPatch ? persistLocalPatch() : Promise.resolve()
    ]);
  }
  async function persistState() {
    await storageSet(STATE_KEY, createSyncedState(app.state), SYNC_AREA);
  }
  async function persistLocalPatch() {
    app.localPatch = normalizeLocalPatch(app.localPatch, app.state);
    app.state = applyLocalPatch(app.state, app.localPatch);
    await storageSet(LOCAL_PATCH_KEY, app.localPatch, LOCAL_AREA);
  }
  async function setViewMode(mode) {
    if (!app.localPatch) {
      app.localPatch = normalizeLocalPatch(null, app.state);
    }
    app.localPatch.viewMode = normalizeViewMode(mode);
    renderViewMode(app);
    await persistLocalPatch();
  }
  function renderViewMode({ refs, localPatch }) {
    const mode = normalizeViewMode(localPatch?.viewMode);
    document.body.dataset.viewMode = mode;
    refs.modeSwitcher.querySelectorAll("[data-mode]").forEach((button) => {
      const isActive = button.dataset.mode === mode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }
  function handleSearchSubmit(event) {
    event.preventDefault();
    const rawQuery = app.refs.searchInput.value.trim();
    if (!rawQuery) {
      return;
    }
    const engine = getDefaultSearchEngine();
    if (engine) {
      void runSearch(engine, rawQuery);
    }
  }
  function getDefaultSearchEngine() {
    const engines = getVisibleSearchEngines(app);
    return engines.find((item) => item.id === app.state.search.defaultEngineId) || engines[0];
  }
  async function runSearch(engine, query) {
    const target = engine.template.replace("{q}", encodeURIComponent(query));
    await addVisitHistoryItem(app, {
      title: `${engine.title}: ${query}`,
      url: target,
      source: "search"
    });
    window.location.assign(target);
  }
  async function addQuickLinkFromVisit(item) {
    const url = typeof item?.url === "string" ? item.url.trim() : "";
    const key = normalizeUrlKey(url);
    if (!key || !isHttpUrl(url)) {
      return;
    }
    const existing = app.state.quickLinks.find((link) => normalizeUrlKey(link.url) === key);
    if (existing) {
      app.localPatch.quickLinks.disabledLinkIds = app.localPatch.quickLinks.disabledLinkIds.filter(
        (id) => id !== existing.id
      );
      app.state = applyLocalPatch(app.state, app.localPatch);
      await persistLocalPatch();
      renderAll(app);
      void refreshQuickLinkMetadata(app, { force: false });
      return;
    }
    const title = String(item.title || toDomain(url) || url).replace(/\s+/g, " ").trim();
    app.state.quickLinks = [
      ...app.state.quickLinks,
      {
        id: makeId("quick"),
        title,
        url
      }
    ];
    app.localPatch = normalizeLocalPatch(app.localPatch, app.state);
    app.state = applyLocalPatch(app.state, app.localPatch);
    await Promise.all([persistState(), persistLocalPatch()]);
    renderAll(app);
    void refreshQuickLinkMetadata(app, { force: false });
  }
  async function saveSettings() {
    const result = validateSettingsDraft(app);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    app.state = result.state;
    app.localPatch = normalizeLocalPatch(result.localPatch, app.state);
    app.state = applyLocalPatch(app.state, app.localPatch);
    await Promise.all([persistState(), persistLocalPatch()]);
    closeSettings(app);
    renderAll(app);
    void refreshSearchEngineMetadata(app, { force: true });
    void refreshQuickLinkMetadata(app, { force: true });
    void syncWeather(app, { force: true });
    void syncGitHubTrending(app, { force: false });
    await syncHomer(app, { force: true });
  }
  async function resetSettings() {
    const confirmed = window.confirm(t("resetConfirm"));
    if (!confirmed) {
      return;
    }
    app.state = createDefaultState(app.baseConfig);
    app.localPatch = normalizeLocalPatch(null, app.state);
    app.state = applyLocalPatch(app.state, app.localPatch);
    app.homerCache = null;
    app.quickLinkMeta = {};
    app.searchEngineMeta = {};
    app.weatherCache = null;
    app.weatherStatus = null;
    app.githubTrendingCache = null;
    app.githubTrendingStatus = null;
    app.visitHistory = [];
    app.frequentVisits = [];
    app.settingsDraft = clone(app.state);
    app.localPatchDraft = clone(app.localPatch);
    app.syncMeta = null;
    await Promise.all([
      storageRemove(STATE_KEY, SYNC_AREA),
      storageRemove(
        [
          LOCAL_PATCH_KEY,
          CACHE_KEY,
          META_KEY,
          QUICK_LINK_META_KEY,
          SEARCH_ENGINE_META_KEY,
          HISTORY_KEY,
          WEATHER_CACHE_KEY,
          GITHUB_TRENDING_CACHE_KEY
        ],
        LOCAL_AREA
      )
    ]);
    renderViewMode(app);
    renderAll(app);
    renderSettings(app);
    void refreshSearchEngineMetadata(app, { force: true });
    void syncWeather(app, { force: true });
    void syncGitHubTrending(app, { force: true });
    await syncHomer(app, { force: true });
  }
})();
