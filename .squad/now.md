# Now — Watchtower

> Current state of the project as of 2026-04-26T22:45:00Z

## Status

**Phase 3: Navigation — COMPLETE**

- 233 tests passing, TypeScript compiles clean
- Phase 2 (Data Layer) complete — all six deliverables merged and reviewed
- Phase 3 complete — all 6 sub-plans done:
  - [x] Agent tree view (squad-centric hierarchy, AgentTreeProvider)
  - [x] Session tree view (flat list, 20-cap, SessionTreeProvider)
  - [x] Status bar (squad count, active agents)
  - [x] Activity bar icon (telescope SVG, currentColor)
  - [x] Command registration (5 commands, when-clauses, context menus)
  - [x] Skills tree view (SkillsTreeProvider)
  - [x] Commands & keybindings (command palette polish)
- Navigation code review by Minato: APPROVE (4 nits)

## Next Up

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
