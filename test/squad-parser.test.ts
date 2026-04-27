import { describe, it, expect } from 'vitest';
import {
  parseTeamMd,
  parseCharterMd,
  parseDecisionsMd,
} from '../src/services/squad-parser';

// ---------------------------------------------------------------------------
// parseTeamMd
// ---------------------------------------------------------------------------

describe('parseTeamMd', () => {
  const TEAM_MD = `# Squad Team

> Watchtower — VS Code extension for monitoring AI agent squads

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | Routes work, enforces handoffs. |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Minato | Lead / Architect | [charter](agents/minato/charter.md) | Active |
| Tobirama | Extension API Dev | [charter](agents/tobirama/charter.md) | Active |
| Hashirama | Frontend Dev | [charter](agents/hashirama/charter.md) | Active |
| Tsunade | Data Engineer | [charter](agents/tsunade/charter.md) | Active |
| Kakashi | Tester | [charter](agents/kakashi/charter.md) | Active |
| Ralph | Work Monitor | — | 🔄 Monitor |

## Human Members

| Name | Role | Notes |
|------|------|-------|
| Duong | Product Owner | Final approvals |

## Project Context

- **Project:** Watchtower — VS Code Extension
- **Owner:** Duong
- **Created:** 2026-04-26
- **Stack:** TypeScript, VS Code Extension API
- **Source universe:** Naruto (Hokages)
`;

  it('extracts all agents from the Members table', () => {
    const { agents } = parseTeamMd(TEAM_MD);
    expect(agents).toHaveLength(6);
    expect(agents.map((a) => a.name)).toEqual([
      'Minato',
      'Tobirama',
      'Hashirama',
      'Tsunade',
      'Kakashi',
      'Ralph',
    ]);
  });

  it('parses agent roles correctly', () => {
    const { agents } = parseTeamMd(TEAM_MD);
    expect(agents[0].role).toBe('Lead / Architect');
    expect(agents[1].role).toBe('Extension API Dev');
    expect(agents[5].role).toBe('Work Monitor');
  });

  it('maps status strings to AgentStatus', () => {
    const { agents } = parseTeamMd(TEAM_MD);
    // "Active" → 'active'
    expect(agents[0].status).toBe('active');
    // "🔄 Monitor" → 'active' (contains monitor emoji)
    expect(agents[5].status).toBe('active');
  });

  it('extracts project context key-value pairs', () => {
    const { projectContext } = parseTeamMd(TEAM_MD);
    expect(projectContext['Project']).toContain('Watchtower');
    expect(projectContext['Owner']).toBe('Duong');
    expect(projectContext['Source universe']).toBe('Naruto (Hokages)');
  });

  it('returns empty arrays for content without Members section', () => {
    const { agents, projectContext } = parseTeamMd('# Just a heading\nSome text.');
    expect(agents).toEqual([]);
    expect(Object.keys(projectContext)).toHaveLength(0);
  });

  it('skips rows with empty name cells', () => {
    const md = `## Members
| Name | Role | Charter | Status |
|------|------|---------|--------|
|  | Empty Agent | — | Active |
| Valid | Builder | — | Idle |
`;
    const { agents } = parseTeamMd(md);
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe('Valid');
  });
});

// ---------------------------------------------------------------------------
// parseCharterMd
// ---------------------------------------------------------------------------

describe('parseCharterMd', () => {
  const CHARTER_MD = `# Minato — Lead / Architect

## Identity
- **Name:** Minato
- **Role:** Lead / Architect
- **Project:** Watchtower (VS Code Extension)

## Responsibilities
- Extension architecture decisions and patterns
- Code review and quality gates
- VS Code extension ↔ webview integration strategy
- Phase planning and scope management

## Boundaries
- Does NOT write feature code
`;

  it('extracts role from h1 heading', () => {
    const { role } = parseCharterMd(CHARTER_MD);
    expect(role).toBe('Lead / Architect');
  });

  it('extracts responsibilities list', () => {
    const { responsibilities } = parseCharterMd(CHARTER_MD);
    expect(responsibilities).toHaveLength(4);
    expect(responsibilities[0]).toBe('Extension architecture decisions and patterns');
    expect(responsibilities[3]).toBe('Phase planning and scope management');
  });

  it('falls back to **Role:** field when h1 has no dash', () => {
    const md = `# Agent Charter

## Identity
- **Role:** Data Engineer

## Responsibilities
- Storage design
`;
    const { role } = parseCharterMd(md);
    expect(role).toBe('Data Engineer');
  });

  it('returns empty for content without role or responsibilities', () => {
    const { role, responsibilities } = parseCharterMd('Just some text.');
    expect(role).toBe('');
    expect(responsibilities).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// parseDecisionsMd
// ---------------------------------------------------------------------------

describe('parseDecisionsMd', () => {
  const DECISIONS_MD = `# Squad Decisions

> Canonical decision ledger

---

### 2026-04-26T00:00:00Z: Hybrid extension architecture
**By:** Duong + Squad (Coordinator)
**What:** Use hybrid architecture — panels for React UI, native APIs for navigation.
**Why:** Best of both worlds.

### 2026-04-26T00:01:00Z: Replace SQLite with JSON files
**By:** Duong + Squad (Coordinator)
**What:** Replace better-sqlite3 database with JSON files.
**Why:** Native modules are painful to bundle.

### 2026-04-26T14:00:00Z: Squad-centric sidebar hierarchy
**By:** Hiruzen
**What:** Use squad-centric tree hierarchy — squads as top-level expandable nodes.
**Why:** Multi-squad discovery is a core decision.
`;

  it('parses all decision entries', () => {
    const decisions = parseDecisionsMd(DECISIONS_MD);
    expect(decisions).toHaveLength(3);
  });

  it('extracts timestamp and title', () => {
    const decisions = parseDecisionsMd(DECISIONS_MD);
    expect(decisions[0].timestamp).toBe('2026-04-26T00:00:00Z');
    expect(decisions[0].title).toBe('Hybrid extension architecture');
  });

  it('extracts author and summary', () => {
    const decisions = parseDecisionsMd(DECISIONS_MD);
    expect(decisions[0].by).toBe('Duong + Squad (Coordinator)');
    expect(decisions[0].summary).toContain('hybrid architecture');
  });

  it('handles decision without **By:** field', () => {
    const md = `### 2026-01-01T00:00:00Z: Orphan decision
**What:** Something happened.
**Why:** Reasons.
`;
    const decisions = parseDecisionsMd(md);
    expect(decisions).toHaveLength(1);
    expect(decisions[0].by).toBe('Unknown');
  });

  it('returns empty array for content without decisions', () => {
    const decisions = parseDecisionsMd('# Just a heading');
    expect(decisions).toEqual([]);
  });
});
