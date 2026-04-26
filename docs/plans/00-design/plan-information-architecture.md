---
title: "Information Architecture"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-0, design, information-architecture]
---

# Information Architecture

## Context

What data does the user care about most? Where does it live in the extension? This defines the hierarchy — what's prominent, what's secondary, what's on-demand.

## Phases

- [ ] Phase 1: Data inventory — what information does Watchtower surface?
- [ ] Phase 2: Priority ranking — what do users check most often?
- [ ] Phase 3: Grouping — how does data cluster naturally?
- [ ] Phase 4: Layout mapping — priority → surface placement

## Details

### Phase 1: Data inventory

| Data | Source | Update Frequency |
|------|--------|-----------------|
| Squad roster (agents, roles) | `.squad/team.md` | Rarely changes |
| Agent status (active/idle) | `.squad/agents/*/history.md` mtime | Per session |
| Session history | `.squad/log/`, `orchestration-log/` | Every session |
| Decisions | `.squad/decisions.md` | Per session |
| Skills | `.squad/skills/*/SKILL.md` | Rarely changes |
| Token usage | Session logs | Per session |
| Graph layout (agent relationships) | Derived from team + routing | Rarely changes |
| Multi-squad overview | All `.squad/` dirs on machine | On scan |
| Active sessions | Process detection or file locks | Real-time |
| Git status per project | git CLI | On demand |

### Phase 2: Priority ranking

What does Duong look at most?

**Tier 1 — Glance (status bar, sidebar top):**
- How many squads active right now?
- Any agents currently running?
- Today's token spend

**Tier 2 — Check (sidebar, one click):**
- Which agents are on which team?
- Recent session summaries
- Current project's squad roster

**Tier 3 — Dive (webview, dedicated panel):**
- Agent graph visualization
- Full session logs
- Token breakdown by model/agent
- Decision history
- Cross-squad dashboard

### Phase 3: Grouping

Natural clusters:
- **Per-squad view** — roster, decisions, sessions, skills for one squad
- **Cross-squad overview** — all squads, aggregated stats
- **Historical** — session logs, token trends, decision timeline

### Phase 4: Layout mapping

| Priority | Surface | Data |
|----------|---------|------|
| Tier 1 | StatusBar | Agent count, active sessions, today's tokens |
| Tier 2 | Sidebar TreeViews | Agents (per squad), sessions, skills |
| Tier 2 | Sidebar TreeView | Multi-squad discovery (all local squads) |
| Tier 3 | WebviewPanel | Agent graph, Mission Control dashboard |
| Tier 3 | WebviewPanel | Full session viewer, token charts |
| On-demand | Commands | Refresh, navigate, export |
