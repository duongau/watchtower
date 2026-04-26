---
title: "Fleet Status Widget"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-4, mission-control, fleet-status]
---

# Fleet Status Widget

## Context

The Fleet Status widget shows all agents across all projects with their current status, model, and last activity. It's the "who's doing what" view.

## Phases

- [ ] Phase 1: Agent list — show all agents from all workspace .squad/ directories
- [ ] Phase 2: Status indicators — active/idle/error with color coding
- [ ] Phase 3: Grouping — group by project/workspace folder
- [ ] Phase 4: Quick actions — deploy, open charter, view history from widget
- [ ] Phase 5: Live updates — real-time status changes via file watcher events

## Details

### Phase 1: Agent list
Port from `watchtower/src/components/MCFleetStatus.tsx`:
- Table or card layout showing agent name, role, model
- Sort by status (active first) then name
- Show agent count in widget title

### Phase 2: Status indicators
- Active: green dot, shows current task if known
- Idle: gray dot, shows time since last activity
- Error: red dot, shows error message
- Human: person icon (not spawnable)

### Phase 3: Project grouping
- In multi-root workspaces, group agents by workspace folder
- Collapsible project sections
- Project name from `.squad/team.md` → Project Context

### Phase 4: Quick actions
- "Deploy" button → runs agent via Terminal API
- "Charter" link → opens charter.md in editor
- "History" link → opens history.md

### Phase 5: Live updates
- FileSystemWatcher events → update agent status
- Debounced re-renders (300ms)
- Visual transition animation on status change

## Reference Files (from Watchtower)
- `watchtower/src/components/MCFleetStatus.tsx`
