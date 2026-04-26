---
title: "Watchtower: Desktop → VS Code Extension Migration"
status: not-started
created: 2026-04-26T00:00:00
tags: [migration, vscode-extension, watchtower]
---

# Watchtower: VS Code Extension for AI Squad Monitoring

## Context

Watchtower is a VS Code extension for monitoring AI agent squads. Starting from a clean baseline — design first, build incrementally. The original desktop app (Electron/Tauri + React + Express + SQLite) serves as feature reference, not a porting target.

**Source reference:** `C:\GitHub\squad-tools\watchtower` (original desktop app, being renamed to watchtower-legacy)
**This repo:** VS Code extension — built from scratch with VS Code-native patterns
**Architecture:** Hybrid — WebviewPanels for complex React UI, native VS Code APIs for navigation/commands

## Phases

- [ ] Phase 0: Design — Surface audit, information architecture, mockups
- [ ] Phase 1: Foundation — Scaffold extension, webview host, port agent graph
- [ ] Phase 2: Data Layer — Extension host services, file watchers, storage
- [ ] Phase 3: Navigation — Tree views, status bar, commands, keyboard shortcuts
- [ ] Phase 4: Mission Control — Dashboard widgets in webview
- [ ] Phase 5: Polish — Voice, walkthrough, settings, themes, search
- [ ] Phase 6: Retire Desktop — Archive legacy, publish extension

## Phase Details

### Phase 0: Design
**Goal:** Map out how Watchtower looks and feels inside VS Code before writing code.
**Owner:** Hiruzen (UX Designer)
**Plans:** [00-design/](00-design/)
- VS Code surface audit — what UI surfaces we use and why
- Information architecture — what data, where, in what priority
- Sidebar design — activity bar, tree views, welcome states
- Webview mockups — agent graph and dashboard layouts
- Status bar & commands — at-a-glance info, keyboard actions
- Reference study — learn from CDA Extension, Squad UI, top extensions

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
