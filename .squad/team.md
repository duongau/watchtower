# Squad Team

> Watchtower — VS Code extension for monitoring AI agent squads

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | Routes work, enforces handoffs and reviewer gates. |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Minato | Lead / Architect | [charter](agents/minato/charter.md) | Active |
| Tobirama | Extension API Dev | [charter](agents/tobirama/charter.md) | Active |
| Hashirama | Frontend Dev | [charter](agents/hashirama/charter.md) | Active |
| Tsunade | Data Engineer | [charter](agents/tsunade/charter.md) | Active |
| Kakashi | Tester | [charter](agents/kakashi/charter.md) | Active |
| Scribe | Session Memory | [charter](agents/scribe/charter.md) | Active |
| Ralph | Work Monitor | — | 🔄 Monitor |

## Human Members

| Name | Role | Notes |
|------|------|-------|
| Duong | Product Owner | Final approvals, vision, mockup reference |

## Project Context

- **Project:** Watchtower — VS Code Extension
- **Owner:** Duong
- **Created:** 2026-04-26
- **Stack:** TypeScript, VS Code Extension API, React 19 (webviews), @xyflow/react, Zustand, Vitest
- **Origin:** Migration from standalone Watchtower desktop app (Electron/React/Express/SQLite)
- **Source repo (local):** `C:\GitHub\squad-tools\watchtower` — original desktop app, reference only
- **Source universe:** Naruto (Hokages)

### Vision
A unified VS Code command center for managing ALL squads across all local projects. One dashboard showing what every team is doing, day-to-day activity, token usage, session history. Not a copy of the desktop app — a better version built native to VS Code, starting from a clean baseline and adding incrementally.

### Inspiration Projects
These three projects informed the original Watchtower's design. Use as reference for feature ideas:

1. **ATM (Agent Team Manager)** — `github.com/DatafyingTech/Claude-Agent-Team-Manager`
   - Visual drag-drop org chart for Claude agents (@xyflow/react + dagre)
   - One-click deployment with auto-generated primers
   - Schedule runs, chain pipelines, AI-generated team structures
   - Tech: Tauri v2, React 19, Zustand, Monaco Editor, Zod

2. **Mission Control** — `github.com/builderz-labs/mission-control`
   - 32-panel AI agent orchestration dashboard
   - Task board (Kanban), fleet status, cost tracking, skills hub
   - Real-time WebSocket + SSE, security audit, agent trust scoring
   - Memory knowledge graph, agent eval framework
   - Tech: Next.js 16, React 19, SQLite, Zustand, Recharts

3. **Squad** — `github.com/bradygaster/squad`
   - The framework we USE — human-led AI agent teams via GitHub Copilot
   - `.squad/` directory structure, casting, decisions, ceremonies
   - Ralph (work monitor), watch mode, issue lifecycle
   - Squad CLI + SDK, VS Code agent integration

### Key Differentiator
Watchtower combines ATM's visual graph with Mission Control's dashboard depth, built specifically for Squad framework teams, and running INSIDE VS Code instead of as a separate app. It discovers and monitors all `.squad/` directories on the local machine.

### Key decisions
  1. Hybrid architecture — webview for graph/dashboard, native VS Code for navigation/commands
  2. Replace SQLite with JSON files in `~/.copilot/Watchtower/`
  3. Replace Express server with extension host services
  4. Replace WebSocket with VS Code postMessage protocol
  5. Drop Electron/Tauri, Remote Access, standalone auth
  6. Start from clean baseline — build incrementally, don't port everything at once
  7. Multi-squad discovery — scan local machine for all `.squad/` directories
