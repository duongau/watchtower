---
title: "Commands & Keybindings"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-3, navigation, commands]
---

# Commands & Keybindings

## Context

Watchtower has a custom command palette with 30+ commands. In VS Code, these become native commands registered via `contributes.commands`, accessible from Ctrl+Shift+P and bindable to keyboard shortcuts.

## Phases

- [ ] Phase 1: Core commands — open graph, refresh, toggle sidebar
- [ ] Phase 2: Agent commands — deploy, open charter, view history
- [ ] Phase 3: Session commands — export, browse, compare
- [ ] Phase 4: Graph commands — layout, zoom, filter, search
- [ ] Phase 5: Keybindings — default shortcuts for frequent actions

## Details

### Phase 1: Core commands

| Command ID | Title | Keybinding |
|-----------|-------|------------|
| `squadWatchtower.openGraph` | Squad Watchtower: Open Agent Graph | `Ctrl+Shift+W` |
| `squadWatchtower.refresh` | Squad Watchtower: Refresh | `Ctrl+Shift+R` |
| `squadWatchtower.openMC` | Squad Watchtower: Open Mission Control | — |
| `squadWatchtower.toggleSidebar` | Squad Watchtower: Toggle Sidebar | — |

### Phase 2: Agent commands

| Command ID | Title |
|-----------|-------|
| `squadWatchtower.deployAgent` | Squad Watchtower: Deploy Agent |
| `squadWatchtower.openCharter` | Squad Watchtower: Open Agent Charter |
| `squadWatchtower.viewHistory` | Squad Watchtower: View Agent History |
| `squadWatchtower.addAgent` | Squad Watchtower: Add Team Member |

### Phase 3: Session commands

| Command ID | Title |
|-----------|-------|
| `squadWatchtower.exportSession` | Squad Watchtower: Export Session |
| `squadWatchtower.browseSessions` | Squad Watchtower: Browse Sessions |

### Phase 4: Graph commands

| Command ID | Title |
|-----------|-------|
| `squadWatchtower.graphLayout` | Squad Watchtower: Change Layout |
| `squadWatchtower.graphZoomFit` | Squad Watchtower: Zoom to Fit |
| `squadWatchtower.graphSearch` | Squad Watchtower: Search Graph |
| `squadWatchtower.graphFilter` | Squad Watchtower: Filter Nodes |

### Phase 5: Keybindings
- Register via `contributes.keybindings` in package.json
- Use `when` clauses to scope (e.g., only active when graph panel is focused)
- Avoid conflicts with built-in VS Code shortcuts

## Reference Files (from Watchtower)
- `watchtower/src/components/CommandPalette.tsx` — current command palette
- `watchtower/src/registry/` — command registry
