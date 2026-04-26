---
title: "Squad Watchtower: Desktop → VS Code Extension Migration"
status: not-started
created: 2026-04-26T00:00:00
tags: [migration, vscode-extension, watchtower]
---

# Squad Watchtower: Desktop → VS Code Extension Migration

## Context

Watchtower is a standalone desktop app (Electron/Tauri + React 19 + Express 5 + SQLite) for monitoring AI agent squads. The migration brings this into VS Code as an extension, eliminating context-switching since VS Code is the daily driver. This master plan coordinates six phases, each with its own detailed sub-plans.

**Source repo:** `C:\GitHub\squad-tools\watchtower` (65 React components, 25 API routes, 8 Zustand slices, 9 SQLite tables)
**Target repo:** `C:\GitHub\squad-tools\squad-watchtower` (VS Code extension)
**Architecture:** Hybrid — WebviewPanels for complex React UI, native VS Code APIs for navigation/commands

## Phases

- [ ] Phase 1: Foundation — Scaffold extension, webview host, port agent graph
- [ ] Phase 2: Data Layer — Replace SQLite + Express with extension host services
- [ ] Phase 3: Navigation — Tree views, status bar, commands, keyboard shortcuts
- [ ] Phase 4: Mission Control — Port dashboard widgets into webview
- [ ] Phase 5: Polish — Voice, walkthrough, settings, themes, search
- [ ] Phase 6: Retire Desktop — Remove Electron/Tauri, archive, publish

## Phase Details

### Phase 1: Foundation
**Goal:** See the agent graph inside VS Code.
**Owner:** Tobirama (extension scaffold) + Hashirama (graph webview)
**Plans:** [01-foundation/](01-foundation/)
- Scaffold VS Code extension project structure
- Build webview panel infrastructure with React host
- Port @xyflow/react graph visualization
- Implement extension ↔ webview message protocol
- Register initial commands

### Phase 2: Data Layer
**Goal:** Graph auto-updates when .squad/ files change. No Express server needed.
**Owner:** Tsunade (storage) + Tobirama (file watchers)
**Plans:** [02-data-layer/](02-data-layer/)
- Design JSON file storage format (replacing 9 SQLite tables)
- Build extension host services (replacing 25 Express routes)
- Set up FileSystemWatcher for .squad/ directories
- Wire graph data loading from .squad/ files
- Adapt Zustand store for extension context

### Phase 3: Navigation
**Goal:** Full keyboard-driven navigation without touching the webview.
**Owner:** Tobirama (providers) + Hashirama (icons/UX)
**Plans:** [03-navigation/](03-navigation/)
- AgentTreeDataProvider (agents list with status)
- SessionTreeDataProvider (session history)
- SkillsTreeDataProvider (discovered skills)
- StatusBar items (connection info, agent counts)
- Command palette integration (all toolbar actions as commands)
- Keyboard shortcuts

### Phase 4: Mission Control
**Goal:** Live dashboard inside VS Code.
**Owner:** Hashirama (widgets) + Tsunade (data feeds)
**Plans:** [04-mission-control/](04-mission-control/)
- Widget dashboard webview panel
- Fleet status widget
- Token tracking widget
- Pipeline timeline widget
- Stats & metrics aggregation

### Phase 5: Polish
**Goal:** Feature parity with desktop app for key workflows.
**Owner:** Various
**Plans:** [05-polish/](05-polish/)
- Voice commands (VS Code Speech API)
- Walkthrough / onboarding (contributes.walkthroughs)
- Settings migration (contributes.configuration)
- Theme integration (CSS variables → VS Code theme colors)
- Search integration

### Phase 6: Retire Desktop
**Goal:** Clean repo, single target, published extension.
**Owner:** Minato (decisions) + Kakashi (final verification)
**Plans:** [06-retire-desktop/](06-retire-desktop/)
- Remove Electron/Tauri code from source repo
- Archive original Watchtower repo
- Publish to VS Code Marketplace

## What Gets Simpler
- Monaco Editor → gone (VS Code IS the editor)
- Remote Access → gone (VS Code Remote handles this natively)
- Auth/API keys → gone (no server to protect)
- CORS/rate limiting → gone (no HTTP)
- Electron/Tauri → gone (VS Code is the host)
- WebSocket → gone (postMessage is simpler)

## What Gets Harder
- Webview limitations — no direct filesystem access, must go through extension host
- Native modules — avoid better-sqlite3 in extensions
- State persistence — JSON file format needs careful design
- Testing — VS Code extension testing is different (but vitest still works for pure logic)

## Success Criteria
1. Agent graph renders correctly in VS Code webview
2. Graph updates in real-time when .squad/ files change
3. All navigation available via keyboard (tree views + commands)
4. Mission Control dashboard functional
5. Extension published to VS Code Marketplace
6. Original Watchtower repo archived
