---
title: "Graph Data Loading"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-2, data-layer, graph-loading]
---

# Graph Data Loading

## Context

The desktop app loads graph data via `GET /api/graph` which scans `.squad/` directories and returns nodes/edges. In the extension, this becomes a service that reads `.squad/` files directly from the filesystem using `vscode.workspace.fs` and converts them into the graph node/edge format the webview expects.

## Phases

- [ ] Phase 1: Squad parser — read team.md, charter.md, decisions.md into structured types
- [ ] Phase 2: Graph builder — convert parsed squad data into GraphNode[] and GraphEdge[]
- [ ] Phase 3: Enrichment — add status, session data, token usage to node metadata
- [ ] Phase 4: Caching — in-memory graph cache with invalidation on file changes
- [ ] Phase 5: Multiple squad support — load from multiple workspace folders

## Details

### Phase 1: Squad parser
Port and adapt parsers from `watchtower/src/parsers/`:
- `parseTeamMd(content: string)` → `{ members: Agent[], context: ProjectContext }`
- `parseCharterMd(content: string)` → `{ role, scope, boundaries, model }`
- `parseDecisionsMd(content: string)` → `Decision[]`
- `parseRoutingMd(content: string)` → `RoutingRule[]`
- Use `gray-matter` for YAML frontmatter parsing

### Phase 2: Graph builder
Port from `watchtower/src/graph-builder.ts`:
- Root node (project/workspace)
- Agent nodes (from team.md members)
- Skill nodes (from `.squad/skills/`)
- Group nodes (for visual organization)
- Edges (agent→project, agent→skill relationships)
- Preserve node type system: AgentNode, SkillNode, GroupNode, RootNode, etc.

### Phase 3: Enrichment
- Agent status from history.md (last activity timestamp)
- Session data from orchestration-log/ (recent sessions)
- Decision count from decisions.md
- Skill count per agent from charter cross-ref

### Phase 4: Caching
- In-memory cache of parsed squad data
- Invalidated by FileSystemWatcher events
- Lazy loading — only parse files when graph is visible
- Cache TTL for non-watched data (60s)

### Phase 5: Multiple squad support
- Workspace folders may each contain `.squad/`
- Graph can show one or all workspaces
- Folder picker in webview header

## Reference Files (from Watchtower)
- `watchtower/src/graph-builder.ts` — current graph construction
- `watchtower/src/parsers/` — file parsers
- `watchtower/server/routes/graph.ts` — current scan and API logic
