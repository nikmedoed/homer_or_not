import { LOCALE } from "./i18n.js";

export const FALLBACK_CONFIG = {
  homer: {
    url: "",
  },
  theme: {},
  search: {
    defaultEngineId: "yandex",
    engines: [
      {
        id: "yandex",
        title: LOCALE === "ru" ? "Яндекс" : "Yandex",
        template: "https://yandex.ru/search/?text={q}",
      },
    ],
  },
  quickLinks: [],
  visits: {
    frequentHistoryPool: 5000,
    frequentMinVisits: 3,
  },
  githubTrending: {
    excludedTerms: [],
  },
  services: [],
};
