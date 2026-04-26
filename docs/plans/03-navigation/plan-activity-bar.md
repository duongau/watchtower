---
title: "Activity Bar & View Containers"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-3, navigation, activity-bar]
---

# Activity Bar & View Containers

## Context

The extension needs a home in VS Code's activity bar (the vertical icon strip on the left). This provides a custom icon and groups our tree views (agents, sessions, skills) into a dedicated sidebar panel.

## Phases

- [ ] Phase 1: Activity bar icon — custom Watchtower/telescope icon
- [ ] Phase 2: View container — register `watchtower` viewsContainer
- [ ] Phase 3: View registration — agents, sessions, skills as views within the container
- [ ] Phase 4: Welcome views — helpful empty states when no .squad/ is found
- [ ] Phase 5: View title actions — refresh, add, filter buttons in view headers

## Details

### Phase 1: Activity bar icon
- Create SVG icon (telescope or watchtower theme)
- 24x24 px, monochrome (follows VS Code theme)
- Register in `contributes.viewsContainers.activitybar`

### Phase 2: View container
```json
"contributes": {
  "viewsContainers": {
    "activitybar": [{
      "id": "watchtower",
      "title": "Watchtower",
      "icon": "resources/watchtower.svg"
    }]
  }
}
```

### Phase 3: View registration
```json
"views": {
  "watchtower": [
    { "id": "watchtower.agents", "name": "Agents" },
    { "id": "watchtower.sessions", "name": "Sessions" },
    { "id": "watchtower.skills", "name": "Skills" }
  ]
}
```

### Phase 4: Welcome views
- When `.squad/` doesn't exist: "No squad found. Run Squad init to create a team."
- When `.squad/` exists but is empty: "Squad directory found but no agents configured."
- Include action buttons: "Initialize Squad", "Open Documentation"

### Phase 5: View title actions
- Each view gets header buttons via `view/title` menu contributions
- Agents: refresh, add member
- Sessions: refresh, export all
- Skills: refresh, create skill

## Reference Files (from Watchtower)
- VS Code Extension API docs for viewsContainers
