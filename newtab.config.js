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
        id: "ozon",
        title: "Ozon",
        template: "https://www.ozon.ru/search/?text={q}",
      },
      {
        id: "wildberries",
        title: "Wildberries",
        template: "https://www.wildberries.ru/catalog/0/search.aspx?search={q}",
      },
      {
        id: "aliexpress",
        title: "AliExpress",
        template: "https://www.aliexpress.com/wholesale?SearchText={q}",
      },
      {
        id: "rutracker",
        title: "RuTracker",
        template: "https://rutracker.org/forum/tracker.php?nm={q}",
      },
      {
        id: "kinorium",
        title: "Кинориум",
        template: "https://ru.kinorium.com/search/?q={q}",
      },
    ],
  },
  quickLinks: [
    {
      id: "images",
      title: "Картинки",
      url: "https://yandex.ru/images/",
    },
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
      id: "translate",
      title: "Переводчик",
      url: "https://translate.yandex.ru/",
    },
    {
      id: "notion",
      title: "Notion",
      url: "https://www.notion.so/",
    },
    {
      id: "ocr",
      title: "OCR",
      url: "https://translate.yandex.ru/ocr",
    },
    {
      id: "ozon-orders",
      title: "Ozon заказы",
      url: "https://am.ozon.com/my/orderlist/",
    },
    {
      id: "wb-orders",
      title: "WB заказы",
      url: "https://www.wildberries.ru/lk/myorders/delivery",
    },
    {
      id: "chatgpt-usage",
      title: "ChatGPT usage",
      url: "https://chatgpt.com/codex/settings/usage",
    },
    {
      id: "chatgpt",
      title: "ChatGPT",
      url: "https://chatgpt.com/",
    },
  ],
  services: [],
};
