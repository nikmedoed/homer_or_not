import { deriveHomerEndpoints, resolveAssetUrl } from "./homer.js";

export function applyTheme(app) {
  const setWallpaper = () => {
    const image = getHomerWallpaperUrl(app);
    if (image) {
      document.documentElement.style.setProperty("--wallpaper-image", `url("${image}")`);
      return;
    }
    document.documentElement.style.removeProperty("--wallpaper-image");
  };
  setWallpaper();
  globalThis.matchMedia?.("(prefers-color-scheme: light)")?.addEventListener?.("change", setWallpaper);
}

function getHomerWallpaperUrl(app) {
  const theme = String(app.homerCache?.theme || "").trim();
  if (!theme) {
    return "";
  }
  const configUrl = app.homerCache?.sourceUrl || deriveHomerEndpoints(app.state.homer.url)?.configUrl || "";
  if (!configUrl) {
    return "";
  }
  const prefersLight = globalThis.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  const fileName = prefersLight ? "wallpaper-light.webp" : "wallpaper.webp";
  return resolveAssetUrl(`assets/themes/${theme}/${fileName}`, configUrl);
}
