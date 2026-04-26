---
title: "Skills Tree View"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-3, navigation, tree-view, skills]
---

# Skills Tree View

## Context

Watchtower shows skill nodes in the graph. In VS Code, skills also appear as a tree view in the sidebar, providing quick browse/edit access to `.squad/skills/` without needing the graph view open.

## Phases

- [ ] Phase 1: SkillsTreeDataProvider — list skills from `.squad/skills/*/SKILL.md`
- [ ] Phase 2: Skill metadata — confidence level, last updated, used-by agents
- [ ] Phase 3: Context menu — open SKILL.md, view in graph, create new skill
- [ ] Phase 4: Personal skills — include `~/.copilot/skills/` alongside project skills
- [ ] Phase 5: Marketplace integration — browse and install from registered marketplaces

## Details

### Phase 1: Basic provider
- Scan `.squad/skills/` for directories containing `SKILL.md`
- Show skill name (derived from directory name)
- Icon based on skill type or domain

### Phase 2: Metadata
- Parse SKILL.md frontmatter for confidence level (low/medium/high)
- Show confidence as icon decoration (🔴/🟡/🟢)
- Last modified timestamp
- Cross-reference with charters to show which agents use each skill

### Phase 3: Context menu
- "Open SKILL.md" → editor
- "View in Graph" → focus skill node
- "Create New Skill" → scaffold SKILL.md from template

### Phase 4: Personal skills
- `~/.copilot/skills/` contains user-level skills
- Show in separate collapsible group: "Project Skills" vs "Personal Skills"
- Personal skills are read-only in project context

## Reference Files (from Watchtower)
- `watchtower/src/components/nodes/SkillNode.tsx` — skill node UI
- `watchtower/server/services/skill-discovery.ts` — skill scanning
