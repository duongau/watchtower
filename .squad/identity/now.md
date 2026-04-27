---
updated_at: 2026-04-26T23:30:00Z
focus_area: Phases 0-3 COMPLETE — Phase 4 Mission Control next
active_issues: []
---

# What We're Focused On

## Current State
- **Phase 0 (Design):** COMPLETE
- **Phase 1 (Foundation):** COMPLETE — scaffold, message protocol, webview infrastructure, commands, graph port
- **Phase 2 (Data Layer):** COMPLETE — storage format, store adaptation, extension services, file watchers, graph data loading
- **Phase 3 (Navigation):** COMPLETE — activity bar, sidebar tree views, status bar, graph polish
- **Extension:** Installable via VSIX (`watchtower-0.1.0.vsix`)
- **Shortcut:** Ctrl+Shift+W opens Watchtower

## Working Features
- Agent graph webview (ReactFlow with avatar circles, toolbar, smoothstep edges, hover effects)
- Sidebar tree views: Agents, Sessions, Skills (squad-centric hierarchy)
- Status bar (squad count, active agents, tokens, cost)
- File watchers (live .squad/ monitoring with debounced updates)
- Live data loading (multi-squad discovery across local machine)

## Stats
- 233 tests passing across 22 test files
- Lint + build clean (esbuild extension + Vite webview)

## What's Next
1. **Phase 4: Mission Control** — dashboard webview with fleet status, token tracking, pipeline timeline, stats widgets
2. Pipeline continues: Plan → Build → Test → Review → Fix

## Nits Backlog
- GraphPanelProvider not pushed into `context.subscriptions` for explicit cleanup
- Session type location (should move to shared types)
- ServiceRegistry dispose error handling
- Duplicated dagre layout logic
