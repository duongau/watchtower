---
title: "Pipeline Widget"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-4, mission-control, pipeline]
---

# Pipeline Widget

## Context

The Pipeline Timeline widget shows agent task execution history — a visual timeline of what ran, when, and how long it took. Useful for understanding squad workflow patterns and bottlenecks.

## Phases

- [ ] Phase 1: Data source — parse orchestration-log entries for timeline events
- [ ] Phase 2: Timeline visualization — horizontal timeline with agent swim lanes
- [ ] Phase 3: Run details — click a run to see agent output, decisions made
- [ ] Phase 4: Status colors — success/failure/in-progress visual coding
- [ ] Phase 5: Filtering — by agent, date range, outcome

## Details

### Phase 1: Data source
- Read `.squad/orchestration-log/{timestamp}-{agent}.md` files
- Parse: agent name, timestamp, duration, outcome, files touched
- Build timeline event objects

### Phase 2: Timeline visualization
- CSS-based horizontal timeline (no heavy chart lib)
- Swim lanes per agent (horizontal rows)
- Time blocks showing duration proportionally
- Hover for details tooltip

### Phase 3: Run details
- Click a timeline block → expand details panel
- Show: agent name, task description, files modified, decisions made
- Link to orchestration log file

### Phase 4: Status colors
- Green: completed successfully
- Red: failed or rejected
- Blue: in progress
- Yellow: completed with warnings/notes

### Phase 5: Filtering
- Agent filter (multi-select)
- Date range filter
- Outcome filter (success/failure/all)

## Reference Files (from Watchtower)
- `watchtower/src/components/MCPipelineTimeline.tsx`
- `watchtower/src/components/MCPipelineRunView.tsx`
