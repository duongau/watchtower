# Kakashi — History

## Core Context
- **Project:** Watchtower — VS Code extension migrating from standalone Watchtower desktop app
- **Owner:** Duong
- **Stack:** TypeScript, Vitest, @vscode/test-electron, @testing-library/react
- **My domain:** Testing — unit tests, extension integration tests, webview contract tests
- **Source repo:** C:\GitHub\squad-tools\watchtower (tests/ has existing test patterns)

## Learnings

### 2026-04-26: CSS compliance tests catch real bugs
- Wrote tests checking for hardcoded hex color values in CSS/TSX files
- Tests caught an actual hardcoded hex color that should have been a VS Code theme variable
- Validates the "no hardcoded colors" convention is enforced by the test suite, not just code review

## Completed Work

### 2026-04-26T23:00:00Z — CSS Compliance Tests (Phase 3)
- Added CSS compliance test suite that scans for hardcoded hex colors
- Caught a real bug: hardcoded hex value that violated theme variable convention
- Test suite now enforces `var(--vscode-*)` discipline automatically
