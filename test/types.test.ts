import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  Agent,
  AgentStatus,
  Squad,
  BaseMessage,
  ExtensionToWebviewMessage,
  WebviewToExtensionMessage,
} from '../src/types/index';

describe('Agent interface', () => {
  it('accepts a valid agent object', () => {
    const agent: Agent = {
      id: 'kakashi-01',
      name: 'Kakashi',
      role: 'Tester',
      status: 'active',
      squadPath: '/projects/watchtower',
    };
    expect(agent.id).toBe('kakashi-01');
    expect(agent.name).toBe('Kakashi');
    expect(agent.role).toBe('Tester');
    expect(agent.status).toBe('active');
    expect(agent.squadPath).toBe('/projects/watchtower');
  });

  it('allows optional model field', () => {
    const agent: Agent = {
      id: 'a1',
      name: 'Test',
      role: 'Builder',
      status: 'idle',
      squadPath: '/p',
      model: 'gpt-4',
    };
    expect(agent.model).toBe('gpt-4');
  });
});

describe('AgentStatus union', () => {
  it('includes all expected values', () => {
    const statuses: AgentStatus[] = ['active', 'idle', 'error', 'offline'];
    expect(statuses).toHaveLength(4);
    expect(statuses).toContain('active');
    expect(statuses).toContain('idle');
    expect(statuses).toContain('error');
    expect(statuses).toContain('offline');
  });
});

describe('Squad interface', () => {
  it('accepts a valid squad object', () => {
    const squad: Squad = {
      name: 'Watchtower',
      path: '/projects/watchtower',
      agents: [],
    };
    expect(squad.name).toBe('Watchtower');
    expect(squad.path).toBe('/projects/watchtower');
    expect(squad.agents).toEqual([]);
  });

  it('allows optional universe field', () => {
    const squad: Squad = {
      name: 'Watchtower',
      path: '/p',
      agents: [],
      universe: 'naruto-hokages',
    };
    expect(squad.universe).toBe('naruto-hokages');
  });
});

describe('Message protocol types', () => {
  it('ExtensionToWebviewMessage has correct command discriminators', () => {
    const msgs: ExtensionToWebviewMessage[] = [
      { command: 'updateAgents', agents: [] },
      { command: 'updateSquads', squads: [] },
      { command: 'navigate', route: '/home' },
      { command: 'showError', message: 'oops' },
    ];
    const commands = msgs.map((m) => m.command);
    expect(commands).toEqual([
      'updateAgents',
      'updateSquads',
      'navigate',
      'showError',
    ]);
  });

  it('WebviewToExtensionMessage has correct command discriminators', () => {
    const msgs: WebviewToExtensionMessage[] = [
      { command: 'ready' },
      { command: 'requestAgents' },
      { command: 'requestSquads' },
      { command: 'openAgent', agentId: 'a1' },
      { command: 'refreshAll' },
    ];
    const commands = msgs.map((m) => m.command);
    expect(commands).toEqual([
      'ready',
      'requestAgents',
      'requestSquads',
      'openAgent',
      'refreshAll',
    ]);
  });

  it('BaseMessage requires a command string', () => {
    const msg: BaseMessage = { command: 'test' };
    expect(msg.command).toBe('test');
  });
});

describe('Compile-time type checks', () => {
  it('Agent has the correct shape', () => {
    expectTypeOf<Agent>().toHaveProperty('id');
    expectTypeOf<Agent>().toHaveProperty('name');
    expectTypeOf<Agent>().toHaveProperty('role');
    expectTypeOf<Agent>().toHaveProperty('status');
    expectTypeOf<Agent>().toHaveProperty('squadPath');
  });

  it('Squad has the correct shape', () => {
    expectTypeOf<Squad>().toHaveProperty('name');
    expectTypeOf<Squad>().toHaveProperty('path');
    expectTypeOf<Squad>().toHaveProperty('agents');
  });

  it('AgentStatus is a string union', () => {
    expectTypeOf<AgentStatus>().toBeString();
  });
});
