# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Extension architecture, API design, integration strategy | Minato | Extension activation, provider patterns, webview ↔ host protocol |
| VS Code APIs, commands, tree views, providers, status bar | Tobirama | registerCommand, TreeDataProvider, FileSystemWatcher, StatusBarItem |
| Webview React components, graph UI, dashboard widgets | Hashirama | @xyflow/react port, webview panels, Mission Control widgets |
| Data layer, storage, state management, file watchers | Tsunade | JSON storage design, Zustand adaptation, .squad/ file parsing |
| Testing, quality, edge cases, verification | Kakashi | Vitest tests, extension integration tests, webview contract tests |
| Code review | Minato | Review PRs, check quality, validate against architecture |
| Scope & priorities | Minato | What to build next, trade-offs, decisions |
| Session logging | Scribe | Automatic — never needs routing |

## Rules

1. **Eager by default** — spawn all agents who could usefully start work.
2. **Scribe always runs** after substantial work, always as background. Never blocks.
3. **Quick facts → coordinator answers directly.**
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel.
6. **Anticipate downstream work.** If a feature is being built, spawn Kakashi to write tests simultaneously.
7. **VS Code API questions → Tobirama first.** He's the extension API specialist.
8. **Webview questions → Hashirama first.** He owns the React webview layer.
