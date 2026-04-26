---
title: "Phase 3: Navigation — Overview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-3, navigation]
---

# Phase 3: Navigation

## Goal
Full keyboard-driven navigation without touching the webview. Agents, sessions, and skills appear as native VS Code tree views in the sidebar. Status bar shows live connection info. All toolbar actions are available as commands.

## Sub-Plans

- [ ] [Agent Tree View](plan-agent-tree.md) — AgentTreeDataProvider showing squad members with status
- [ ] [Session Tree View](plan-session-tree.md) — SessionTreeDataProvider with session history
- [ ] [Skills Tree View](plan-skills-tree.md) — Skill discovery and browsing
- [ ] [Status Bar](plan-status-bar.md) — Connection status, agent counts, active sessions
- [ ] [Commands & Keybindings](plan-commands-keybindings.md) — Full command palette integration
- [ ] [Activity Bar & Views](plan-activity-bar.md) — Custom activity bar icon and view containers

## Dependencies
- Phase 2 (Data Layer) — services must exist to provide data to tree providers

## Agents
| Agent | Role in Phase |
|-------|--------------|
| Tobirama | Tree data providers, status bar items, command registration |
| Hashirama | Icons, tree item decorations, UX consistency |
| Kakashi | Provider tests, command tests |
| Minato | Review UX flow and information architecture |

## Acceptance Criteria
1. Activity bar shows Watchtower icon with agent/session/skills views
2. Agent tree shows all squad members with role, status, and last activity
3. Clicking an agent opens its charter in the editor
4. Session tree shows recent sessions grouped by date
5. Status bar shows agent count and active session count
6. All key actions available via Command Palette (Ctrl+Shift+P)
7. Keyboard shortcuts for common actions (open graph, refresh, toggle sidebar)
