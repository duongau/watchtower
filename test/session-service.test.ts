import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionService } from '../src/services/session-service';
import { workspace, FileType, Uri } from 'vscode';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockOutputChannel = {
  appendLine: vi.fn(),
  show: vi.fn(),
  dispose: vi.fn(),
};

function createService(): SessionService {
  return new SessionService(mockOutputChannel as unknown as import('vscode').OutputChannel);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listSessions', () => {
    it('returns empty array for empty squad paths', async () => {
      const service = createService();
      const sessions = await service.listSessions([]);
      expect(sessions).toEqual([]);
    });

    it('returns empty when log directories do not exist', async () => {
      vi.mocked(workspace.fs.readDirectory).mockRejectedValue(new Error('NotFound'));

      const service = createService();
      const sessions = await service.listSessions(['/projects/watchtower']);
      expect(sessions).toEqual([]);
    });

    it('parses ISO-timestamp session files from .squad/log/', async () => {
      vi.mocked(workspace.fs.readDirectory).mockImplementation(
        async (uri: { fsPath: string }) => {
          if (uri.fsPath.includes('/log')) {
            return [
              ['2026-04-26T14-00-00Z-hiruzen-sidebar-design.md', FileType.File],
              ['2026-04-25T10-30-00Z-minato-code-review.md', FileType.File],
            ] as [string, number][];
          }
          throw new Error('NotFound');
        },
      );

      const service = createService();
      const sessions = await service.listSessions(['/projects/watchtower']);

      expect(sessions).toHaveLength(2);

      // Sorted newest first
      expect(sessions[0].agent).toBe('hiruzen');
      expect(sessions[0].title).toBe('sidebar design');
      expect(sessions[0].timestamp).toBe('2026-04-26T14:00:00Z');

      expect(sessions[1].agent).toBe('minato');
      expect(sessions[1].title).toBe('code review');
      expect(sessions[1].timestamp).toBe('2026-04-25T10:30:00Z');
    });

    it('parses sessions from both log/ and orchestration-log/', async () => {
      vi.mocked(workspace.fs.readDirectory).mockImplementation(
        async (uri: { fsPath: string }) => {
          if (uri.fsPath.includes('orchestration-log')) {
            return [
              ['2026-04-26T16-00-00Z-coordinator-deploy.md', FileType.File],
            ] as [string, number][];
          }
          if (uri.fsPath.includes('/log')) {
            return [
              ['2026-04-26T14-00-00Z-tsunade-data-layer.md', FileType.File],
            ] as [string, number][];
          }
          throw new Error('NotFound');
        },
      );

      const service = createService();
      const sessions = await service.listSessions(['/projects/watchtower']);

      expect(sessions).toHaveLength(2);
      // orchestration-log entry is newer
      expect(sessions[0].agent).toBe('coordinator');
      expect(sessions[1].agent).toBe('tsunade');
    });

    it('skips non-.md files', async () => {
      vi.mocked(workspace.fs.readDirectory).mockImplementation(
        async (uri: { fsPath: string }) => {
          if (uri.fsPath.includes('/log')) {
            return [
              ['2026-04-26T14-00-00Z-hiruzen-work.md', FileType.File],
              ['README.txt', FileType.File],
              ['subfolder', FileType.Directory],
            ] as [string, number][];
          }
          throw new Error('NotFound');
        },
      );

      const service = createService();
      const sessions = await service.listSessions(['/projects/watchtower']);

      expect(sessions).toHaveLength(1);
    });

    it('handles date-only filenames', async () => {
      vi.mocked(workspace.fs.readDirectory).mockImplementation(
        async (uri: { fsPath: string }) => {
          if (uri.fsPath.includes('/log')) {
            return [
              ['session-2026-04-26.md', FileType.File],
            ] as [string, number][];
          }
          throw new Error('NotFound');
        },
      );

      const service = createService();
      const sessions = await service.listSessions(['/projects/watchtower']);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].timestamp).toBe('2026-04-26');
    });

    it('aggregates sessions across multiple squads', async () => {
      vi.mocked(workspace.fs.readDirectory).mockImplementation(
        async (uri: { fsPath: string }) => {
          if (uri.fsPath.includes('/log')) {
            return [
              ['2026-04-26T12-00-00Z-agent-task.md', FileType.File],
            ] as [string, number][];
          }
          throw new Error('NotFound');
        },
      );

      const service = createService();
      const sessions = await service.listSessions([
        '/projects/alpha',
        '/projects/beta',
      ]);

      // Each squad contributes 1 session from log/ (orchestration-log fails)
      expect(sessions).toHaveLength(2);
    });
  });

  describe('getSession', () => {
    it('reads session file content', async () => {
      const content = '# Session Log\n\nSome content here.';
      vi.mocked(workspace.fs.readFile).mockResolvedValueOnce(
        new TextEncoder().encode(content),
      );

      const service = createService();
      const result = await service.getSession('/projects/watchtower/.squad/log/session.md');

      expect(result).toBe(content);
    });
  });

  describe('dispose', () => {
    it('is safe to call', () => {
      const service = createService();
      expect(() => service.dispose()).not.toThrow();
    });
  });
});
