import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock vscode before importing the provider
vi.mock('vscode', () => import('./__mocks__/vscode'));

import { StatusBarProvider } from '../src/providers/StatusBarProvider';
import { window } from './__mocks__/vscode';
import type { ParsedSquad } from '../src/types/index';

function makeSquad(overrides: Partial<ParsedSquad> = {}): ParsedSquad {
  return {
    name: 'watchtower',
    path: '/projects/watchtower',
    agents: [
      { name: 'Tobirama', role: 'Extension Dev', status: 'active' },
      { name: 'Hashirama', role: 'Webview Dev', status: 'idle' },
      { name: 'Minato', role: 'Lead', status: 'active' },
    ],
    decisions: [],
    skills: [],
    ...overrides,
  };
}

describe('StatusBarProvider', () => {
  let provider: StatusBarProvider;
  let squadItem: any;
  let agentItem: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Capture status bar items as they're created
    let callCount = 0;
    (window.createStatusBarItem as any).mockImplementation(() => {
      callCount++;
      const item = {
        text: '',
        tooltip: '',
        command: undefined,
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn(),
      };
      if (callCount === 1) { squadItem = item; }
      if (callCount === 2) { agentItem = item; }
      return item;
    });

    provider = new StatusBarProvider();
  });

  it('creates two status bar items', () => {
    expect(window.createStatusBarItem).toHaveBeenCalledTimes(2);
  });

  it('shows squad count text', () => {
    provider.update([makeSquad()]);

    expect(squadItem.text).toBe('$(telescope) 1 squad');
  });

  it('shows plural squads', () => {
    provider.update([makeSquad({ name: 'alpha' }), makeSquad({ name: 'beta' })]);

    expect(squadItem.text).toBe('$(telescope) 2 squads');
  });

  it('shows active agent count', () => {
    provider.update([makeSquad()]);

    expect(agentItem.text).toBe('$(person) 2 active');
  });

  it('shows total agents in tooltip', () => {
    provider.update([makeSquad()]);

    expect(agentItem.tooltip).toContain('3 agents total');
  });

  it('sets squad item command to openGraph', () => {
    provider.update([makeSquad()]);

    expect(squadItem.command).toBe('watchtower.openGraph');
  });

  it('shows both items', () => {
    provider.update([makeSquad()]);

    expect(squadItem.show).toHaveBeenCalled();
    expect(agentItem.show).toHaveBeenCalled();
  });

  it('handles zero squads', () => {
    provider.update([]);

    expect(squadItem.text).toBe('$(telescope) 0 squads');
    expect(agentItem.text).toBe('$(person) 0 active');
  });

  it('dispose disposes both items', () => {
    provider.dispose();

    expect(squadItem.dispose).toHaveBeenCalled();
    expect(agentItem.dispose).toHaveBeenCalled();
  });

  it('counts active agents across multiple squads', () => {
    provider.update([
      makeSquad({
        name: 'alpha',
        agents: [
          { name: 'A', role: 'Dev', status: 'active' },
        ],
      }),
      makeSquad({
        name: 'beta',
        agents: [
          { name: 'B', role: 'Dev', status: 'active' },
          { name: 'C', role: 'Dev', status: 'offline' },
        ],
      }),
    ]);

    expect(agentItem.text).toBe('$(person) 2 active');
    expect(agentItem.tooltip).toContain('3 agents total');
  });
});
