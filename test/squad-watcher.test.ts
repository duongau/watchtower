import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SquadWatcher } from '../src/services/squad-watcher';
import { workspace } from 'vscode';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockOutputChannel() {
  return {
    appendLine: vi.fn(),
    show: vi.fn(),
    dispose: vi.fn(),
  } as unknown as import('vscode').OutputChannel;
}

/**
 * Capture the event callbacks registered on a mock FileSystemWatcher.
 * Returns { onChange, onCreate, onDelete, dispose } for each watcher.
 */
interface MockWatcherCallbacks {
  onChange: ((uri: { fsPath: string }) => void) | undefined;
  onCreate: ((uri: { fsPath: string }) => void) | undefined;
  onDelete: ((uri: { fsPath: string }) => void) | undefined;
  dispose: ReturnType<typeof vi.fn>;
}

function captureWatcherCallbacks(): MockWatcherCallbacks[] {
  const watchers: MockWatcherCallbacks[] = [];
  vi.mocked(workspace.createFileSystemWatcher).mockImplementation(() => {
    const cbs: MockWatcherCallbacks = {
      onChange: undefined,
      onCreate: undefined,
      onDelete: undefined,
      dispose: vi.fn(),
    };
    watchers.push(cbs);
    return {
      onDidChange: vi.fn((cb: (uri: { fsPath: string }) => void) => {
        cbs.onChange = cb;
        return { dispose: vi.fn() };
      }),
      onDidCreate: vi.fn((cb: (uri: { fsPath: string }) => void) => {
        cbs.onCreate = cb;
        return { dispose: vi.fn() };
      }),
      onDidDelete: vi.fn((cb: (uri: { fsPath: string }) => void) => {
        cbs.onDelete = cb;
        return { dispose: vi.fn() };
      }),
      dispose: cbs.dispose,
    } as unknown as import('vscode').FileSystemWatcher;
  });
  return watchers;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SquadWatcher', () => {
  let outputChannel: import('vscode').OutputChannel;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    outputChannel = createMockOutputChannel();
    (workspace as { workspaceFolders: unknown[] }).workspaceFolders = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates watchers for all squad file patterns on start()', () => {
    captureWatcherCallbacks();
    const watcher = new SquadWatcher(outputChannel);
    watcher.start();

    // 8 watch patterns defined
    expect(workspace.createFileSystemWatcher).toHaveBeenCalledTimes(8);

    // Verify key patterns
    const calls = vi.mocked(workspace.createFileSystemWatcher).mock.calls.map((c) => c[0]);
    expect(calls).toContain('**/.squad/team.md');
    expect(calls).toContain('**/.squad/agents/*/charter.md');
    expect(calls).toContain('**/.squad/agents/*/history.md');
    expect(calls).toContain('**/.squad/decisions.md');
    expect(calls).toContain('**/.squad/decisions/inbox/*.md');
    expect(calls).toContain('**/.squad/skills/*/SKILL.md');
    expect(calls).toContain('**/.squad/config.json');
    expect(calls).toContain('**/.squad/routing.md');

    watcher.dispose();
  });

  it('logs workspace folder paths on start()', () => {
    captureWatcherCallbacks();
    (workspace as { workspaceFolders: unknown[] }).workspaceFolders = [
      { uri: { fsPath: '/projects/alpha' }, name: 'alpha', index: 0 },
    ];

    const watcher = new SquadWatcher(outputChannel);
    watcher.start();

    expect(outputChannel.appendLine).toHaveBeenCalledWith(
      '[SquadWatcher] Watching .squad/ in /projects/alpha',
    );

    watcher.dispose();
  });

  it('calls onChange callback after debounce period', () => {
    const watchers = captureWatcherCallbacks();
    const callback = vi.fn();
    const watcher = new SquadWatcher(outputChannel);
    watcher.onChange(callback);
    watcher.start();

    // Simulate a file change
    watchers[0].onChange?.({ fsPath: '/projects/alpha/.squad/team.md' });

    // Not called yet — still within debounce window
    expect(callback).not.toHaveBeenCalled();

    // Advance past debounce
    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);

    watcher.dispose();
  });

  it('debounces multiple rapid changes into single callback', () => {
    const watchers = captureWatcherCallbacks();
    const callback = vi.fn();
    const watcher = new SquadWatcher(outputChannel);
    watcher.onChange(callback);
    watcher.start();

    // Rapid fire changes within 300ms window
    watchers[0].onChange?.({ fsPath: '/a/.squad/team.md' });
    vi.advanceTimersByTime(100);

    watchers[1].onChange?.({ fsPath: '/a/.squad/agents/x/charter.md' });
    vi.advanceTimersByTime(100);

    watchers[2].onCreate?.({ fsPath: '/a/.squad/agents/y/history.md' });
    vi.advanceTimersByTime(100);

    // Should not have fired yet (only 300ms since last change)
    expect(callback).not.toHaveBeenCalled();

    // Advance past debounce from last event
    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledTimes(1);

    watcher.dispose();
  });

  it('handles onDidCreate and onDidDelete events', () => {
    const watchers = captureWatcherCallbacks();
    const callback = vi.fn();
    const watcher = new SquadWatcher(outputChannel);
    watcher.onChange(callback);
    watcher.start();

    // Create event
    watchers[0].onCreate?.({ fsPath: '/a/.squad/team.md' });
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);

    // Delete event
    watchers[1].onDelete?.({ fsPath: '/a/.squad/agents/z/charter.md' });
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(2);

    watcher.dispose();
  });

  it('logs file change before debounce', () => {
    const watchers = captureWatcherCallbacks();
    const watcher = new SquadWatcher(outputChannel);
    watcher.start();

    watchers[0].onChange?.({ fsPath: '/projects/alpha/.squad/team.md' });

    // Should have logged the file change immediately
    expect(outputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('File changed:'),
    );

    watcher.dispose();
  });

  it('logs "Rebuilding graph..." when debounce fires', () => {
    const watchers = captureWatcherCallbacks();
    const watcher = new SquadWatcher(outputChannel);
    watcher.onChange(vi.fn());
    watcher.start();

    watchers[0].onChange?.({ fsPath: '/a/.squad/team.md' });
    vi.advanceTimersByTime(300);

    expect(outputChannel.appendLine).toHaveBeenCalledWith(
      '[SquadWatcher] Rebuilding graph...',
    );

    watcher.dispose();
  });

  it('disposes all watchers on dispose()', () => {
    const watchers = captureWatcherCallbacks();
    const watcher = new SquadWatcher(outputChannel);
    watcher.start();

    watcher.dispose();

    for (const w of watchers) {
      expect(w.dispose).toHaveBeenCalled();
    }

    expect(outputChannel.appendLine).toHaveBeenCalledWith('[SquadWatcher] Disposed');
  });

  it('clears pending debounce timer on dispose()', () => {
    const watchers = captureWatcherCallbacks();
    const callback = vi.fn();
    const watcher = new SquadWatcher(outputChannel);
    watcher.onChange(callback);
    watcher.start();

    // Trigger a change but don't let debounce fire
    watchers[0].onChange?.({ fsPath: '/a/.squad/team.md' });

    // Dispose before debounce completes
    watcher.dispose();
    vi.advanceTimersByTime(500);

    // Callback should never have been called
    expect(callback).not.toHaveBeenCalled();
  });

  it('works without onChange callback registered', () => {
    const watchers = captureWatcherCallbacks();
    const watcher = new SquadWatcher(outputChannel);
    watcher.start();

    // File change without callback — should not throw
    watchers[0].onChange?.({ fsPath: '/a/.squad/team.md' });
    vi.advanceTimersByTime(300);

    // Just verify no error and logging happened
    expect(outputChannel.appendLine).toHaveBeenCalledWith(
      '[SquadWatcher] Rebuilding graph...',
    );

    watcher.dispose();
  });
});
