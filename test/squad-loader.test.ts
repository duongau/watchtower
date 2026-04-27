import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSquadFromPath } from '../src/services/squad-parser';
import { workspace, FileType } from 'vscode';

// ---------------------------------------------------------------------------
// Helper to encode string as Uint8Array (mimics vscode.workspace.fs.readFile)
// ---------------------------------------------------------------------------

function encode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const TEAM_MD = `# Squad Team

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Minato | Lead / Architect | [charter](agents/minato/charter.md) | Active |
| Tsunade | Data Engineer | [charter](agents/tsunade/charter.md) | Active |

## Project Context

- **Project:** Watchtower — VS Code Extension
- **Source universe:** Naruto (Hokages)
`;

const CONFIG_JSON = JSON.stringify({
  version: 1,
  agentModelOverrides: {
    minato: 'claude-opus-4.6',
    tsunade: 'gpt-5.3-codex',
  },
});

const DECISIONS_MD = `# Decisions

### 2026-04-26T00:00:00Z: Test decision
**By:** Duong
**What:** Made a test decision.
**Why:** Testing.
`;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('loadSquadFromPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a full squad with agents, models, decisions, and skills', async () => {
    // Mock readFile for team.md, config.json, decisions.md
    vi.mocked(workspace.fs.readFile)
      .mockResolvedValueOnce(encode(TEAM_MD))      // team.md
      .mockResolvedValueOnce(encode(CONFIG_JSON));  // config.json

    // Mock stat for charter paths — Minato found, Tsunade not
    vi.mocked(workspace.fs.stat)
      .mockResolvedValueOnce({ type: FileType.File, ctime: 0, mtime: 0, size: 100 })  // minato charter
      .mockRejectedValueOnce(new Error('Not found'));  // tsunade charter

    // Mock readFile for decisions.md
    vi.mocked(workspace.fs.readFile)
      .mockResolvedValueOnce(encode(DECISIONS_MD));  // decisions.md

    // Mock readDirectory for skills/
    vi.mocked(workspace.fs.readDirectory).mockResolvedValueOnce([
      ['pipeline-01-plan', FileType.Directory],
      ['pipeline-02-build', FileType.Directory],
      ['README.md', FileType.File],
    ]);

    const squad = await loadSquadFromPath('/projects/watchtower');

    // Squad metadata
    expect(squad.name).toBe('Watchtower');
    expect(squad.path).toBe('/projects/watchtower');
    expect(squad.universe).toBe('Naruto (Hokages)');

    // Agents
    expect(squad.agents).toHaveLength(2);
    expect(squad.agents[0].name).toBe('Minato');
    expect(squad.agents[0].model).toBe('claude-opus-4.6');
    expect(squad.agents[0].charterPath).toBeDefined();
    expect(squad.agents[1].name).toBe('Tsunade');
    expect(squad.agents[1].model).toBe('gpt-5.3-codex');
    expect(squad.agents[1].charterPath).toBeUndefined();

    // Decisions
    expect(squad.decisions).toHaveLength(1);
    expect(squad.decisions[0].title).toBe('Test decision');

    // Skills (only directories, not files)
    expect(squad.skills).toEqual(['pipeline-01-plan', 'pipeline-02-build']);
  });

  it('handles missing team.md gracefully', async () => {
    vi.mocked(workspace.fs.readFile).mockRejectedValue(new Error('FileNotFound'));
    vi.mocked(workspace.fs.readDirectory).mockRejectedValue(new Error('FileNotFound'));

    const squad = await loadSquadFromPath('/projects/empty');
    expect(squad.name).toBe('empty');
    expect(squad.agents).toEqual([]);
    expect(squad.decisions).toEqual([]);
    expect(squad.skills).toEqual([]);
  });

  it('uses folder name as squad name when Project Context is absent', async () => {
    const bareTeam = `## Members
| Name | Role | Charter | Status |
|------|------|---------|--------|
| Solo | Builder | — | Active |
`;
    vi.mocked(workspace.fs.readFile)
      .mockResolvedValueOnce(encode(bareTeam))       // team.md
      .mockRejectedValueOnce(new Error('Not found')) // config.json
      .mockRejectedValueOnce(new Error('Not found')); // decisions.md
    vi.mocked(workspace.fs.stat).mockRejectedValue(new Error('Not found'));
    vi.mocked(workspace.fs.readDirectory).mockRejectedValue(new Error('Not found'));

    const squad = await loadSquadFromPath('/projects/my-project');
    expect(squad.name).toBe('my-project');
    expect(squad.agents).toHaveLength(1);
  });
});
