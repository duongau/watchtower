---
title: "Phase 5: Polish — Overview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-5, polish]
---

# Phase 5: Polish

## Goal
Feature parity with desktop app for key workflows. Voice commands, onboarding walkthrough, settings migration, VS Code theme integration, and search.

## Sub-Plans

- [ ] [Voice Commands](plan-voice-commands.md) — VS Code Speech API integration
- [ ] [Walkthrough & Onboarding](plan-walkthrough.md) — contributes.walkthroughs for first-time setup
- [ ] [Settings Migration](plan-settings.md) — contributes.configuration replacing settings.json
- [ ] [Theme Integration](plan-theme-integration.md) — CSS variables mapped to VS Code theme colors
- [ ] [Search Integration](plan-search.md) — Find across agents, decisions, sessions, skills

## Dependencies
- Phase 3 (Navigation) — commands and tree views must exist
- Phase 4 (Mission Control) — dashboard must exist for theme integration

## Agents
| Agent | Role in Phase |
|-------|--------------|
| Hashirama | Theme CSS, search UI, voice UI indicators |
| Tobirama | Speech API, settings contribution, walkthrough |
| Tsunade | Search indexing, settings data migration |
| Kakashi | Accessibility tests, theme contrast tests |
| Minato | UX review of onboarding flow |

## Acceptance Criteria
1. Voice commands can open graph, navigate agents, trigger actions
2. First-time users see a walkthrough guiding them through setup
3. All desktop settings have VS Code extension equivalents
4. Webview colors adapt to any VS Code theme (light/dark/high contrast)
5. Full-text search across agents, decisions, sessions returns relevant results
6. Extension passes VS Code accessibility audit
