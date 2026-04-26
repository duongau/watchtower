---
title: "Phase 0: Design — Overview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-0, design, ux, mockups]
---

# Phase 0: Design

## Goal
Before writing any code, map out the full VS Code extension surface area — what goes where, how it looks, and how users interact with it. Produce mockups that the team builds against.

## Sub-Plans

- [ ] [Surface Audit](plan-surface-audit.md) — Inventory all VS Code extension surfaces and decide what we use
- [ ] [Information Architecture](plan-information-architecture.md) — What data lives where in the extension
- [ ] [Sidebar Design](plan-sidebar-design.md) — Activity bar icon, tree views, welcome views
- [ ] [Webview Mockups](plan-webview-mockups.md) — Agent graph and Mission Control dashboard layouts
- [ ] [Status Bar & Commands](plan-statusbar-commands.md) — At-a-glance info and keyboard-driven actions
- [ ] [Reference Study](plan-reference-study.md) — Learn from CDA Extension, Squad UI, and top VS Code extensions

## Dependencies
- None — this is the true starting phase. Everything builds on these designs.

## Agents
| Agent | Role in Phase |
|-------|--------------|
| Hiruzen | Primary owner — designs, mockups, information architecture |
| Minato | Architecture review — validate feasibility of designs |
| Tobirama | VS Code API feasibility check — what's possible with which APIs |
| Hashirama | Webview feasibility — can @xyflow/react render this way? |

## Deliverables
1. HTML mockup files in `docs/mockups/` showing each view
2. Information architecture document — what data appears in each surface
3. Surface map — which VS Code API powers each piece of the extension
4. Design decisions recorded in `.squad/decisions.md`

## Acceptance Criteria
1. Duong reviews mockups and approves the direction
2. Every VS Code surface used has been validated as feasible by Tobirama
3. The team has a clear visual target to build against
4. Information hierarchy is defined — most important data most prominent
