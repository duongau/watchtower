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

import { AgentTreeProvider } from '../src/providers/AgentTreeProvider';
import { GraphService } from '../src/services/graph-service';
import type { ParsedSquad } from '../src/types/index';

function makeSquad(overrides: Partial<ParsedSquad> = {}): ParsedSquad {
  return {
    name: 'watchtower',
    path: '/projects/watchtower',
    agents: [
      { name: 'Tobirama', role: 'Extension Dev', status: 'active', model: 'claude-4' },
      { name: 'Hashirama', role: 'Webview Dev', status: 'idle', model: 'gpt-4o' },
    ],
    decisions: [],
    skills: [],
    ...overrides,
  };
}

describe('AgentTreeProvider', () => {
  let provider: AgentTreeProvider;
  let graphService: GraphService;

  beforeEach(() => {
    vi.clearAllMocks();
    const outputChannel = { appendLine: vi.fn(), show: vi.fn(), dispose: vi.fn() } as any;
    graphService = new GraphService(outputChannel);
    provider = new AgentTreeProvider(graphService);
  });

  it('returns squad items at root level', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const children = await provider.getChildren();

    expect(children).toHaveLength(1);
    expect(children[0].label).toBe('watchtower');
    expect(children[0].contextValue).toBe('squad');
  });

  it('returns agent items under a squad', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const squads = await provider.getChildren();
    const agents = await provider.getChildren(squads[0]);

    expect(agents).toHaveLength(2);
    expect(agents[0].label).toBe('Tobirama');
    expect(agents[0].contextValue).toBe('agent');
    expect(agents[0].description).toBe('Extension Dev');
  });

  it('shows correct agent count in squad description', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const squads = await provider.getChildren();

    expect(squads[0].description).toBe('2 agents');
  });

  it('uses singular for single agent', async () => {
    mockGetSquads.mockResolvedValue([
      makeSquad({ agents: [{ name: 'Solo', role: 'Dev', status: 'active' }] }),
    ]);
    const squads = await provider.getChildren();

    expect(squads[0].description).toBe('1 agent');
  });

  it('returns empty array for leaf agent items', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const squads = await provider.getChildren();
    const agents = await provider.getChildren(squads[0]);
    const leaves = await provider.getChildren(agents[0]);

    expect(leaves).toHaveLength(0);
  });

  it('returns multiple squads', async () => {
    mockGetSquads.mockResolvedValue([
      makeSquad({ name: 'alpha' }),
      makeSquad({ name: 'beta' }),
    ]);
    const squads = await provider.getChildren();

    expect(squads).toHaveLength(2);
    expect(squads[0].label).toBe('alpha');
    expect(squads[1].label).toBe('beta');
  });

  it('returns empty array when no squads', async () => {
    mockGetSquads.mockResolvedValue([]);
    const squads = await provider.getChildren();

    expect(squads).toHaveLength(0);
  });

  it('getTreeItem returns the element unchanged', async () => {
    mockGetSquads.mockResolvedValue([makeSquad()]);
    const squads = await provider.getChildren();
    const item = provider.getTreeItem(squads[0]);

    expect(item).toBe(squads[0]);
  });

  it('agent with charterPath has openCharter command', async () => {
    mockGetSquads.mockResolvedValue([
      makeSquad({
        agents: [
          { name: 'Tobirama', role: 'Dev', status: 'active', charterPath: '/path/charter.md' },
        ],
      }),
    ]);
    const squads = await provider.getChildren();
    const agents = await provider.getChildren(squads[0]);

    expect(agents[0].command?.command).toBe('watchtower.openCharter');
    expect(agents[0].command?.arguments).toEqual(['/path/charter.md']);
  });

  it('refresh fires onDidChangeTreeData', () => {
    // Access internal emitter via the event
    const handler = vi.fn();
    provider.onDidChangeTreeData(handler);
    provider.refresh();

    // EventEmitter is mocked — just verify it doesn't throw
    expect(() => provider.refresh()).not.toThrow();
  });
});
