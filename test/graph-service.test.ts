import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphService } from '../src/services/graph-service';
import { workspace, FileType, Uri } from 'vscode';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockOutputChannel = {
  appendLine: vi.fn(),
  show: vi.fn(),
  dispose: vi.fn(),
};

function createService(): GraphService {
  return new GraphService(mockOutputChannel as unknown as import('vscode').OutputChannel);
}

/** Set up workspace to have one squad with a team.md */
function setupSingleSquad(): void {
  const folderUri = Uri.file('/projects/watchtower');
  (workspace as unknown as { workspaceFolders: unknown[] }).workspaceFolders = [
    { uri: folderUri, name: 'watchtower', index: 0 },
  ];

  // discoverSquads: stat .squad/ succeeds
  vi.mocked(workspace.fs.stat).mockResolvedValue({
    type: FileType.Directory,
    ctime: 0,
    mtime: 0,
    size: 0,
  });

  // loadSquadFromPath reads team.md
  const teamContent = `# Squad Watchtower
## Members
| Name | Role | Status |
|------|------|--------|
| Minato | Lead | Active |
| Tsunade | Data Engineer | Idle |

## Project Context
- **Project:** Watchtower — VS Code Extension
- **Source universe:** naruto-hokages
`;

  vi.mocked(workspace.fs.readFile).mockImplementation(async (uri: { fsPath: string }) => {
    if (uri.fsPath.endsWith('team.md')) {
      return new TextEncoder().encode(teamContent);
    }
    throw new Error('FileNotFound');
  });

  // readDirectory for skills/
  vi.mocked(workspace.fs.readDirectory).mockRejectedValue(new Error('NotFound'));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GraphService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty graph when no squads', async () => {
    (workspace as unknown as { workspaceFolders: undefined }).workspaceFolders = undefined;
    const service = createService();

    const { nodes, edges } = await service.loadGraph();
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it('loads graph from discovered squads', async () => {
    setupSingleSquad();
    const service = createService();

    const { nodes, edges } = await service.loadGraph();

    // 1 root + 2 agents = 3 nodes
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);

    const root = nodes.find((n) => n.type === 'root');
    expect(root).toBeDefined();
    expect(root!.data.label).toBe('Watchtower');
  });

  it('getSquads returns parsed squads', async () => {
    setupSingleSquad();
    const service = createService();

    const squads = await service.getSquads();
    expect(squads).toHaveLength(1);
    expect(squads[0].name).toBe('Watchtower');
    expect(squads[0].agents).toHaveLength(2);
  });

  it('getAgents returns agents with ids and squadPath', async () => {
    setupSingleSquad();
    const service = createService();

    const agents = await service.getAgents();
    expect(agents).toHaveLength(2);
    expect(agents[0].id).toBe('watchtower-minato');
    expect(agents[0].squadPath).toBe('/projects/watchtower');
    expect(agents[1].id).toBe('watchtower-tsunade');
  });

  it('getSquadList returns Squad[] shape', async () => {
    setupSingleSquad();
    const service = createService();

    const squads = await service.getSquadList();
    expect(squads).toHaveLength(1);
    expect(squads[0].name).toBe('Watchtower');
    expect(squads[0].agents[0]).toHaveProperty('id');
    expect(squads[0].agents[0]).toHaveProperty('squadPath');
  });

  it('loadSquadGraph builds graph for a specific path', async () => {
    setupSingleSquad();
    const service = createService();

    const { nodes, edges } = await service.loadSquadGraph('/projects/watchtower');
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);
  });

  it('dispose is safe to call', () => {
    const service = createService();
    expect(() => service.dispose()).not.toThrow();
  });
});
