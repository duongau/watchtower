---
title: "Data Migration Tool"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-6, retire-desktop, migration]
---

# Data Migration Tool

## Context

Users with existing Watchtower desktop installations have data in SQLite at `~/.copilot/Watchtower/watchtower.db`. This tool exports that data to the JSON file format the extension uses.

## Phases

- [ ] Phase 1: SQLite reader — open existing database, read all tables
- [ ] Phase 2: JSON writer — transform and write to new file structure
- [ ] Phase 3: Validation — verify migrated data matches source
- [ ] Phase 4: Command registration — `squadWatchtower.migrateData` command
- [ ] Phase 5: Error handling — graceful failures, partial migration support

## Details

### Phase 1: SQLite reader
- Open `~/.copilot/Watchtower/watchtower.db` (read-only)
- Query each table: agents, tasks, sessions, token_usage, events
- Handle missing tables gracefully (older schema versions)
- Close connection after reading

### Phase 2: JSON writer
Transform and write:
- `agents` → `~/.copilot/Watchtower/agents/{id}.json` (one per agent)
- `sessions` → `~/.copilot/Watchtower/sessions/{id}.json` (one per session)
- `tasks` → `~/.copilot/Watchtower/tasks/active.json` + `tasks/archive/`
- `token_usage` → `~/.copilot/Watchtower/tokens/{YYYY-MM}.json` (grouped by month)
- `events` → `~/.copilot/Watchtower/events/{YYYY-MM-DD}.json` (grouped by day)
- Skip: `audit_log`, `api_keys`, `webhooks` (not needed in extension)

### Phase 3: Validation
- Count records: source vs destination
- Spot-check key fields match
- Report: "Migrated X agents, Y sessions, Z token records"
- Warning if any records couldn't be migrated

### Phase 4: Command
- Triggered via command palette: "Squad Watchtower: Migrate Desktop Data"
- Confirmation dialog before starting
- Progress notification during migration
- Success/failure notification at end

### Phase 5: Error handling
- Missing database file → "No desktop data found"
- Corrupted database → "Database appears corrupted. Try backup."
- Partial failures → migrate what we can, report what failed
- Backup: copy original .db to .db.bak before touching anything

## Reference Files
- `watchtower/server/db/schema.sql` — source schema
- Phase 2 plan: plan-storage-format.md — target schema
