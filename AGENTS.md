# AGENTS.md

Working notes for coding agents in this repository.

## Project Shape

- Browser extension new-tab page.
- Source files live in `src/`.
- `newtab.js` is generated from `src/main.js` by esbuild and must be rebuilt after source changes.
- `newtab.html`, `styles.css`, `newtab.config.js`, `manifest.json`, and `icons/` are shipped directly.

## Commands

- Build generated bundle: `npm run build:local`.
- Watch build for development: `npm run dev`.
- Package/release build: `npm run build`.
- Quick whitespace check before final response: `git diff --check`.

## State And Storage

- Storage constants are in `src/constants.js`.
- Synced settings use `chrome.storage.sync` via `STATE_KEY`.
- Local-only data uses `chrome.storage.local`.
- `newtab.js` must not be edited manually; edit `src/` and rebuild.

Current intended settings split:

- Sync these:
  - search engines list;
  - quick links list;
  - Homer URL/settings;
  - visit/frequent-history settings.
- Do not sync these:
  - selected/default search engine;
  - locally disabled search engines;
  - locally disabled quick links;
  - local Homer disabled flag.

Local overrides are stored under `LOCAL_PATCH_KEY`.

## Implementation Notes

- Normalize state in `src/state.js`.
- Render visible search engines/quick links through helpers in `src/state.js`, not raw arrays, so local disables are respected.
- Homer sync entry point is `src/sync.js`; local Homer disable must prevent fetch attempts.
- Settings UI logic is in `src/settings.js`.
- Metadata refresh in `src/metadata.js` should use visible items only, so disabled corporate-network searches/links are not probed.
- Import/export should preserve synced configuration only unless the user explicitly asks to include local overrides.

## Style

- Keep changes scoped and avoid unrelated refactors.
- Prefer existing plain DOM patterns; no framework is used.
- Use ASCII unless the touched file already contains localized text.
