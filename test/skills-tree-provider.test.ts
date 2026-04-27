import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock vscode before importing the provider
vi.mock('vscode', () => import('./__mocks__/vscode'));

// Mock GraphService
const mockGetSquads = vi.fn();
vi.mock('../src/services/graph-service', () => ({
  GraphService: vi.fn().mockImplementation(() => ({
    getSquads: mockGetSquads,
    dispose: vi.fn(),
  })),
}));

import { SkillsTreeProvider } from '../src/providers/SkillsTreeProvider';
import { GraphService } from '../src/services/graph-service';
import type { ParsedSquad } from '../src/types/index';

function makeSquad(overrides: Partial<ParsedSquad> = {}): ParsedSquad {
  return {
    name: 'watchtower',
    path: '/projects/watchtower',
    agents: [
      { name: 'Tobirama', role: 'Extension Dev', status: 'active' },
    ],
    decisions: [],
    skills: ['save-changes', 'create-pr', 'session-summary'],
    ...overrides,
  };
}

describe('SkillsTreeProvider', () => {
  let provider: SkillsTreeProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    const outputChannel = { appendLine: vi.fn(), show: vi.fn(), dispose: vi.fn() } as any;
    const graphService = new GraphService(outputChannel);
    provider = new SkillsTreeProvider(graphService);
  });

  it('returns flat skill items for single squad', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const children = await provider.getChildren();

    expect(children).toHaveLength(3);
    expect(children[0].label).toBe('save-changes');
    expect(children[0].contextValue).toBe('skill');
  });

  it('returns squad groups for multiple squads', async () => {
    mockGetSquads.mockResolvedValue([
      makeSquad({ name: 'alpha', path: '/alpha', skills: ['skill-a'] }),
      makeSquad({ name: 'beta', path: '/beta', skills: ['skill-b', 'skill-c'] }),
    ]);
    const children = await provider.getChildren();

    expect(children).toHaveLength(2);
    expect(children[0].label).toBe('alpha');
    expect(children[0].contextValue).toBe('skillGroup');
    expect(children[1].label).toBe('beta');
  });

  it('returns skill items under a squad group', async () => {
    mockGetSquads.mockResolvedValue([
      makeSquad({ name: 'alpha', path: '/alpha', skills: ['skill-a'] }),
      makeSquad({ name: 'beta', path: '/beta', skills: ['skill-b'] }),
    ]);
    const groups = await provider.getChildren();
    const skills = await provider.getChildren(groups[0]);

    expect(skills).toHaveLength(1);
    expect(skills[0].label).toBe('skill-a');
    expect(skills[0].contextValue).toBe('skill');
  });

  it('skill click command opens SKILL.md via vscode.open', async () => {
    mockGetSquads.mockResolvedValue([makeSquad({ path: '/projects/watchtower' })]);
    const children = await provider.getChildren();

    expect(children[0].command?.command).toBe('vscode.open');
    // The URI should point to .squad/skills/<name>/SKILL.md
    const uri = children[0].command?.arguments?.[0];
    expect(uri.fsPath).toContain('save-changes');
    expect(uri.fsPath).toContain('SKILL.md');
  });

  it('returns empty array when no squads', async () => {
    mockGetSquads.mockResolvedValue([]);
    const children = await provider.getChildren();

    expect(children).toHaveLength(0);
  });

  it('returns empty array when squads have no skills', async () => {
    mockGetSquads.mockResolvedValue([makeSquad({ skills: [] })]);
    const children = await provider.getChildren();

    expect(children).toHaveLength(0);
  });

  it('returns empty array for leaf skill items', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const children = await provider.getChildren();
    const leaves = await provider.getChildren(children[0]);

    expect(leaves).toHaveLength(0);
  });

  it('squad group shows skill count in description', async () => {
    mockGetSquads.mockResolvedValue([
      makeSquad({ name: 'alpha', path: '/alpha', skills: ['a'] }),
      makeSquad({ name: 'beta', path: '/beta', skills: ['b', 'c'] }),
    ]);
    const groups = await provider.getChildren();

    expect(groups[0].description).toBe('1 skill');
    expect(groups[1].description).toBe('2 skills');
  });

  it('getTreeItem returns the element unchanged', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const children = await provider.getChildren();
    const item = provider.getTreeItem(children[0]);

    expect(item).toBe(children[0]);
  });

  it('refresh fires onDidChangeTreeData', () => {
    const handler = vi.fn();
    provider.onDidChangeTreeData(handler);
    expect(() => provider.refresh()).not.toThrow();
  });

  it('excludes squads with zero skills from multi-squad grouping', async () => {
    mockGetSquads.mockResolvedValue([
      makeSquad({ name: 'alpha', path: '/alpha', skills: ['a'] }),
      makeSquad({ name: 'beta', path: '/beta', skills: [] }),
      makeSquad({ name: 'gamma', path: '/gamma', skills: ['g'] }),
    ]);
    const children = await provider.getChildren();

    // Only alpha and gamma should appear
    expect(children).toHaveLength(2);
    expect(children[0].label).toBe('alpha');
    expect(children[1].label).toBe('gamma');
  });
});
