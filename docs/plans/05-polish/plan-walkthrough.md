---
title: "Walkthrough & Onboarding"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-5, polish, walkthrough, onboarding]
---

# Walkthrough & Onboarding

## Context

Watchtower has a GuidedTour component using react-joyride. VS Code has native Walkthroughs (`contributes.walkthroughs`) that appear in the Get Started tab — more integrated and consistent with the VS Code experience.

## Phases

- [ ] Phase 1: Walkthrough registration — contributes.walkthroughs in package.json
- [ ] Phase 2: Step content — markdown steps with images/commands
- [ ] Phase 3: Completion tracking — mark steps done, show progress
- [ ] Phase 4: Conditional steps — different paths for new vs existing users
- [ ] Phase 5: Interactive steps — steps that run commands to demonstrate features

## Details

### Phase 1: Walkthrough registration
```json
"contributes": {
  "walkthroughs": [{
    "id": "squadWatchtower.getStarted",
    "title": "Get Started with Squad Watchtower",
    "description": "Monitor your AI agent squads from inside VS Code",
    "steps": [...]
  }]
}
```

### Phase 2: Step content
1. **Welcome** — what Squad Watchtower does, key benefits
2. **Open the Agent Graph** — click to run the open graph command
3. **Explore the Sidebar** — agents, sessions, skills tree views
4. **Mission Control** — open the dashboard
5. **Customize** — settings, keybindings, theme

### Phase 3: Completion tracking
- Steps marked complete when their command is run
- `completionEvents`: `onCommand:squadWatchtower.openGraph`
- Progress indicator in walkthrough view
- "Mark All Complete" for experienced users

### Phase 4: Conditional steps
- If `.squad/` exists: show "Your squad is ready" step
- If `.squad/` doesn't exist: show "Initialize a squad" step
- Check via `when` clause conditions

### Phase 5: Interactive steps
- Steps that include command links: `[Open Graph](command:squadWatchtower.openGraph)`
- Steps that open specific files
- Steps that highlight UI elements

## Reference Files (from Watchtower)
- `watchtower/src/components/GuidedTour.tsx` — current tour
- `watchtower/docs/tour-steps-draft.md` — planned tour steps
