---
title: "Dashboard Webview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-4, mission-control, webview, dashboard]
---

# Dashboard Webview

## Context

Mission Control's widget dashboard is a complex React UI that can't be replicated with native VS Code tree views. It gets its own WebviewPanel, separate from the graph panel, with a responsive grid of reorderable widgets.

## Phases

- [ ] Phase 1: Panel registration — MCPanel provider, activate on command
- [ ] Phase 2: Widget grid — CSS Grid layout with drag-and-drop reordering
- [ ] Phase 3: Widget frame — reusable container (title, actions, loading state, error boundary)
- [ ] Phase 4: Widget configuration — user-selectable widgets, persisted layout
- [ ] Phase 5: Responsive design — adapt grid to panel width changes

## Details

### Phase 1: Panel registration
- Register `MCWebviewPanelProvider` in extension activation
- Command: `squadWatchtower.openMC`
- Panel title: "Mission Control"
- Icon: dashboard/grid icon
- Retains state on hide/show (retainContextWhenHidden)

### Phase 2: Widget grid
Port from `watchtower/src/components/MCWidgetGrid.tsx`:
- CSS Grid with configurable columns (auto-fit, minmax)
- Drag handle on each widget for reordering
- Grid gap and padding from VS Code theme variables

### Phase 3: Widget frame
Port from `watchtower/src/components/MCWidgetFrame.tsx`:
- Title bar with widget name and action buttons
- Loading spinner overlay
- Error boundary with retry
- Collapse/expand toggle
- Consistent styling across all widgets

### Phase 4: Widget configuration
- Widget visibility toggles (show/hide individual widgets)
- Layout persistence to extension globalState
- Default layout for first-time users
- "Reset Layout" command

### Phase 5: Responsive design
- Detect panel width via ResizeObserver
- 1 column on narrow panels, 2-3 on wider
- Widgets adapt their internal layout to available space

## Reference Files (from Watchtower)
- `watchtower/src/components/MCWidgetGrid.tsx`
- `watchtower/src/components/MCWidgetFrame.tsx`
- `watchtower/src/components/MissionControlPanel.tsx`
- `watchtower/src/components/MissionControl.css`
