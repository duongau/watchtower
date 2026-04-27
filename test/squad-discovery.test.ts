import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverSquads } from '../src/services/squad-discovery';
import { workspace, FileType, Uri } from 'vscode';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('discoverSquads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no workspace folders', async () => {
    (workspace as { workspaceFolders: unknown[] | undefined }).workspaceFolders = undefined;
    const result = await discoverSquads();
    expect(result).toEqual([]);
  });

  it('returns empty array when workspace folders is empty', async () => {
    (workspace as { workspaceFolders: unknown[] }).workspaceFolders = [];
    const result = await discoverSquads();
    expect(result).toEqual([]);
  });

  it('discovers .squad/ in workspace folder', async () => {
    const folderUri = Uri.file('/projects/watchtower');
    (workspace as { workspaceFolders: unknown[] }).workspaceFolders = [
      { uri: folderUri, name: 'watchtower', index: 0 },
    ];

    vi.mocked(workspace.fs.stat).mockResolvedValueOnce({
      type: FileType.Directory,
      ctime: 0,
      mtime: 0,
      size: 0,
    });

    const result = await discoverSquads();
    expect(result).toEqual([folderUri.fsPath]);
  });

  it('skips folders without .squad/ directory', async () => {
    const folderUri = Uri.file('/projects/no-squad');
    (workspace as { workspaceFolders: unknown[] }).workspaceFolders = [
      { uri: folderUri, name: 'no-squad', index: 0 },
    ];

    vi.mocked(workspace.fs.stat).mockRejectedValueOnce(
      new Error('FileNotFound'),
    );

    const result = await discoverSquads();
    expect(result).toEqual([]);
  });

  it('discovers multiple squads across workspace folders', async () => {
    const folder1 = Uri.file('/projects/alpha');
    const folder2 = Uri.file('/projects/beta');
    const folder3 = Uri.file('/projects/gamma');

    (workspace as { workspaceFolders: unknown[] }).workspaceFolders = [
      { uri: folder1, name: 'alpha', index: 0 },
      { uri: folder2, name: 'beta', index: 1 },
      { uri: folder3, name: 'gamma', index: 2 },
    ];

    // alpha has .squad/
    vi.mocked(workspace.fs.stat).mockResolvedValueOnce({
      type: FileType.Directory,
      ctime: 0,
      mtime: 0,
      size: 0,
    });
    // beta does not
    vi.mocked(workspace.fs.stat).mockRejectedValueOnce(
      new Error('FileNotFound'),
    );
    // gamma has .squad/
    vi.mocked(workspace.fs.stat).mockResolvedValueOnce({
      type: FileType.Directory,
      ctime: 0,
      mtime: 0,
      size: 0,
    });

    const result = await discoverSquads();
    expect(result).toEqual([folder1.fsPath, folder3.fsPath]);
  });
});
