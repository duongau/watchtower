---
title: "Search Integration"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-5, polish, search]
---

# Search Integration

## Context

Watchtower has a search bar and full-text search across agents and sessions. In VS Code, search can integrate with the graph view, tree views, and potentially VS Code's native search with custom file associations.

## Phases

- [ ] Phase 1: Graph search — filter/highlight nodes by text query
- [ ] Phase 2: Tree view filtering — filter agent/session/skill trees by search text
- [ ] Phase 3: Full-text search — search across all .squad/ content
- [ ] Phase 4: Quick pick search — Ctrl+P style fuzzy search for agents and commands
- [ ] Phase 5: Search result navigation — click result → navigate to source

## Details

### Phase 1: Graph search
- Search bar in webview header
- As-you-type filtering: dim non-matching nodes, highlight matches
- Search across node name, role, description, tags
- Clear search restores full graph

### Phase 2: Tree view filtering
- Built-in tree view filtering (VS Code supports this natively)
- Type in the tree view to filter items
- Filtered count shown in view title

### Phase 3: Full-text search
- Index `.squad/` markdown files
- Search across: charter.md, history.md, decisions.md, SKILL.md
- Results show file, line, and context snippet
- Ranked by relevance

### Phase 4: Quick pick search
- `squadWatchtower.quickSearch` command
- Opens VS Code QuickPick with fuzzy search
- Categories: Agents, Skills, Sessions, Decisions, Commands
- Icons per category for visual distinction

### Phase 5: Result navigation
- Click agent result → focus in tree + highlight in graph
- Click session result → open session log
- Click decision result → jump to line in decisions.md
- Click skill result → open SKILL.md

## Reference Files (from Watchtower)
- `watchtower/src/components/SearchBar.tsx`
- `watchtower/server/routes/search.ts`
