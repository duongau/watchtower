import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GraphPanelProvider } from '../src/providers/GraphPanelProvider';
import { window, mockPanel, mockWebview } from './__mocks__/vscode';

// Reset the singleton between tests by accessing the private static field
function resetSingleton() {
  (GraphPanelProvider as any).instance = undefined;
}

function makeContext() {
  return {
    subscriptions: [] as { dispose: () => void }[],
    extensionUri: { fsPath: '/ext', scheme: 'file' },
  };
}

function makeOutputChannel() {
  return window.createOutputChannel('Watchtower');
}

describe('GraphPanelProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSingleton();
    // Reset the html so we can assert fresh writes
    mockWebview.html = '';
  });

  describe('createOrShow()', () => {
    it('creates a webview panel on first call', () => {
      const ctx = makeContext();
      const out = makeOutputChannel();

      GraphPanelProvider.createOrShow(ctx as any, out as any);

      expect(window.createWebviewPanel).toHaveBeenCalledTimes(1);
      expect(window.createWebviewPanel).toHaveBeenCalledWith(
        'watchtower.graph',
        'Agent Graph',
        1, // ViewColumn.One
        expect.objectContaining({
          enableScripts: true,
          retainContextWhenHidden: true,
        }),
      );
    });

    it('returns the same provider on second call (singleton)', () => {
      const ctx = makeContext();
      const out = makeOutputChannel();

      const first = GraphPanelProvider.createOrShow(ctx as any, out as any);
      const second = GraphPanelProvider.createOrShow(ctx as any, out as any);

      expect(first).toBe(second);
      // Panel was created once, then revealed
      expect(window.createWebviewPanel).toHaveBeenCalledTimes(1);
      expect(mockPanel.reveal).toHaveBeenCalledTimes(1);
    });

    it('sets enableScripts and retainContextWhenHidden in panel options', () => {
      const ctx = makeContext();
      const out = makeOutputChannel();

      GraphPanelProvider.createOrShow(ctx as any, out as any);

      const options = window.createWebviewPanel.mock.calls[0][3];
      expect(options.enableScripts).toBe(true);
      expect(options.retainContextWhenHidden).toBe(true);
    });

    it('sets webview HTML content', () => {
      const ctx = makeContext();
      const out = makeOutputChannel();

      GraphPanelProvider.createOrShow(ctx as any, out as any);

      expect(mockWebview.html).toContain('<!DOCTYPE html>');
      expect(mockWebview.html).toContain('<div id="root">');
    });
  });

  describe('dispose()', () => {
    it('disposes the panel and clears the singleton', () => {
      const ctx = makeContext();
      const out = makeOutputChannel();

      const provider = GraphPanelProvider.createOrShow(ctx as any, out as any);

      // Simulate the onDidDispose callback firing when panel.dispose() is called
      const onDidDisposeCb = mockPanel.onDidDispose.mock.calls[0][0];
      provider.dispose();

      // panel.dispose() was called
      expect(mockPanel.dispose).toHaveBeenCalled();

      // Trigger the dispose callback (simulates VS Code behavior)
      onDidDisposeCb();

      // After disposal, createOrShow should create a fresh panel
      vi.clearAllMocks();
      mockWebview.html = '';
      GraphPanelProvider.createOrShow(ctx as any, out as any);
      expect(window.createWebviewPanel).toHaveBeenCalledTimes(1);
    });
  });

  describe('viewType', () => {
    it('has the expected static viewType', () => {
      expect(GraphPanelProvider.viewType).toBe('watchtower.graph');
    });
  });

  describe('command registration', () => {
    it('watchtower.openGraph command is registered in activate', async () => {
      // Import and call activate to check command registration
      const { activate } = await import('../src/extension');
      const { commands } = await import('./__mocks__/vscode');

      const ctx = makeContext();
      activate(ctx as any);

      const registeredCommands = commands.registerCommand.mock.calls.map(
        (call: any[]) => call[0],
      );
      expect(registeredCommands).toContain('watchtower.openGraph');
    });
  });
});
