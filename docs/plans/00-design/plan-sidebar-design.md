---
title: "Sidebar Design"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-0, design, sidebar]
---

# Sidebar Design

## Context

The sidebar is Watchtower's home in VS Code. Activity bar icon → sidebar with tree views showing squads, agents, sessions, and skills. This is where users spend most of their time.

## Phases

- [ ] Phase 1: Activity bar icon — design and register
- [ ] Phase 2: View hierarchy — how tree views are organized
- [ ] Phase 3: Tree item design — icons, labels, descriptions, actions
- [ ] Phase 4: Welcome views — empty states when no squads found
- [ ] Phase 5: HTML mockup — render the sidebar design

## Details

### Phase 1: Activity bar icon
- Telescope or watchtower motif
- 24x24 SVG, monochrome (adapts to theme)
- Should be recognizable at small size
- Tooltip: "Watchtower"

### Phase 2: View hierarchy

Option A — **Flat views:**
```
WATCHTOWER (activity bar)
├── SQUADS          (all discovered squads, expandable)
├── SESSIONS        (recent sessions across all squads)
└── SKILLS          (skills across all squads)
```

Option B — **Squad-centric:**
```
WATCHTOWER (activity bar)
├── SQUADS
│   ├── watchtower (this project)
│   │   ├── Minato (Lead)
│   │   ├── Tobirama (Extension API)
│   │   └── ...
│   ├── cda-extension
│   │   ├── Naruto (Lead)
│   │   └── ...
│   └── + Scan for squads
├── RECENT SESSIONS
└── OVERVIEW (stats)
```

**Decision needed:** Which hierarchy feels more natural?

### Phase 3: Tree item design

Agent tree item:
```
🟢 Minato — Lead / Architect
   └── Last active: 2 hours ago
```

Squad tree item:
```
📁 watchtower (Hokages) — 6 agents
   ├── 🟢 Minato — Lead
   ├── 🟡 Tobirama — Extension API
   └── ...
```

Session tree item:
```
📋 2026-04-26 14:30 — Minato
   └── "Phase 0 design review" · 12.4k tokens
```

### Phase 4: Welcome views
- No squads found: "No squads discovered. [Scan for squads] [Open documentation]"
- Squads found but empty: "Found 3 squads. Click to explore."

### Phase 5: HTML mockup
Create `docs/mockups/sidebar.html` showing the proposed layout with realistic data.

## Reference
- CDA Extension sidebar — wizard + tabbed dashboard in WebviewView
- Squad UI extension — tree view patterns
- GitLens — excellent tree view UX with inline actions
