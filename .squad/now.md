# Now — Watchtower

> Current state of the project as of 2026-04-26T22:00:00Z

## Status

**Phase 2: Data Layer — COMPLETE**

- 190 tests passing, TypeScript compiles clean
- All six Phase 2 deliverables merged and reviewed:
  - Storage format (JSON files, no SQLite)
  - Store adaptation (Zustand v5, React 19-safe)
  - Graph data loading (squad-parser, graph-builder, squad-discovery)
  - Extension host services (service-registry, graph-service, session-service)
  - File system watchers (squad-watcher, debounce, push updates)
  - Store adaptation (slice composition, bridge integration)
- All code reviews by Minato: APPROVE or APPROVE with nits
- No blocking issues remaining

## Next Up

**Phase 3: Navigation** — sidebar tree views, activity bar, status bar, commands & keybindings

Key deliverables:
- Activity bar icon with badge count
- Squad-centric TreeView sidebar (Squads, Sessions, Skills, Overview)
- Status bar items (squad count, active agents, tokens, cost)
- Command palette commands & keybindings
- Session tree view (cross-squad timeline)
- Skills tree view (collapsed by default)

## Open Nits (non-blocking, track for cleanup)

- Session type should move from session-service.ts → types/index.ts
- Registry dispose needs try/catch per service
- GenericResponse still weakens the message union
- Multi-squad xOffset bug (3+ squads overlap) — one-line fix
- Refresh race condition: re-check bridge after async loadSquads()
- Event listener disposables silently discarded in squad-watcher
