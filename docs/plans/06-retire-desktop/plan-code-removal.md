---
title: "Code Removal"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-6, retire-desktop, cleanup]
---

# Code Removal

## Context

The extension repo was scaffolded fresh, but some code may have been ported with desktop-only dependencies. This plan ensures the final extension has no vestiges of Electron, Tauri, Express, or standalone app infrastructure.

## Phases

- [ ] Phase 1: Dependency audit — identify and remove desktop-only npm packages
- [ ] Phase 2: Code audit — scan for Electron/Tauri/Express imports and references
- [ ] Phase 3: Build script cleanup — remove desktop build scripts, configs
- [ ] Phase 4: Dead code elimination — remove unreachable code paths
- [ ] Phase 5: Final verification — clean install, build, test, package

## Details

### Phase 1: Dependency audit
Remove from package.json:
- `electron`, `electron-builder` — desktop packaging
- `@tauri-apps/cli`, `@tauri-apps/api` — Tauri
- `express`, `cors`, `ws` — HTTP server
- `better-sqlite3` — if not using SQLite in extension
- `qrcode` — remote access QR codes
- `tweetnacl`, `tweetnacl-util` — remote encryption
- `concurrently` — multi-process dev (may still be useful)

### Phase 2: Code audit
- Search for `import.*electron` → remove
- Search for `import.*express` → remove
- Search for `import.*tauri` → remove
- Search for `fetch('/api/` → should all be postMessage now
- Search for `WebSocket` → should all be postMessage now
- Search for `better-sqlite3` → should be JSON file service

### Phase 3: Build script cleanup
Remove package.json scripts:
- `electron:*` — all Electron scripts
- `desktop*` — desktop launch scripts
- `tauri:*` — Tauri scripts
- `server` — Express server
- Update `start` to be extension dev workflow

### Phase 4: Dead code
- Tree-shake unused utilities
- Remove unused components from webview
- Remove unused types and interfaces
- ESLint no-unused-vars pass

### Phase 5: Final verification
- `rm -rf node_modules && npm install` — clean install
- `npm run compile` — builds cleanly
- `npm test` — all tests pass
- `vsce package` — creates valid .vsix
- Install .vsix in clean VS Code — extension works

## Reference Files
- Extension repo package.json
- Original watchtower/package.json (for comparison)
