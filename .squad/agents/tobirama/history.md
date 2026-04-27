# Tobirama — History

## Core Context
- **Project:** Watchtower — VS Code extension migrating from standalone Watchtower desktop app
- **Owner:** Duong
- **Stack:** TypeScript, VS Code Extension API, React 19 (webviews), @xyflow/react, Zustand, Vitest
- **My domain:** VS Code Extension APIs — commands, providers, tree views, status bar, file watchers, message bridge
- **Source repo:** C:\GitHub\squad-tools\watchtower (server/ routes → extension host services)

## Learnings

### 2026-04-26: @vitejs/plugin-react v4 for vite 7
- Vite 7.x is pulled in by vitest 3.x. The latest @vitejs/plugin-react (v6) requires vite 8. Pin to `@vitejs/plugin-react@^4` which supports vite 5-7.

## Completed Work

### 2026-04-26T17:30:00Z — Webview Panel Provider + Vite Build Pipeline
**Plan:** `docs/plans/01-foundation/plan-webview-infrastructure.md` (Phases 1, 2, 4, 5)
**Files created:**
- `src/providers/GraphPanelProvider.ts` — Singleton panel with MessageBridge wiring
- `src/providers/getWebviewContent.ts` — CSP-safe HTML template with nonce generation
- `src/webview/index.tsx` — Stub React entry point
- `vite.config.webview.ts` — Webview React build (IIFE format → dist/webview/)
**Files modified:**
- `src/extension.ts` — Wired `watchtower.openGraph` command to GraphPanelProvider
- `package.json` — Added build:webview, watch:webview scripts; updated build to run both pipelines
**Dependencies added:** `@vitejs/plugin-react@^4`, `vite@^7`, `@types/react`, `@types/react-dom`
**Verification:** lint ✅, build ✅ (extension + webview), 61/61 tests ✅

### 2026-04-26T20:30:00Z — File System Watchers with Debounced Graph Updates
**Plan:** `docs/plans/02-data-layer/plan-file-watchers.md` (Phases 1-4)
**Files created:**
- `src/services/squad-watcher.ts` — SquadWatcher service monitoring 8 .squad/ file patterns
**Files modified:**
- `src/extension.ts` — Wired SquadWatcher into activate(), pushed to subscriptions, connected onChange to GraphPanelProvider.refresh()
- `src/providers/GraphPanelProvider.ts` — Added `refresh()` method (re-reads squads, pushes graph:update to webview), added `getInstance()` static accessor, imported ExtensionToWebviewMessage
- `src/webview/App.tsx` — Added `graph:update` push handler to update ReactFlow nodes/edges on file changes
- `test/__mocks__/vscode.ts` — Added `createFileSystemWatcher` and `getWorkspaceFolder` mocks
- `test/extension.test.ts` — Updated subscription count from 4 to 5
**Tests added:**
- `test/squad-watcher.test.ts` — 10 tests covering watcher creation, debouncing, event types, logging, disposal, and edge cases
**Verification:** lint ✅, build ✅, 168/168 tests ✅
