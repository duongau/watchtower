---
title: "Settings Migration"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-5, polish, settings]
---

# Settings Migration

## Context

Watchtower stores settings in `~/.copilot/Watchtower/settings.json` with a custom SettingsPanel UI. VS Code extensions use `contributes.configuration` for native settings integration — searchable, synced, with schema validation.

## Phases

- [ ] Phase 1: Define configuration schema — all settings in contributes.configuration
- [ ] Phase 2: Map existing settings — each desktop setting gets a VS Code equivalent
- [ ] Phase 3: Migration script — read old settings.json, apply to VS Code settings
- [ ] Phase 4: Settings UI enhancements — custom editor for complex settings
- [ ] Phase 5: Settings sync — ensure settings sync across VS Code instances

## Details

### Phase 1: Configuration schema
```json
"contributes": {
  "configuration": {
    "title": "Watchtower",
    "properties": {
      "watchtower.graphLayout": {
        "type": "string",
        "default": "TB",
        "enum": ["TB", "LR", "BT", "RL", "radial", "grid", "clustered"],
        "description": "Default graph layout direction"
      },
      "watchtower.showSkillNodes": {
        "type": "boolean",
        "default": true,
        "description": "Show skill nodes in the agent graph"
      },
      "watchtower.autoRefresh": {
        "type": "boolean",
        "default": true,
        "description": "Auto-refresh graph when .squad/ files change"
      }
    }
  }
}
```

### Phase 2: Settings mapping

| Desktop Setting | VS Code Setting | Notes |
|----------------|----------------|-------|
| graphLayout | watchtower.graphLayout | Same values |
| showSkillNodes | watchtower.showSkillNodes | Boolean |
| autoRefresh | watchtower.autoRefresh | New, was implicit |
| theme | Drop — VS Code handles themes | Native |
| port | Drop — no server | Not needed |
| apiKey | Drop — no HTTP auth | Not needed |
| mcUrl | watchtower.missionControl.url | MC connection |
| mcApiKey | watchtower.missionControl.apiKey | Secrets API |

### Phase 3: Migration script
- Command: `watchtower.migrateSettings`
- Read `~/.copilot/Watchtower/settings.json`
- Map each key to VS Code setting equivalent
- Write via `vscode.workspace.getConfiguration().update()`
- One-time operation with confirmation dialog

## Reference Files (from Watchtower)
- `watchtower/src/components/SettingsPanel.tsx`
- `watchtower/server/routes/settings.ts`
