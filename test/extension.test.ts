import { describe, it, expect, beforeEach, vi } from 'vitest';
import { activate, deactivate } from '../src/extension';
import { commands, window } from './__mocks__/vscode';

describe('Extension module exports', () => {
  it('exports activate as a function', () => {
    expect(typeof activate).toBe('function');
  });

  it('exports deactivate as a function', () => {
    expect(typeof deactivate).toBe('function');
  });
});

describe('activate()', () => {
  let context: { subscriptions: { dispose: () => void }[] };

  beforeEach(() => {
    vi.clearAllMocks();
    context = { subscriptions: [] };
  });

  it('creates an output channel named Watchtower', () => {
    activate(context as any);
    expect(window.createOutputChannel).toHaveBeenCalledWith('Watchtower');
  });

  it('registers all eight commands', () => {
    activate(context as any);
    expect(commands.registerCommand).toHaveBeenCalledTimes(8);
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.openGraph',
      expect.any(Function)
    );
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.openMissionControl',
      expect.any(Function)
    );
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.refreshAgents',
      expect.any(Function)
    );
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.openCharter',
      expect.any(Function)
    );
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.refreshAll',
      expect.any(Function)
    );
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.scanSquads',
      expect.any(Function)
    );
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.openDecisions',
      expect.any(Function)
    );
    expect(commands.registerCommand).toHaveBeenCalledWith(
      'watchtower.focusAgents',
      expect.any(Function)
    );
  });

  it('pushes disposables to context.subscriptions', () => {
    activate(context as any);
    // 1 output channel + 1 service registry + 3 tree views + 1 status bar + 1 squad watcher + 8 commands = 15 disposables
    expect(context.subscriptions.length).toBe(15);
  });
});

describe('deactivate()', () => {
  it('runs without throwing', () => {
    expect(() => deactivate()).not.toThrow();
  });
});
