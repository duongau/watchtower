---
title: "Phase 1: Foundation — Overview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-1, foundation]
---

# Phase 1: Foundation

## Goal
See the agent graph inside VS Code. This is the proof of concept — when this phase is done, you open VS Code, run a command, and your agent graph appears in a webview panel.

## Sub-Plans

- [ ] [Scaffold Extension](plan-scaffold-extension.md) — Project structure, activation, package.json manifest
- [ ] [Webview Infrastructure](plan-webview-infrastructure.md) — WebviewPanel provider, React host, asset serving
- [ ] [Graph Port](plan-graph-port.md) — Port @xyflow/react graph with nodes, edges, layouts
- [ ] [Message Protocol](plan-message-protocol.md) — Extension host ↔ webview postMessage bridge
- [ ] [Commands Registration](plan-commands-registration.md) — Initial command palette entries

## Dependencies
- None — this is the starting phase

## Agents
| Agent | Role in Phase |
|-------|--------------|
| Tobirama | Extension scaffold, webview panel provider, commands |
| Hashirama | React webview app, graph port |
| Kakashi | Tests for activation, webview creation, message protocol |
| Minato | Architecture review before merging |

## Acceptance Criteria
1. `Squad Watchtower: Open Agent Graph` command opens a webview panel
2. Webview panel renders a React app with @xyflow/react
3. Graph shows mock/sample agent nodes with correct styling
4. Nodes are draggable, zoomable, and display agent information
5. Extension activates cleanly with no errors in Extension Host output
6. Basic message passing works between extension host and webview
