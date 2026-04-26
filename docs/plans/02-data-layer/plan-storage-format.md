---
title: "Storage Format Design"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-2, data-layer, storage]
---

# Storage Format Design

## Context

Watchtower's desktop app uses SQLite with 9 tables (agents, tasks, sessions, token_usage, events, audit_log, api_keys, alert_rules, webhooks). The VS Code extension replaces this with JSON files in `~/.copilot/Watchtower/`, readable and editable by both the extension and external tools.

## Phases

- [ ] Phase 1: Define file layout — directory structure under `~/.copilot/Watchtower/`
- [ ] Phase 2: Schema design — TypeScript interfaces + Zod schemas for each file
- [ ] Phase 3: SQLite table mapping — which tables become files vs. dropped vs. VS Code state
- [ ] Phase 4: Migration utility — script to export existing SQLite data to JSON format
- [ ] Phase 5: Read/write service — CRUD helper for JSON file operations with atomic writes

## Details

### Phase 1: File layout
```
~/.copilot/Watchtower/
├── settings.json           # App settings (replaces settings table + settings.json)
├── agents/                 # One file per agent (replaces agents table)
│   ├── {agent-id}.json
├── sessions/               # Session logs (replaces sessions table)
│   ├── {session-id}.json
├── tasks/                  # Task queue (replaces tasks table)
│   ├── active.json         # Current active tasks
│   ├── archive/            # Completed tasks by month
├── tokens/                 # Token usage tracking (replaces token_usage table)
│   ├── {YYYY-MM}.json      # Monthly aggregated token data
├── events/                 # Event log (replaces events table)
│   ├── {YYYY-MM-DD}.json   # Daily event files
├── graphs/                 # Saved graph layouts (already exists)
│   ├── {layout-name}.json
```

### Phase 2: Schema design
- Define Zod schemas matching each JSON file structure
- Generate TypeScript types from schemas
- Validate on read (schema drift protection)
- Include version field in each file for future migrations

### Phase 3: SQLite table mapping

| SQLite Table | JSON Replacement | Notes |
|-------------|-----------------|-------|
| agents | `agents/{id}.json` | One file per agent, richer data |
| tasks | `tasks/active.json` + `tasks/archive/` | Split active vs completed |
| sessions | `sessions/{id}.json` | One file per session |
| token_usage | `tokens/{YYYY-MM}.json` | Monthly aggregation |
| events | `events/{YYYY-MM-DD}.json` | Daily log files |
| audit_log | Drop — use VS Code OutputChannel | Extension doesn't need its own audit |
| api_keys | Drop — no HTTP server, no auth needed | VS Code handles trust |
| alert_rules | `settings.json` → alerts section | Simpler, fewer rules |
| webhooks | Drop — rethink as VS Code extension events | Or keep minimal in settings |

### Phase 4: Migration utility
- Read from SQLite at `~/.copilot/Watchtower/watchtower.db`
- Write to new JSON file structure
- One-time script (run once, then SQLite can be archived)
- Verify round-trip: JSON → load → compare with SQLite data

### Phase 5: Read/write service
- Atomic writes (write to temp file, rename)
- File locking for concurrent access safety
- Debounced writes (batch rapid mutations)
- In-memory cache with dirty tracking

## Reference Files (from Watchtower)
- `watchtower/server/db/schema.sql` — current table definitions
- `watchtower/server/db/index.ts` — SQLite connection setup
