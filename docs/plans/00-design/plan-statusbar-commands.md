---
title: "Status Bar & Commands Design"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-0, design, status-bar, commands]
---

# Status Bar & Commands Design

## Context

The status bar gives at-a-glance info without opening any panel. Commands make everything keyboard-accessible. Both need intentional design — what's worth showing, and what actions should be one shortcut away.

## Phases

- [ ] Phase 1: Status bar items — what info, what order, what click actions
- [ ] Phase 2: Command inventory — every action users can take
- [ ] Phase 3: Default keybindings — shortcuts for frequent actions
- [ ] Phase 4: Context menus — right-click actions in tree views

## Details

### Phase 1: Status bar items

Proposed layout (left to right):
```
$(telescope) 3 squads · $(pulse) 1 active · $(graph) 4.2k tokens
```

| Item | Text | Click Action | Priority |
|------|------|-------------|----------|
| Squads count | "$(telescope) 3 squads" | Open squads tree view | Left, 100 |
| Active sessions | "$(pulse) 1 active" | Open sessions tree view | Left, 99 |
| Token usage | "$(graph) 4.2k tokens" | Open MC token widget | Left, 98 |

Show/hide based on context:
- Active sessions only shows when > 0
- Token count only shows if tracking is enabled

### Phase 2: Command inventory

| Command | Title | When |
|---------|-------|------|
| `watchtower.openGraph` | Watchtower: Open Agent Graph | Always |
| `watchtower.openMC` | Watchtower: Open Dashboard | Always |
| `watchtower.refresh` | Watchtower: Refresh | Always |
| `watchtower.scanSquads` | Watchtower: Scan for Squads | Always |
| `watchtower.openCharter` | Watchtower: Open Agent Charter | Agent selected |
| `watchtower.openDecisions` | Watchtower: Open Decisions | Squad selected |

### Phase 3: Default keybindings

| Shortcut | Command | Rationale |
|----------|---------|-----------|
| `Ctrl+Shift+W` | Open Agent Graph | Quick access to main view |
| `Ctrl+Shift+D` | Open Dashboard | Quick access to MC |

### Phase 4: Context menus
- Right-click agent in tree → Open Charter, View History, Open in Graph
- Right-click squad in tree → Open Decisions, Refresh, Open Graph

## Reference
- GitLens status bar — excellent at-a-glance git info pattern
