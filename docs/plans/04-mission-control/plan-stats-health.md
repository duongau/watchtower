---
title: "Stats & Health Widget"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-4, mission-control, stats, health]
---

# Stats & Health Widget

## Context

Combines the stats bar, system health indicators, and quick actions into a single widget providing at-a-glance operational status and common shortcuts.

## Phases

- [ ] Phase 1: Stats bar — key metrics (agents, sessions today, decisions, open issues)
- [ ] Phase 2: System health — .squad/ integrity check, file watcher status, extension health
- [ ] Phase 3: Quick actions — common operations as clickable buttons
- [ ] Phase 4: Alert stream — recent events and alerts in a scrolling list
- [ ] Phase 5: Memory browser — view and navigate squad decisions and agent knowledge

## Details

### Phase 1: Stats bar
Port from `watchtower/src/components/MCStatsBar.tsx`:
- Active agents count
- Sessions today count
- Decisions this week count
- Open GitHub issues (if connected)
- Each stat is clickable → navigates to relevant view

### Phase 2: System health
Port from `watchtower/src/components/MCSystemHealthBar.tsx`:
- .squad/ directory exists and is readable ✓/✗
- File watchers active ✓/✗
- Extension host healthy ✓/✗
- Git repo status (branch, clean/dirty)

### Phase 3: Quick actions
Port from `watchtower/src/components/MCQuickActions.tsx`:
- "Refresh All" — re-scan .squad/ and update everything
- "Open Graph" — switch to agent graph panel
- "New Session" — start a squad session
- "Export Report" — generate session summary

### Phase 4: Alert stream
Port from `watchtower/src/components/MCIncidentStream.tsx`:
- Recent events from `.squad/orchestration-log/`
- Alert rules triggered
- Scrolling list, newest first
- Click to open source log

### Phase 5: Memory browser
Port from `watchtower/src/components/MCMemoryBrowser.tsx`:
- Browse decisions.md sections
- Browse agent history.md entries
- Search across all squad knowledge
- Click to open in editor

## Reference Files (from Watchtower)
- `watchtower/src/components/MCStatsBar.tsx`
- `watchtower/src/components/MCSystemHealthBar.tsx`
- `watchtower/src/components/MCQuickActions.tsx`
- `watchtower/src/components/MCIncidentStream.tsx`
- `watchtower/src/components/MCMemoryBrowser.tsx`
