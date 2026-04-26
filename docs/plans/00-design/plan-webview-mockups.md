---
title: "Webview Mockups"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-0, design, webview, mockups]
---

# Webview Mockups

## Context

Two webview panels need mockups: the Agent Graph (visual node editor) and the Mission Control Dashboard (widget grid). These are the complex UI that can't be done with native VS Code tree views.

## Phases

- [ ] Phase 1: Agent Graph layout — node types, canvas, toolbar
- [ ] Phase 2: Mission Control layout — widget grid, stats, charts
- [ ] Phase 3: Panel chrome — how webviews integrate with VS Code's editor area
- [ ] Phase 4: Responsive behavior — how panels adapt to different sizes
- [ ] Phase 5: HTML mockups — render both designs as static HTML files

## Details

### Phase 1: Agent Graph
Port the @xyflow/react graph, but designed for VS Code's context:
- Darker/lighter based on VS Code theme (not standalone app colors)
- Toolbar simplified — fewer buttons, VS Code commands handle the rest
- Node types: Agent, Skill, Group, Root
- What info shows on each node at-a-glance vs. on click?
- How does it connect to the sidebar? (click agent in tree → highlight in graph)

### Phase 2: Mission Control Dashboard
Simplified from the 32-panel Mission Control original:
- Start with 4-5 essential widgets
- Which widgets give the most value for a VS Code extension user?
- Proposed essential widgets:
  1. **Fleet Overview** — all squads, agent counts, health
  2. **Active Sessions** — what's running right now
  3. **Token Usage** — today's spend by model
  4. **Recent Activity** — timeline of recent squad events
  5. **Quick Actions** — common operations

### Phase 3: Panel chrome
- Tab title and icon
- How do Graph and MC panels coexist? (tabs in editor area)
- Panel toolbar actions (refresh, layout, filter)
- Does the webview have its own header bar or rely on VS Code's?

### Phase 4: Responsive behavior
- Narrow panels (side-by-side with editor) — stack widgets vertically
- Wide panels (full width) — grid layout
- Minimum useful width for each view

### Phase 5: HTML mockups
Create:
- `docs/mockups/agent-graph.html` — agent graph with sample nodes
- `docs/mockups/mission-control.html` — dashboard with sample widgets

Use VS Code CSS variables for theming so mockups look right in dark mode.

## Reference
- Original Watchtower graph — `C:\GitHub\squad-tools\watchtower` (being renamed to watchtower-legacy)
- ATM (Agent Team Manager) — visual org chart inspiration
- Mission Control (builderz-labs) — dashboard widget patterns
