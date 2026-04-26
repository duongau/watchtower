---
title: "Archive & Documentation"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-6, retire-desktop, archive, docs]
---

# Archive & Documentation

## Context

Once the VS Code extension reaches feature parity, the original Watchtower desktop repo should be archived with clear documentation pointing users to the extension.

## Phases

- [ ] Phase 1: Feature parity audit — confirm all key features are in the extension
- [ ] Phase 2: Original repo README update — add deprecation notice and redirect
- [ ] Phase 3: Archive original repo — set to read-only on GitHub
- [ ] Phase 4: Extension README — comprehensive docs for the VS Code extension
- [ ] Phase 5: Migration guide — document migration path for desktop users

## Details

### Phase 1: Feature parity audit
Compare features checklist:
- [ ] Agent graph visualization
- [ ] Mission Control dashboard
- [ ] Session browsing
- [ ] Skill discovery
- [ ] Voice commands
- [ ] Settings
- [ ] Search
- [ ] Export/import
- [ ] Layouts (13 algorithms)
- [ ] Undo/redo
Note: some features intentionally dropped (Remote Access, Auth)

### Phase 2: Original repo README
Add banner to top of watchtower README:
```markdown
> ⚠️ **This project has moved!** Watchtower is now a VS Code extension.
> Install from the marketplace: [Squad Watchtower](link)
> This repo is archived for reference.
```

### Phase 3: Archive
- `gh repo archive duongau/watchtower`
- Sets repo to read-only
- Existing stars, forks, issues preserved
- No new issues or PRs accepted

### Phase 4: Extension README
- Installation instructions
- Feature screenshots with captions
- Quick start guide (5 steps)
- Configuration reference
- FAQ
- Contributing guide

### Phase 5: Migration guide
- What changed and why
- How to migrate settings
- How to migrate data (the migration command)
- What features were dropped and why
- Where to report issues

## Reference Files
- Original watchtower README.md
