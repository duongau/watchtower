---
title: "Reference Study"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-0, design, reference, research]
---

# Reference Study

## Context

Before designing Watchtower, study how the best VS Code extensions and our reference projects handle their UX. Extract patterns, avoid mistakes, find inspiration.

## Phases

- [ ] Phase 1: CDA Extension deep dive — sidebar, wizard, tabbed dashboard
- [ ] Phase 2: Squad UI extension — what it does, how it looks
- [ ] Phase 3: Top VS Code extensions — GitLens, GitHub PR, Docker, etc.
- [ ] Phase 4: Reference projects — ATM, Mission Control original features
- [ ] Phase 5: Synthesis — patterns to adopt, anti-patterns to avoid

## Details

### Phase 1: CDA Extension (`C:\GitHub\cda-platform\cda-extension`)
Study:
- How the sidebar wizard guides users through setup
- Tabbed dashboard layout after wizard completion
- Settings panel design
- How webview state persists across hide/show
- Theme integration approach

### Phase 2: Squad UI extension (installed)
Study:
- What tree views does it provide?
- How does it visualize squad data?
- Activity bar icon design
- What works well? What could be better?

### Phase 3: Top VS Code extensions
Study these for UX patterns:
- **GitLens** — tree views, status bar, inline decorations, webview panels
- **GitHub Pull Requests** — tree views with rich data, review UX
- **Docker** — container management in sidebar, multi-level tree
- **Thunder Client** — REST client built entirely in webview panels
- **MongoDB** — database browser in tree views

### Phase 4: Reference projects
Screenshots and feature review:
- **ATM** — org chart canvas, node inspector panel, deploy workflow
- **Mission Control** — 32-panel dashboard, real-time updates, task board

### Phase 5: Synthesis
Document:
- **Adopt:** Patterns that work well and fit our use case
- **Avoid:** Common mistakes in extension UX
- **Innovate:** Opportunities where we can do better than existing tools

## Deliverable
A brief synthesis document with screenshots/descriptions of patterns to adopt, recorded as knowledge in Hiruzen's history.md.
