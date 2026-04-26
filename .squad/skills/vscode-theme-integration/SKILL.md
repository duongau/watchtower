---
name: "vscode-theme-integration"
description: "How to theme webview HTML/CSS to match VS Code's native look across light, dark, and high contrast themes"
domain: "theming"
confidence: "medium"
source: "manual + research"
---

## Context

VS Code exposes 600+ CSS custom properties as `--vscode-*` tokens inside webviews.
These tokens auto-update when the user switches themes — no JS required.

**CDA Extension rules:**
- The sidebar must look native in Dark, Light, and High Contrast themes
- No hardcoded hex colors — everything via CSS variables
- CDA also has its own "Design E" theme layer (`DESIGN_E_CSS` in `src/panels/utils.ts`) that defines CDA-branded variables (e.g., `--bg`, `--border`, `--amber`)
- The CDA theme layer is a fallback/enhancement — **VS Code tokens always take priority** for native-feel components (inputs, buttons, sidebar)

## Patterns

### 1. Core theme tokens

These are the VS Code CSS tokens used most often in CDA webviews. Use these instead of
hardcoded colors.

```css
/* ── Base colors ── */
body {
  background-color: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
}

/* ── Form inputs ── */
.form-input, .form-select {
  background-color: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border);
}
.form-input::placeholder {
  color: var(--vscode-input-placeholderForeground);
}
.form-input:focus {
  border-color: var(--vscode-focusBorder);
}

/* ── Buttons ── */
.btn-primary {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
}
.btn-primary:hover {
  background-color: var(--vscode-button-hoverBackground);
}
.btn-secondary {
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
}

/* ── Sidebar ── */
.sidebar-container {
  background-color: var(--vscode-sideBar-background);
  color: var(--vscode-sideBar-foreground);
}

/* ── Status colors ── */
.error { color: var(--vscode-errorForeground); }
.success { color: var(--vscode-testing-iconPassed); }
.warning { color: var(--vscode-editorWarning-foreground); }
.muted { color: var(--vscode-descriptionForeground); }

/* ── Focus rings (accessibility) ── */
*:focus-visible {
  outline: 2px solid var(--vscode-focusBorder);
  outline-offset: -2px;
}
```

**CDA real-world usage** from wizard-html.ts:
```css
.step-title { color: var(--vscode-editor-foreground); }
.step-subtitle { color: var(--vscode-descriptionForeground); }
.step-pill.completed .step-circle {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}
.step-pill.current .step-circle {
  border: 2px solid var(--vscode-focusBorder);
  color: var(--vscode-focusBorder);
}
.tool-version.error { color: var(--vscode-errorForeground); }
.tool-version.success { color: var(--vscode-testing-iconPassed); }
```

### 2. Token naming convention

VS Code uses **dot notation** in the API and **dash notation** in CSS. The conversion rule:

| API / Theme JSON         | CSS Custom Property                  |
|--------------------------|--------------------------------------|
| `editor.background`      | `--vscode-editor-background`         |
| `input.foreground`       | `--vscode-input-foreground`          |
| `sideBar.background`     | `--vscode-sideBar-background`        |
| `button.hoverBackground` | `--vscode-button-hoverBackground`    |

**Rule:** Prefix with `--vscode-`, then replace only the first dot with a dash.
Subsequent camelCase segments stay as-is.

Example: `inputValidation.warningBackground` → `--vscode-inputValidation-warningBackground`

### 3. Base CSS reset for webviews

Every CDA webview should start with this reset. It ensures native look in all themes.

```css
/* CDA Webview Base Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
  font-family: var(--vscode-font-family, -apple-system, "Segoe UI", sans-serif);
  font-size: var(--vscode-font-size, 13px);
  line-height: 1.4;
  padding: 0;
  margin: 0;
}

/* Inputs */
input, select, textarea {
  background-color: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  padding: 4px 8px;
  outline: none;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--vscode-focusBorder);
}

/* Buttons */
button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background-color: var(--vscode-button-hoverBackground);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Links */
a {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
}
a:hover {
  color: var(--vscode-textLink-activeForeground);
  text-decoration: underline;
}

/* Scrollbars (match VS Code) */
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--vscode-scrollbarSlider-background);
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--vscode-scrollbarSlider-hoverBackground);
}
```

### 4. Dark/light mode handling

**You do NOT need `@media (prefers-color-scheme)`.** VS Code injects the correct token
values based on the active theme. Just use the tokens and it works in all themes.

```css
/* This is ALL you need — works in dark, light, and HC */
.card {
  background: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border);
  color: var(--vscode-editor-foreground);
}
```

The tokens resolve to different values automatically:
- Dark theme: `--vscode-editor-background` → `#1e1e1e`
- Light theme: `--vscode-editor-background` → `#ffffff`
- HC Dark: `--vscode-editor-background` → `#000000`

**No conditional CSS needed.** This is the biggest advantage of the VS Code token system.

### 5. High contrast mode

VS Code has High Contrast (HC) themes for accessibility. HC themes expose additional
border tokens that only have values in HC mode:

```css
/* These tokens are empty string in normal themes, visible in HC */
.card {
  border: 1px solid var(--vscode-contrastBorder, transparent);
}

/* Active/focused element border in HC */
.card:focus {
  border-color: var(--vscode-contrastActiveBorder, var(--vscode-focusBorder));
}
```

**Testing checklist for HC mode:**
1. Open Command Palette → "Preferences: Color Theme" → select "High Contrast"
2. Verify all text is readable (high contrast ratios)
3. Verify all interactive elements have visible borders
4. Verify focus indicators are prominent
5. Also test "High Contrast Light" theme

**CDA convention:** CDA uses `var(--vscode-focusBorder)` for focus rings on all interactive elements.
This works well in HC mode because VS Code sets a high-visibility focus border color.

### 6. Custom extension colors

Extensions can contribute custom color tokens via `package.json`. Use this for
CDA-specific semantic colors not covered by VS Code built-in tokens.

```jsonc
// In package.json → contributes → colors
{
  "contributes": {
    "colors": [
      {
        "id": "cda.wizardProgress",
        "description": "Color for wizard progress indicator",
        "defaults": {
          "dark": "#3fb950",
          "light": "#1a7f37",
          "highContrast": "#73e060",
          "highContrastLight": "#116329"
        }
      }
    ]
  }
}
```

Usage in CSS:
```css
.wizard-progress-bar {
  background-color: var(--vscode-cda-wizardProgress);
}
```

**When to use custom vs built-in:** Prefer built-in tokens whenever possible.
Only define custom tokens for CDA-specific semantic concepts that don't map to any
VS Code built-in (e.g., a CDA-branded accent color, a specific status indicator).

**CDA current approach:** CDA defines a `DESIGN_E_CSS` layer with custom CSS variables
(`--bg`, `--border`, `--amber`, `--blue`, etc.) in `src/panels/utils.ts`. These are
CDA-branded colors used alongside VS Code tokens. For form elements and interactive
controls, the VS Code tokens take precedence.

### 7. Spacing and layout

VS Code doesn't expose spacing tokens. CDA uses a **4px base unit** scale:

| Size | Value | Usage                                    |
|------|-------|------------------------------------------|
| xs   | 4px   | Tight internal padding, icon gaps        |
| sm   | 6px   | Tool item padding, small margins         |
| md   | 8px   | Standard gap, card padding               |
| lg   | 12px  | Section padding, form group spacing      |
| xl   | 16px  | Step progress padding, form group margin |
| 2xl  | 20px  | Body padding                             |
| 3xl  | 24px  | Body side padding, major section spacing |

**CDA real-world spacing** from wizard-html.ts:
```css
.step-progress { padding: 16px 12px 12px; }   /* xl lg lg */
.step-content { padding: 12px 12px; }          /* lg lg */
.form-group { margin-bottom: 16px; }           /* xl */
.tool-item { padding: 6px 8px; gap: 8px; }    /* sm md, gap md */
.form-label { margin-bottom: 6px; }            /* sm */
.form-helper { margin-top: 4px; }              /* xs */
```

**Convention:** Keep spacing consistent with these values. Don't use arbitrary pixel
values. Common border-radius is `4px` for inputs and buttons, `5px` for cards,
`50%` for circular indicators.

## Anti-Patterns

- **Never hardcode hex colors** — always use `var(--vscode-*)` tokens. The only exception is the `DESIGN_E_CSS` fallback layer which defines CDA-branded custom properties, but even those should be wrapped in `var()`.
- **Never use `@media (prefers-color-scheme)`** — VS Code tokens handle theme switching automatically. Using media queries would conflict with VS Code's theme system.
- **Never assume background is dark** — test in Light, Dark, High Contrast Dark, and High Contrast Light themes. CDA users may use any theme.
- **Never use `!important` to override theme tokens** — if a token isn't working, you're probably using the wrong one. Check the [Theme Color Reference](https://code.visualstudio.com/api/references/theme-color).
- **Never forget high contrast mode testing** — HC mode is an accessibility requirement. Elements must have visible borders and high contrast ratios.
- **Never use opacity for disabled states** — use `var(--vscode-disabledForeground)` for text color. CDA does use `opacity: 0.5` on disabled buttons as a pragmatic choice, but new components should prefer the semantic token.
- **Never inline `style` attributes with hex colors** — some legacy CDA code does this (e.g., warning boxes in sidebarProvider.ts with fallback hex values). New code should use CSS classes with token variables instead.
- **Never use `color-mix()` without a fallback** — CDA uses `color-mix(in srgb, var(--vscode-focusBorder) 15%, var(--vscode-input-background))` for selected states, but this isn't supported in all Electron versions. Always provide a solid fallback.

## References

- VS Code Theme Color Reference: https://code.visualstudio.com/api/references/theme-color
- VS Code Color Theme Guide: https://code.visualstudio.com/api/extension-guides/color-theme
- VS Code colorRegistry source: https://github.com/microsoft/vscode/blob/main/src/vs/platform/theme/common/colorRegistry.ts
- CDA source: `src/panels/wizard-html.ts` (WIZARD_CSS, TAB_NAV_CSS, all component styles)
- CDA source: `src/panels/utils.ts` (DESIGN_E_CSS — CDA branded theme layer)
- CDA source: `src/panels/sidebarProvider.ts` (inline styles in HTML generation)
- CDA source: `src/themes.ts` (theme picker, getThemeCSS, THEMES)
