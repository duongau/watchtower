---
title: "Scaffold VS Code Extension"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-1, foundation, scaffold]
---

# Scaffold VS Code Extension

## Context

Set up the VS Code extension project with proper TypeScript configuration, extension manifest (package.json contributes), activation events, and build pipeline. This is the foundation everything else builds on.

## Phases

- [ ] Phase 1: Project structure — directory layout, tsconfig, build scripts
- [ ] Phase 2: Extension manifest — package.json contributes (commands, views, viewsContainers)
- [ ] Phase 3: Extension entry point — activate/deactivate, disposable registration
- [ ] Phase 4: Build pipeline — compile, watch, package, lint scripts
- [ ] Phase 5: Dev workflow — launch.json for F5 debugging, tasks.json

## Details

### Phase 1: Project structure
- `src/extension.ts` — main entry point
- `src/providers/` — tree view and webview providers
- `src/services/` — data services (replacing Express routes)
- `src/webview/` — React app source for webview panels
- `src/types/` — shared TypeScript types
- `resources/` — icons, webview assets
- `test/` — test files
- Separate tsconfig for extension host vs webview (webview needs DOM lib)

### Phase 2: Extension manifest
- `contributes.commands` — initial commands (open graph, open MC, refresh)
- `contributes.viewsContainers` — activity bar entry with icon
- `contributes.views` — agents, sessions, skills tree views
- `activationEvents` — onCommand or * (decide based on startup cost)
- `engines.vscode` — minimum VS Code version (1.100+)

### Phase 3: Extension entry point
- Register all commands in activate()
- Register disposables properly (context.subscriptions.push)
- Clean up resources in deactivate()
- Output channel for logging

### Phase 4: Build pipeline
- `npm run compile` — tsc for extension host code
- `npm run watch` — incremental compilation
- `npm run package` — vsce package for .vsix
- `npm run lint` — tsc --noEmit
- Consider esbuild for faster builds and smaller bundle

### Phase 5: Dev workflow
- `.vscode/launch.json` — Extension Development Host configuration
- `.vscode/tasks.json` — compile task linked to launch
- Hot reload strategy for webview development

## Reference Files (from Watchtower)
- `watchtower/package.json` — dependency list for migration assessment
- `watchtower/tsconfig.json` — TypeScript config patterns
- `watchtower/vite.config.ts` — may need Vite for webview build

## Success Criteria
1. `F5` launches Extension Development Host
2. Extension activates without errors
3. Activity bar shows Watchtower icon
4. Commands appear in command palette
5. `npm run lint` passes with no errors
