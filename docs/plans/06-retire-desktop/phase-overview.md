---
title: "Phase 6: Retire Desktop — Overview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-6, retire-desktop]
---

# Phase 6: Retire Desktop

## Goal
Clean separation from the desktop app. Remove Electron/Tauri code, archive the original repo, publish the VS Code extension to the marketplace.

## Sub-Plans

- [ ] [Code Removal](plan-code-removal.md) — Remove Electron, Tauri, Express, standalone build scripts
- [ ] [Data Migration Tool](plan-data-migration.md) — One-time tool to migrate SQLite → JSON
- [ ] [Extension Publishing](plan-publishing.md) — Package, test, publish to VS Code Marketplace
- [ ] [Archive & Documentation](plan-archive.md) — Archive original repo, update README, redirect users

## Dependencies
- Phase 1–5 must be complete (feature parity confirmed)

## Agents
| Agent | Role in Phase |
|-------|--------------|
| Tobirama | Code removal, dependency cleanup |
| Tsunade | Data migration tool |
| Hashirama | Marketplace assets (icon, screenshots, description) |
| Kakashi | Final regression tests, migration tool tests |
| Minato | Go/no-go decision, feature parity audit |

## Acceptance Criteria
1. No Electron, Tauri, or Express code remains in extension repo
2. SQLite → JSON migration tool works reliably on existing data
3. Extension published to VS Code Marketplace (or ready to publish)
4. Original watchtower repo archived with clear redirect to extension
5. README documents migration path for existing users
6. All tests pass, no regressions from desktop feature set
