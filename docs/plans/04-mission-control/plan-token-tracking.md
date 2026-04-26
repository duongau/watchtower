---
title: "Token Tracking Widget"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-4, mission-control, tokens]
---

# Token Tracking Widget

## Context

The Token Chart widget visualizes AI token usage and estimated cost by model and agent. Essential for cost awareness and budget tracking across squad operations.

## Phases

- [ ] Phase 1: Token aggregation — read token data from session logs and JSON storage
- [ ] Phase 2: Summary display — total tokens, cost, breakdown by model
- [ ] Phase 3: Chart visualization — bar or line chart (CSS-only or lightweight chart lib)
- [ ] Phase 4: Time filtering — today, this week, this month, all time
- [ ] Phase 5: Per-agent breakdown — which agents consume the most tokens

## Details

### Phase 1: Token aggregation
- Read from `~/.copilot/Watchtower/tokens/{YYYY-MM}.json`
- Also parse session logs for inline token data
- Aggregate: total input tokens, output tokens, estimated cost
- Support multiple pricing models (Claude, GPT, etc.)

### Phase 2: Summary display
- Large numbers: "45.2k tokens · $2.34 est."
- Breakdown cards by model: Sonnet, Haiku, Opus, GPT
- Percentage bars showing relative usage

### Phase 3: Chart visualization
- CSS-only bar chart (no external chart library to keep bundle small)
- Or consider lightweight: chart.js in webview
- Daily usage over last 7/30 days
- Stacked by model

### Phase 4: Time filtering
- Quick filter buttons: Today | 7d | 30d | All
- Date range picker for custom ranges
- Filters affect all displays in the widget

### Phase 5: Per-agent breakdown
- Table: Agent | Tokens | Cost | % of Total
- Sort by cost descending
- Click agent name → open agent in graph view

## Reference Files (from Watchtower)
- `watchtower/src/components/MCTokenChart.tsx`
- `watchtower/server/services/token-tracker.ts`
- `watchtower/server/db/schema.sql` → token_usage table
