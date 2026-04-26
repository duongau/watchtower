---
title: "Phase 4: Mission Control — Overview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-4, mission-control]
---

# Phase 4: Mission Control

## Goal
Live dashboard inside VS Code showing fleet status, token tracking, pipeline timelines, and system health — the CEO-view across all squad projects.

## Sub-Plans

- [ ] [Dashboard Webview](plan-dashboard-webview.md) — Widget grid layout in a WebviewPanel
- [ ] [Fleet Status Widget](plan-fleet-status.md) — Agent status across all projects
- [ ] [Token Tracking Widget](plan-token-tracking.md) — Usage breakdown by model and agent
- [ ] [Pipeline Widget](plan-pipeline-widget.md) — Pipeline timeline and run history
- [ ] [Stats & Health Widget](plan-stats-health.md) — System health, alerts, quick actions

## Dependencies
- Phase 2 (Data Layer) — services must exist for data feeds
- Phase 3 (Navigation) — commands exist to open Mission Control

## Agents
| Agent | Role in Phase |
|-------|--------------|
| Hashirama | Widget grid layout, React components, responsive design |
| Tsunade | Data aggregation, token calculations, event streams |
| Tobirama | Webview panel registration, message protocol for MC data |
| Kakashi | Widget rendering tests, data accuracy tests |
| Minato | Dashboard information architecture review |

## Acceptance Criteria
1. "Watchtower: Open Mission Control" command opens dashboard panel
2. Widget grid shows at least 4 widgets with live data
3. Widgets are reorderable via drag-and-drop
4. Token tracking shows accurate cost estimates by model
5. Fleet status shows agents across all workspace folders
6. Dashboard updates in real-time as squad activity occurs
7. Graceful empty states when no data is available
