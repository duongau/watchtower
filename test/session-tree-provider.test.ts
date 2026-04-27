import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock vscode before importing the provider
vi.mock('vscode', () => import('./__mocks__/vscode'));

// Mock services
const mockListSessions = vi.fn();
const mockGetSquads = vi.fn();

vi.mock('../src/services/session-service', () => ({
  SessionService: vi.fn().mockImplementation(() => ({
    listSessions: mockListSessions,
    dispose: vi.fn(),
  })),
}));

vi.mock('../src/services/graph-service', () => ({
  GraphService: vi.fn().mockImplementation(() => ({
    getSquads: mockGetSquads,
    dispose: vi.fn(),
  })),
}));

import { SessionTreeProvider } from '../src/providers/SessionTreeProvider';
import { SessionService } from '../src/services/session-service';
import { GraphService } from '../src/services/graph-service';
import type { Session } from '../src/types/index';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'test-session',
    timestamp: '2026-04-26T14:00:00Z',
    agent: 'tobirama',
    title: 'tree views',
    path: '/projects/watchtower/.squad/log/2026-04-26T14-00-00Z-tobirama-tree-views.md',
    ...overrides,
  };
}

describe('SessionTreeProvider', () => {
  let provider: SessionTreeProvider;
  let sessionService: SessionService;
  let graphService: GraphService;

  beforeEach(() => {
    vi.clearAllMocks();
    const outputChannel = { appendLine: vi.fn(), show: vi.fn(), dispose: vi.fn() } as any;
    sessionService = new SessionService(outputChannel);
    graphService = new GraphService(outputChannel);
    provider = new SessionTreeProvider(sessionService, graphService);
    mockGetSquads.mockResolvedValue([{ name: 'watchtower', path: '/projects/watchtower', agents: [] }]);
  });

  it('returns session items', async () => {
    mockListSessions.mockResolvedValue([makeSession()]);
    const children = await provider.getChildren();

    expect(children).toHaveLength(1);
    expect(children[0].label).toBe('tobirama — tree views');
    expect(children[0].contextValue).toBe('session');
  });

  it('limits to 20 sessions', async () => {
    const sessions = Array.from({ length: 30 }, (_, i) =>
      makeSession({ id: `session-${i}`, agent: `agent-${i}` }),
    );
    mockListSessions.mockResolvedValue(sessions);
    const children = await provider.getChildren();

    expect(children).toHaveLength(20);
  });

  it('returns empty when no sessions', async () => {
    mockListSessions.mockResolvedValue([]);
    const children = await provider.getChildren();

    expect(children).toHaveLength(0);
  });

  it('session item has vscode.open command', async () => {
    mockListSessions.mockResolvedValue([makeSession()]);
    const children = await provider.getChildren();

    expect(children[0].command?.command).toBe('vscode.open');
  });

  it('getTreeItem returns the element', async () => {
    mockListSessions.mockResolvedValue([makeSession()]);
    const children = await provider.getChildren();
    const item = provider.getTreeItem(children[0]);

    expect(item).toBe(children[0]);
  });

  it('refresh does not throw', () => {
    expect(() => provider.refresh()).not.toThrow();
  });

  it('passes squad paths to sessionService.listSessions', async () => {
    mockListSessions.mockResolvedValue([]);
    await provider.getChildren();

    expect(mockListSessions).toHaveBeenCalledWith(['/projects/watchtower']);
  });
});
