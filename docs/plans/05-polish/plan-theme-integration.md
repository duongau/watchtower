---
title: "Theme Integration"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-5, polish, themes, css]
---

# Theme Integration

## Context

Watchtower uses hardcoded CSS variables for colors. VS Code webviews must use VS Code theme CSS variables to match the user's theme — light, dark, high contrast, and any custom theme.

## Phases

- [ ] Phase 1: CSS variable mapping — map Watchtower vars to VS Code theme vars
- [ ] Phase 2: Node styling — agent/skill/group nodes use theme-aware colors
- [ ] Phase 3: Widget styling — Mission Control widgets match VS Code panels
- [ ] Phase 4: High contrast support — ensure readability in HC themes
- [ ] Phase 5: Icon theming — SVG icons adapt to theme (light/dark variants)

## Details

### Phase 1: CSS variable mapping
```css
/* Watchtower → VS Code theme */
--wt-bg-primary    → var(--vscode-editor-background)
--wt-bg-secondary  → var(--vscode-sideBar-background)
--wt-text-primary  → var(--vscode-editor-foreground)
--wt-text-secondary → var(--vscode-descriptionForeground)
--wt-border        → var(--vscode-panel-border)
--wt-accent        → var(--vscode-focusBorder)
--wt-button-bg     → var(--vscode-button-background)
--wt-button-fg     → var(--vscode-button-foreground)
--wt-input-bg      → var(--vscode-input-background)
--wt-error         → var(--vscode-errorForeground)
--wt-warning       → var(--vscode-editorWarning-foreground)
--wt-success       → var(--vscode-testing-iconPassed)
```

### Phase 2: Node styling
- Agent nodes: subtle background from theme, border from accent color
- Skill nodes: different shade using opacity or secondary colors
- Group nodes: muted background for visual grouping
- Selected state: VS Code's focus border color
- All transitions smooth (0.2s ease)

### Phase 3: Widget styling
- Widget frame borders from panel-border
- Widget headers from sideBarSectionHeader colors
- Hover states from list.hoverBackground
- Scrollbars from scrollbarSlider colors

### Phase 4: High contrast
- Minimum 4.5:1 contrast ratio for all text
- Borders on all interactive elements
- No color-only indicators (always add icon/text)
- Test with HC Dark and HC Light themes

### Phase 5: Icon theming
- SVG icons use `currentColor` for automatic theme adaptation
- Or provide light/dark variants in resources/
- Activity bar icon must work on all themes

## Reference Files (from Watchtower)
- `watchtower/src/App.css` — current CSS variables
- `watchtower/src/components/MissionControl.css` — widget styling
