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

  it('registers all five commands', () => {
    activate(context as any);
    expect(commands.registerCommand).toHaveBeenCalledTimes(5);
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
  });

  it('pushes disposables to context.subscriptions', () => {
    activate(context as any);
    // 1 output channel + 1 service registry + 2 tree views + 1 status bar + 1 squad watcher + 5 commands = 11 disposables
    expect(context.subscriptions.length).toBe(11);
  });
});

describe('deactivate()', () => {
  it('runs without throwing', () => {
    expect(() => deactivate()).not.toThrow();
  });
});
