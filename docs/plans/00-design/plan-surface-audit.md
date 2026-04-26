---
title: "VS Code Surface Audit"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-0, design, surface-audit]
---

# VS Code Surface Audit

## Context

VS Code extensions have many UI surfaces. Before designing, we need to understand every option and decide which ones Watchtower uses. This audit catalogs each surface, its strengths/limitations, and our decision.

## Phases

- [ ] Phase 1: Catalog all VS Code extension UI surfaces
- [ ] Phase 2: Evaluate each for Watchtower use cases
- [ ] Phase 3: Map Watchtower features to surfaces
- [ ] Phase 4: Document decisions and trade-offs

## Details

### Phase 1: Surface catalog

| Surface | What It Is | Strengths | Limitations |
|---------|-----------|-----------|-------------|
| **Activity Bar** | Vertical icon strip on left | Always visible, one-click access | One icon only, no text |
| **Sidebar (TreeView)** | Hierarchical list views | Native look, fast, keyboard nav | No rich formatting, limited layout |
| **Sidebar (WebviewView)** | Custom HTML in sidebar | Full HTML/CSS, rich UI | Narrow width, complex to build |
| **WebviewPanel** | Full panel in editor area | Full React apps, any layout | Tab-based, can be hidden |
| **StatusBar** | Bottom bar items | Always visible, at-a-glance | Very limited space |
| **Commands** | Ctrl+Shift+P entries | Universal access, keyboard-first | No visual affordance |
| **Notifications** | Toast messages | Attention-getting | Temporary, dismissable |
| **QuickPick** | Dropdown selector | Fast search/filter, keyboard | One-time selection only |
| **OutputChannel** | Log panel | Good for diagnostics | Developer-facing, not end-user |
| **Terminal** | Integrated terminal | Full CLI access | Not visual |
| **Walkthrough** | Get Started tab | Great for onboarding | Only shown once-ish |
| **Editor decorations** | Inline text decorations | Context-sensitive | Only in editors |
| **SCM view** | Source control panel | Git integration | Specific to SCM |
| **Debug views** | Debug sidebar | Process inspection | Debug-specific |

### Phase 2: Evaluate for Watchtower

For each surface, answer:
1. What Watchtower data fits here?
2. How often will users look at this?
3. Does this feel native or forced?
4. What's the implementation cost?

### Phase 3: Feature → surface mapping

| Watchtower Feature | Recommended Surface | Why |
|---|---|---|
| Agent list with status | TreeView | Native, fast, keyboard nav |
| Agent graph visualization | WebviewPanel | Needs @xyflow/react, full canvas |
| Mission Control dashboard | WebviewPanel | Complex widget grid |
| Squad discovery (all local squads) | TreeView | Hierarchical data |
| Session history | TreeView | Time-grouped list |
| Active agent count | StatusBar | At-a-glance, always visible |
| Token usage summary | StatusBar or WebviewPanel | Quick number or detailed chart |
| Quick actions | Commands | Keyboard-first |
| First-time setup | Walkthrough | Native onboarding |
| Logs | OutputChannel | Standard pattern |

### Phase 4: Decision documentation
Record each decision in `.squad/decisions.md` with rationale.

## Reference
- CDA Extension (`C:\GitHub\cda-platform\cda-extension`) — uses WebviewView (sidebar), commands, walkthrough
- Squad UI extension (installed) — uses TreeView, activity bar
- VS Code API KB — search for each surface type
