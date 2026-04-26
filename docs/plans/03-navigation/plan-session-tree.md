---
title: "Session Tree View"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-3, navigation, tree-view, sessions]
---

# Session Tree View

## Context

Session history is currently shown in a custom SessionBrowser component. In VS Code, a tree view groups sessions by date and shows key metadata — agent, model, token usage. Clicking a session opens its log or summary.

## Phases

- [ ] Phase 1: SessionTreeDataProvider — list sessions from `.squad/log/` and `orchestration-log/`
- [ ] Phase 2: Grouping — organize by date (Today, Yesterday, This Week, Older)
- [ ] Phase 3: Session details — token count, duration, agent, model
- [ ] Phase 4: Context menu — open log, export session, compare sessions
- [ ] Phase 5: Live session indicator — currently active sessions highlighted

## Details

### Phase 1: Basic provider
- Read `.squad/log/*.md` and `.squad/orchestration-log/*.md`
- Parse timestamps from filenames (ISO 8601 format)
- Show session title and agent name

### Phase 2: Date grouping
- Group into collapsible sections: Today, Yesterday, This Week, This Month, Older
- Most recent first within each group
- Show count badge per group

### Phase 3: Session details
- Duration (from start/end timestamps in log content)
- Token usage (if tracked in log metadata)
- Agent name and model used
- Outcome summary (first line of log)

### Phase 4: Context menu
- "Open Log" → open .md file in editor
- "Export Session" → save as standalone markdown
- "View in Graph" → highlight session's agent in graph view

### Phase 5: Live sessions
- If an agent is currently active (detected via process or file lock), show ⚡ indicator
- Auto-refresh when new log files appear (via FileSystemWatcher)

## Reference Files (from Watchtower)
- `watchtower/src/components/SessionBrowser.tsx` — current session UI
- `watchtower/server/routes/sessions.ts` — session data API
