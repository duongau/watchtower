---
title: "Phase 2: Data Layer — Overview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-2, data-layer]
---

# Phase 2: Data Layer

## Goal
Graph auto-updates when `.squad/` files change. No Express server needed. The extension host becomes the backend — all data flows through VS Code APIs instead of HTTP.

## Sub-Plans

- [ ] [Storage Format](plan-storage-format.md) — JSON file schemas replacing 9 SQLite tables
- [ ] [Extension Host Services](plan-extension-services.md) — Service classes replacing 25 Express routes
- [ ] [File System Watchers](plan-file-watchers.md) — FileSystemWatcher for .squad/ live updates
- [ ] [Graph Data Loading](plan-graph-data-loading.md) — Load graph state from .squad/ files on activation
- [ ] [Store Adaptation](plan-store-adaptation.md) — Adapt Zustand slices for extension host context

## Dependencies
- Phase 1 (Foundation) — webview and message protocol must exist

## Agents
| Agent | Role in Phase |
|-------|--------------|
| Tsunade | Storage format design, extension services, data migration |
| Tobirama | File watchers, graph data loading |
| Hashirama | Store adaptation for webview context |
| Kakashi | Data integrity tests, watcher tests, service tests |
| Minato | Architecture review — validate storage decisions |

## Acceptance Criteria
1. Extension reads `.squad/team.md`, agent charters, and `decisions.md` into structured data
2. Changing a file in `.squad/` triggers automatic graph update in the webview
3. No Express server running — all data served by extension host
4. Agent status, sessions, and token data persisted to JSON files
5. Data survives VS Code restart (read back from `~/.copilot/Watchtower/`)
6. All 9 SQLite table equivalents have defined JSON schemas
