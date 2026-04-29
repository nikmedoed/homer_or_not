export const ICONS = {
  network:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v5m-7 7v-3h14v3M5 20h4v-4H5v4Zm10 0h4v-4h-4v4Zm-5 0h4v-4h-4v4Z"/></svg>',
  media:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4V5Zm3 3v8l6-4-6-4Zm9 0h2m-2 4h2m-2 4h2"/></svg>',
  sync:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5m10.4-2A7.5 7.5 0 0 0 6.2 7.2M4.6 14a7.5 7.5 0 0 0 13.2 3.8"/></svg>',
  ethernet:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15h16v5H4v-5Zm2-9h3v9H6V6Zm5 3h3v6h-3V9Zm5-3h3v9h-3V6Z"/></svg>',
  home:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7v9h-6v-6H9v6H3v-9Z"/></svg>',
};

const ICON_ALIASES = new Map([
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
  ["fa-home", "home"],
]);

export function normalizeSectionIcon(icon, name) {
  const key = String(icon || "").trim().toLowerCase();
  if (ICONS[key]) {
    return key;
  }
  if (ICON_ALIASES.has(key)) {
    return ICON_ALIASES.get(key);
  }
  const text = `${key} ${name || ""}`.toLowerCase();
  if (text.includes("медиа") || text.includes("media") || text.includes("photo")) {
    return "media";
  }
  if (text.includes("sync") || text.includes("syncthing") || text.includes("rotate")) {
    return "sync";
  }
  if (text.includes("сеть") || text.includes("ethernet") || text.includes("router")) {
    return "ethernet";
  }
  if (text.includes("дом") || text.includes("home")) {
    return "home";
  }
  return "network";
}
