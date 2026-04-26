---
title: "Extension Publishing"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-6, retire-desktop, publishing, marketplace]
---

# Extension Publishing

## Context

Package the Watchtower extension and publish to the VS Code Marketplace so anyone can install it with one click.

## Phases

- [ ] Phase 1: Marketplace assets — icon, banner, screenshots, description
- [ ] Phase 2: Package configuration — .vscodeignore, categories, keywords
- [ ] Phase 3: Pre-publish checklist — license, changelog, README, bundle size
- [ ] Phase 4: Test in clean environment — install .vsix on fresh VS Code
- [ ] Phase 5: Publish — `vsce publish` to marketplace

## Details

### Phase 1: Marketplace assets
- Extension icon: 256x256 PNG (telescope/watchtower motif)
- Banner: marketplace header image
- Screenshots: graph view, mission control, sidebar, status bar
- Description: compelling 2-paragraph summary
- Badge: version, downloads, rating

### Phase 2: Package configuration
```json
{
  "categories": ["Visualization", "Other"],
  "keywords": ["ai", "agents", "monitoring", "dashboard", "copilot"],
  "publisher": "duongau",
  "repository": "https://github.com/duongau/squad-watchtower"
}
```

.vscodeignore:
```
src/**
test/**
docs/**
.squad/**
node_modules/**
*.map
```

### Phase 3: Pre-publish checklist
- [ ] LICENSE file (MIT)
- [ ] CHANGELOG.md (initial release)
- [ ] README.md with install instructions, screenshots, features
- [ ] Bundle size < 5MB (use esbuild to tree-shake)
- [ ] No dev dependencies in production bundle
- [ ] No secrets or PII in packaged extension

### Phase 4: Clean environment test
- Create a fresh VS Code profile
- Install .vsix via `code --install-extension`
- Verify: activation, commands, webview, tree views, status bar
- Test with no `.squad/` directory (graceful empty state)
- Test with a real `.squad/` directory

### Phase 5: Publish
- Create publisher account on marketplace
- `vsce login duongau`
- `vsce publish`
- Verify listing on marketplace.visualstudio.com
- Test install from marketplace search

## Reference Files
- VS Code publishing docs: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
