---
title: "Commands Registration"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-1, foundation, commands]
---

# Commands Registration

## Context

Register the initial VS Code commands that appear in the command palette. In Phase 1, these are minimal — just enough to open the graph and refresh data. Phase 3 will add the full command set matching the Watchtower toolbar.

## Phases

- [ ] Phase 1: Core commands — open graph, open MC, refresh
- [ ] Phase 2: Keyboard shortcuts — keybindings for frequent actions
- [ ] Phase 3: Command validation — when clauses for enable/disable

## Details

### Phase 1: Core commands
Register in `activate()`:
- `squadWatchtower.openGraph` — Open Agent Graph panel
- `squadWatchtower.openMissionControl` — Open Mission Control panel
- `squadWatchtower.refreshAgents` — Refresh agent data from .squad/ files

Each command: `vscode.commands.registerCommand(id, handler)` → push to `context.subscriptions`

### Phase 2: Keyboard shortcuts
In `package.json` contributes.keybindings:
- `Ctrl+Shift+W` → Open Agent Graph (or another unused combo)
- Evaluate conflicts with existing VS Code shortcuts

### Phase 3: Command validation
- `when` clauses in package.json — e.g., only show refresh when graph panel is active
- `setContext` for custom when-clause variables
- Gray out commands that don't apply

## Reference Files (from Watchtower)
- `watchtower/src/components/CommandPalette.tsx` — current command list (will become VS Code commands in Phase 3)
- `watchtower/src/App.tsx` — toolbar buttons (each becomes a command)

## Success Criteria
1. All three commands appear in command palette
2. Commands execute without errors
3. Graph panel opens on first command, focuses on subsequent
4. Keyboard shortcut works for quick access
