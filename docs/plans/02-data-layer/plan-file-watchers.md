---
title: "File System Watchers"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-2, data-layer, file-watchers]
---

# File System Watchers

## Context

Watchtower's desktop app uses a custom FileWatcher class to monitor `.squad/` directories for changes and update the graph. In VS Code, we use the native `vscode.workspace.createFileSystemWatcher` API — more reliable, OS-integrated, and requires no server process.

## Phases

- [ ] Phase 1: Squad directory watcher — watch `.squad/` for team, charter, and decision changes
- [ ] Phase 2: Debouncing and batching — coalesce rapid file changes into single updates
- [ ] Phase 3: Change type detection — differentiate agent add/remove/update, decision changes, etc.
- [ ] Phase 4: Graph update triggers — map file changes to webview graph updates via postMessage
- [ ] Phase 5: Multi-root workspace support — watch `.squad/` in all workspace folders

## Details

### Phase 1: Squad directory watcher
```typescript
// Watch patterns
const teamWatcher = vscode.workspace.createFileSystemWatcher('**/.squad/team.md');
const charterWatcher = vscode.workspace.createFileSystemWatcher('**/.squad/agents/*/charter.md');
const historyWatcher = vscode.workspace.createFileSystemWatcher('**/.squad/agents/*/history.md');
const decisionsWatcher = vscode.workspace.createFileSystemWatcher('**/.squad/decisions.md');
const skillsWatcher = vscode.workspace.createFileSystemWatcher('**/.squad/skills/*/SKILL.md');
```

### Phase 2: Debouncing and batching
- 300ms debounce window — collect all changes, then process once
- Batch multiple file changes into a single graph rebuild
- Avoid re-reading files that haven't actually changed (compare mtime)

### Phase 3: Change type detection
- New agent charter → add node to graph
- Deleted agent folder → remove node from graph
- Changed charter → update node data
- Changed decisions.md → update shared state indicator
- New skill → add skill node (if skill nodes visible)

### Phase 4: Graph update triggers
- On change → re-read affected files → diff against current state → send delta to webview
- Delta updates preferred over full graph reload for performance
- Full reload as fallback when delta is too complex

### Phase 5: Multi-root workspace
- Multi-root workspaces may have multiple `.squad/` dirs
- Each gets its own watcher set
- Graph shows selector for active workspace folder

## Reference Files (from Watchtower)
- `watchtower/src/parsers/file-watcher.ts` — current FileWatcher implementation
- `watchtower/server/index.ts` — watcher integration in Express server
