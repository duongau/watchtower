---
title: "Agent Tree View"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-3, navigation, tree-view]
---

# Agent Tree View

## Context

The sidebar needs a tree view showing all squad members from `.squad/team.md` with their role, status, and quick actions. This replaces the agent list in the Watchtower sidebar and makes agents first-class citizens in VS Code's explorer.

## Phases

- [ ] Phase 1: Basic AgentTreeDataProvider — read team.md, show agent names with roles
- [ ] Phase 2: Status indicators — idle/active/error icons based on last activity
- [ ] Phase 3: Agent details — expandable tree items showing model, scope, last session
- [ ] Phase 4: Context menu actions — open charter, view history, deploy agent
- [ ] Phase 5: Inline actions — quick buttons for common operations

## Details

### Phase 1: Basic provider
```typescript
class AgentTreeDataProvider implements vscode.TreeDataProvider<AgentTreeItem> {
  getTreeItem(element: AgentTreeItem): vscode.TreeItem { ... }
  getChildren(element?: AgentTreeItem): AgentTreeItem[] { ... }
  // Fire on .squad/team.md changes
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
}
```

### Phase 2: Status indicators
- 🟢 Active — agent has activity in last 30 minutes
- 🟡 Idle — agent exists but no recent activity
- 🔴 Error — charter missing or malformed
- 👤 Human — human team member (non-spawnable)
- 🤖 Copilot — @copilot coding agent

### Phase 3: Agent details (expandable)
- Role (from team.md)
- Model preference (from charter.md)
- Last activity (from history.md mtime)
- Decision count (from decisions.md mentions)
- Skills (from charter cross-ref with .squad/skills/)

### Phase 4: Context menu
- "Open Charter" → opens charter.md in editor
- "View History" → opens history.md in editor
- "Open in Graph" → focuses agent node in webview graph
- "Deploy Agent" → launches agent via terminal

### Phase 5: Inline actions
- Refresh button on the view title bar
- Quick-deploy button on each agent item
- Collapse/expand all

## Reference Files (from Watchtower)
- `watchtower/src/components/nodes/AgentNode.tsx` — current agent UI
- `watchtower/server/routes/agents.ts` — agent data API
