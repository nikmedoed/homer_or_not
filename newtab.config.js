window.HOMER_OR_NOT_CONFIG = {
  homer: {
    url: "http://192.168.1.28/",
  },
  theme: {},
  search: {
    defaultEngineId: "yandex",
    engines: [
      {
        id: "yandex",
        title: "Яндекс",
        template: "https://yandex.ru/search/?text={q}",
      },
      {
        id: "google",
        title: "Google",
        template: "https://www.google.com/search?q={q}",
      },
      {
        id: "youtube",
        title: "YouTube",
        template: "https://www.youtube.com/results?search_query={q}",
      },
      {
        id: "aliexpress",
        title: "AliExpress",
        template: "https://www.aliexpress.com/wholesale?SearchText={q}",
      },
      {
        id: "amazon",
        title: "Amazon",
        template: "https://www.amazon.com/s?k={q}",
      },
      {
        id: "kinorium",
        title: "Кинориум",
        template: "https://ru.kinorium.com/search/?q={q}",
      },
    ],
  },
  visits: {
    frequentHistoryPool: 5000,
    frequentMinVisits: 3,
  },
  quickLinks: [
    {
      id: "calendar",
      title: "Календарь",
      url: "https://calendar.google.com/calendar/u/0/r?tab=gc",
    },
    {
      id: "maps",
      title: "Карты",
      url: "https://yandex.ru/maps",
    },
    {
      id: "notion",
      title: "Notion",
      url: "https://www.notion.so/",
    },
    {
      id: "chatgpt",
      title: "ChatGPT",
      url: "https://chatgpt.com/",
    },
  ],
  services: [],
};
