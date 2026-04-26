---
title: "Webview Infrastructure"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-1, foundation, webview]
---

# Webview Infrastructure

## Context

Set up the WebviewPanel provider that hosts our React application. This is the bridge between VS Code's extension host and our React UI. The webview runs in an iframe — it cannot access Node.js APIs or the filesystem directly. All communication happens via postMessage.

## Phases

- [ ] Phase 1: WebviewPanel provider — create, show, dispose lifecycle
- [ ] Phase 2: React host HTML — index.html template with CSP, script/style nonces
- [ ] Phase 3: Vite build for webview — separate build config for React bundle
- [ ] Phase 4: Asset serving — webview URI conversion for scripts, styles, images
- [ ] Phase 5: Panel state — retain webview on tab switch (retainContextWhenHidden)
- [ ] Phase 6: Dev experience — hot reload for webview during development

## Details

### Phase 1: WebviewPanel provider
- `src/providers/GraphPanelProvider.ts`
- `vscode.window.createWebviewPanel()` with viewType `watchtower.graph`
- Enable scripts in webview options
- Set `localResourceRoots` to the webview dist directory
- Handle `onDidDispose` to clean up resources
- Singleton pattern — reuse existing panel if already open

### Phase 2: React host HTML
- Content Security Policy (CSP) with nonces for inline scripts
- `<div id="root">` mount point for React
- Link to bundled CSS and JS via webview URIs
- Meta viewport tag
- VS Code theme CSS variables are automatically available in webview

### Phase 3: Vite build for webview
- Separate `vite.config.webview.ts` — builds React app to `dist/webview/`
- Output: single JS bundle + CSS (no code splitting — webview loads from local files)
- React 19, @xyflow/react, Zustand, Lucide React in bundle
- Tree-shaking to minimize bundle size
- Source maps for debugging

### Phase 4: Asset serving
- `webview.asWebviewUri()` converts local file paths to webview-safe URIs
- Icons, images served from `resources/` directory
- Fonts from VS Code's built-in font stack (codicon)

### Phase 5: Panel state
- `retainContextWhenHidden: true` — keeps React state when panel loses focus
- Trade-off: uses more memory but prevents state loss
- Alternative: serialize state to extension host on hide, restore on show

### Phase 6: Dev experience
- Watch mode: Vite rebuilds webview on save
- Extension reloads webview content on rebuild
- `webview.html = getWebviewContent()` refresh pattern
- Consider `vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction')`

## Reference Files (from Watchtower)
- `watchtower/index.html` — current HTML shell (adapt for webview CSP)
- `watchtower/vite.config.ts` — current Vite config (fork for webview build)
- `watchtower/src/App.tsx` — React app entry (will mount inside webview)

## Key Constraints
- Webview CSP must allow React, @xyflow/react, and Zustand
- No `eval()` or inline scripts without nonces
- `file://` URIs don't work — must use `webview.asWebviewUri()`
- Webview cannot import from `node_modules` at runtime — must be bundled

## Success Criteria
1. Command opens a webview panel with React "Hello World"
2. CSP allows React to render without console errors
3. Styles load correctly (both bundled CSS and VS Code theme variables)
4. Panel survives tab switches without losing state
5. Vite watch mode enables rapid webview development
