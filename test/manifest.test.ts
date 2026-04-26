import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8')
);

describe('Package manifest — basic fields', () => {
  it('main points to ./dist/extension.js', () => {
    expect(pkg.main).toBe('./dist/extension.js');
  });

  it('engines.vscode is set', () => {
    expect(pkg.engines?.vscode).toBeDefined();
    expect(typeof pkg.engines.vscode).toBe('string');
  });
});

describe('Package manifest — commands', () => {
  const commands: { command: string; title: string }[] =
    pkg.contributes?.commands ?? [];

  it('has at least one command', () => {
    expect(commands.length).toBeGreaterThan(0);
  });

  it('every command has command and title fields', () => {
    for (const cmd of commands) {
      expect(cmd).toHaveProperty('command');
      expect(cmd).toHaveProperty('title');
      expect(typeof cmd.command).toBe('string');
      expect(typeof cmd.title).toBe('string');
    }
  });

  it('every command ID starts with watchtower.', () => {
    for (const cmd of commands) {
      expect(cmd.command).toMatch(/^watchtower\./);
    }
  });
});

describe('Package manifest — views', () => {
  it('activitybar has the watchtower container', () => {
    const activitybar = pkg.contributes?.viewsContainers?.activitybar;
    expect(activitybar).toBeDefined();
    const ids = activitybar.map((c: { id: string }) => c.id);
    expect(ids).toContain('watchtower');
  });

  it('watchtower view container has agents, sessions, and skills views', () => {
    const views = pkg.contributes?.views?.watchtower;
    expect(views).toBeDefined();
    const viewIds = views.map((v: { id: string }) => v.id);
    expect(viewIds).toContain('watchtower.agents');
    expect(viewIds).toContain('watchtower.sessions');
    expect(viewIds).toContain('watchtower.skills');
  });
});

describe('Package manifest — activation events', () => {
  const activationEvents: string[] = pkg.activationEvents ?? [];

  it('has activation events defined', () => {
    expect(activationEvents.length).toBeGreaterThan(0);
  });

  it('onCommand events reference valid command IDs', () => {
    const commandIds = (pkg.contributes?.commands ?? []).map(
      (c: { command: string }) => c.command
    );
    const viewIds = (pkg.contributes?.views?.watchtower ?? []).map(
      (v: { id: string }) => v.id
    );

    for (const event of activationEvents) {
      if (event.startsWith('onCommand:')) {
        const cmdId = event.replace('onCommand:', '');
        expect(commandIds).toContain(cmdId);
      }
      if (event.startsWith('onView:')) {
        const viewId = event.replace('onView:', '');
        expect(viewIds).toContain(viewId);
      }
    }
  });
});
