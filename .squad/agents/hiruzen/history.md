# Hiruzen — History

## Project Context
Watchtower is a VS Code extension for monitoring AI agent squads. Migrated from a standalone desktop app. Hiruzen joined the team to handle UX design and mockups before implementation begins.

## Key Knowledge
- The extension uses a hybrid architecture: webview panels for complex React UI (graph, dashboard), native VS Code APIs for navigation (tree views, commands, status bar)
- Three inspiration projects: ATM (visual org chart), Mission Control (32-panel dashboard), Squad (the framework itself)
- CDA Extension at `C:\GitHub\cda-platform\cda-extension` is a reference for VS Code extension UX patterns
- Original desktop app at `C:\GitHub\squad-tools\watchtower` (being renamed to watchtower-legacy) has the feature set we're drawing from
- Duong wants to start from a clean baseline with mockups first, not port everything at once
- The goal is a unified dashboard across ALL local squads, not just the current workspace
