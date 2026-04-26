---
title: "Status Bar"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-3, navigation, status-bar]
---

# Status Bar

## Context

Watchtower has a status bar showing CLI version, agent count, and skill count. In VS Code, `StatusBarItem`s provide the same at-a-glance info, integrated with the native status bar at the bottom of the window.

## Phases

- [ ] Phase 1: Squad status item — "$(people) 5 agents" with tooltip showing names
- [ ] Phase 2: Active session indicator — "$(pulse) 2 active" when agents are running
- [ ] Phase 3: Token counter — "$(graph) 12.4k tokens" for current session
- [ ] Phase 4: Click actions — clicking status items opens relevant views
- [ ] Phase 5: Color-coded alerts — yellow/red for errors or attention needed

## Details

### Phase 1: Squad status
```typescript
const squadStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
squadStatus.text = '$(people) 5 agents';
squadStatus.tooltip = 'Minato (Lead), Tobirama (Extension), ...';
squadStatus.command = 'watchtower.openAgentGraph';
squadStatus.show();
```

### Phase 2: Active session
- Show when any agent session is detected as active
- Updates in real-time via file watcher events
- Clicking opens the Session tree view

### Phase 3: Token counter
- Aggregate tokens from current day's session logs
- Format: "12.4k" for readability
- Tooltip shows breakdown by model

### Phase 4: Click actions
- Agent count → opens graph view
- Active sessions → opens session tree
- Token counter → opens token details (webview or quick pick)

### Phase 5: Alerts
- `backgroundColor` for warnings/errors
- "$(warning) 2 stale agents" when agents haven't reported in >24h
- "$(error) Build failing" if CI status is red

## Reference Files (from Watchtower)
- `watchtower/src/App.tsx` → StatusBar component
