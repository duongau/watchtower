# Now — Watchtower

> Current state of the project as of 2026-04-26T22:30:00Z

## Status

**Phase 3: Navigation — IN PROGRESS**

- 217 tests passing, TypeScript compiles clean
- Phase 2 (Data Layer) complete — all six deliverables merged and reviewed
- Phase 3 progress:
  - [x] Agent tree view (squad-centric hierarchy, AgentTreeProvider)
  - [x] Session tree view (flat list, 20-cap, SessionTreeProvider)
  - [x] Status bar (squad count, active agents)
  - [x] Activity bar icon (telescope SVG, currentColor)
  - [x] Command registration (5 commands, when-clauses, context menus)
  - [ ] Skills tree view (declared but no provider yet)
  - [ ] Commands & keybindings (command palette polish)
- Navigation code review by Minato: APPROVE (4 nits)

## Next Up

- Skills tree view provider (placeholder or full implementation)
- Commands & keybindings polish
- Phase 4: Mission Control (dashboard WebviewPanel)

## Open Nits (non-blocking, track for cleanup)

- Session type should move from session-service.ts → types/index.ts
- Registry dispose needs try/catch per service
- GenericResponse still weakens the message union
- Multi-squad xOffset bug (3+ squads overlap) — one-line fix
- Refresh race condition: re-check bridge after async loadSquads()
- Event listener disposables silently discarded in squad-watcher
- EventEmitter dispose on AgentTreeProvider and SessionTreeProvider
- Skills view needs `when` visibility gate until provider exists
- Redundant onCommand activation events (auto-generated since VS Code 1.74)
- GraphPanelProvider still not pushed to context.subscriptions
