# Homer or Not

Local-first Chrome/Chromium new tab page with configurable search, quick links, and cached Homer service data.

The goal is to keep the useful part of a personal Homer dashboard without depending on Homer for every new tab. Search and quick links work directly from the extension. Homer is used as a source for service tiles when it is reachable, and the last successful service list is kept locally for offline or away-from-home use.

## What It Does

- Replaces the browser new tab page.
- Shows a top search row with multiple configurable search engines.
- Uses one selected search engine as the default for Enter.
- Shows a configurable row of quick links with site icons and short labels.
- Reads Homer `assets/config.yml` and renders its service groups as tiles.
- Caches Homer service data in the current browser after the first successful sync.
- Avoids hitting Homer on every new tab by throttling sync attempts.
- Works as an unpacked extension, so it can be installed from a Git checkout without the Chrome Web Store.

There are no recommendation, recent, or frequent-site widgets in this version. The page is intentionally focused on the launcher area and Homer services.

## Install

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this repository folder.

The repository root is a valid unpacked extension because the built `newtab.js` is committed. `src/`, `scripts/`, and package files remain in the folder, but Chrome only loads files referenced by `manifest.json` and `newtab.html`.

If the extension is installed from a Git checkout, update it with `git pull`, then click `Reload` on the extension card. You do not need to run `npm install` or build commands just to use the checked-out extension.

## Development

Source code lives in `src/` and is bundled into the root `newtab.js`, which is what `newtab.html` loads.

- `npm run dev` - watch `src/` and rebuild `newtab.js` with a sourcemap while you edit.
- `npm run build:local` - rebuild the root `newtab.js` once for the unpacked extension.
- `npm run build` - create a clean, minified extension package next to the repo.

Typical local workflow:

```sh
npm install
npm run dev
```

Then load this repository folder as the unpacked extension. Keep `npm run dev` running while editing files in `src/` or `styles.css`. The watcher updates the root `newtab.js`; after a change, reload the extension card in `chrome://extensions` or open a new tab if Chrome picked up the file change.

Do not edit the generated root `newtab.js` directly. Put JavaScript changes in `src/`, then run `npm run build:local` or keep `npm run dev` running.

If you need a clean folder for packaging, run `npm run build` and use the generated `../homer_or_not-release` folder.

Release build:

```sh
npm run build
```

The release build copies `manifest.json`, `newtab.html`, `newtab.config.js`, and icons into `../homer_or_not-release`, then writes minified `newtab.js` and `styles.css` there.

## Commit and Packaging

This repository keeps the root `newtab.js` bundle committed so a fresh checkout can be loaded immediately as an unpacked extension.

Before each commit, the versioned Git hook in `.githooks/pre-commit` runs:

```sh
npm run build:local
```

It then stages the generated root `newtab.js`. The hook is installed by `npm install` through the `prepare` script, which sets Git's `core.hooksPath` to `.githooks`.

Use the repository root for normal unpacked installation and development. Use `../homer_or_not-release` only when you specifically want to package or share a clean extension folder without development files.

## GitHub Releases

Pushing a tag like `v1.2.3` runs the GitHub Actions release workflow. The workflow:

- verifies that the tagged commit is reachable from `main`;
- installs dependencies with `npm ci`;
- builds the root `newtab.js`;
- builds a clean `homer_or_not-release` folder;
- writes the tag version into the release `manifest.json` as `version: "1.2.3"` and `version_name: "v1.2.3"`;
- zips that release folder for GitHub download as `homer_or_not-release.zip`;
- uploads the folder and zip as workflow artifacts, and attaches the zip to the GitHub Release.

Example release flow:

```sh
git checkout main
git pull
git tag v1.2.3
git push origin v1.2.3
```

The source `manifest.json` is not edited by the release workflow; only the generated release manifest gets the tag version.

## Configure

Default settings live in [newtab.config.js](./newtab.config.js):

- `search.engines` - search buttons and URL templates. Use `{q}` where the encoded query should go.
- `search.defaultEngineId` - the engine used when pressing Enter.
- `quickLinks` - the top quick-link row.
- `homer.url` - Homer root, assets directory, or config URL.

The settings button in the page can also edit search engines, quick links, and the Homer URL without changing files. `Reset` restores the values from `newtab.config.js`.

Quick-link labels are manual when `title` is set. If `title` is empty, the extension falls back to the domain. Quick-link and search-engine icons are fetched through Chrome's favicon endpoint and cached locally.

## Homer Sync

Supported Homer URL forms:

- `http://192.168.1.28/`
- `http://192.168.1.28/assets`
- `http://192.168.1.28/assets/config.yml`

On sync, the extension fetches Homer config, parses service groups, resolves item logos relative to Homer, and stores the result in `chrome.storage.local`.

Homer sync runs when a new tab opens, but successful syncs and recent failures are throttled for 5 minutes. If Homer is configured with a private IPv4 address and the browser exposes local IPv4 candidates through WebRTC, the extension skips the request when the current network does not look like the Homer LAN. If local IPs are hidden by the browser, it falls back to the same throttled fetch attempt.

## Storage

- User settings are stored in `chrome.storage.sync`.
- Homer tiles and fetched icons are stored in `chrome.storage.local`.
- `manifest.json` includes a fixed extension `key`, so unpacked installs keep the same extension ID across machines.

A new browser profile or work computer will receive synced settings, but it will not have Homer tiles until that browser successfully reaches Homer at least once.

## Homer Assets

Homer icons and wallpaper are not bundled into this extension. Their resolved URLs are cached with the service data, and the actual images are loaded from the configured Homer instance when available. For example, `assets/icons/plex.svg` in Homer resolves to the matching URL on the Homer host.
