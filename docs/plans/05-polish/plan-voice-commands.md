---
title: "Voice Commands"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-5, polish, voice]
---

# Voice Commands

## Context

Watchtower has voice command support via Web Speech API. VS Code provides the `vscode.speech` API for speech-to-text, which is more integrated but has a different API surface.

## Phases

- [ ] Phase 1: Speech API integration — check availability, request permissions
- [ ] Phase 2: Command mapping — voice phrases → VS Code commands
- [ ] Phase 3: Continuous listening mode — toggle on/off indicator in status bar
- [ ] Phase 4: Voice feedback — visual confirmation of recognized commands
- [ ] Phase 5: Custom vocabulary — agent names, project terms, command aliases

## Details

### Phase 1: Speech API
- Check `vscode.speech` availability (requires VS Code 1.90+)
- Start/stop speech recognition via command
- Handle speech-to-text results
- Fallback message if Speech API unavailable

### Phase 2: Command mapping
Map spoken phrases to commands:
- "Open graph" → `watchtower.openGraph`
- "Show mission control" → `watchtower.openMC`
- "Deploy [agent name]" → `watchtower.deployAgent` with args
- "Refresh" → `watchtower.refresh`
- Fuzzy matching for natural language variations

### Phase 3: Continuous listening
- Status bar microphone icon (on/off toggle)
- When active, continuously processes speech
- Auto-pause during typing (avoid interference)
- Timeout after 30s silence

### Phase 4: Visual feedback
- Brief notification showing recognized text
- Command confirmation toast
- Error indication if command not recognized

### Phase 5: Custom vocabulary
- Read agent names from team.md for better recognition
- User-definable aliases in settings

## Reference Files (from Watchtower)
- `watchtower/src/voice/` — current voice implementation
- `watchtower/docs/voice-commands.md` — voice command documentation
