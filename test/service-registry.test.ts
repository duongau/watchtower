import { describe, it, expect } from 'vitest';
import { ServiceRegistry } from '../src/services/service-registry';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeService(name: string, disposed: string[]) {
  return {
    name,
    dispose: () => { disposed.push(name); },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ServiceRegistry', () => {
  it('registers and retrieves a service', () => {
    const registry = new ServiceRegistry();
    const svc = makeService('alpha', []);
    registry.register('alpha', svc);

    expect(registry.get('alpha')).toBe(svc);
  });

  it('returns undefined for unregistered service', () => {
    const registry = new ServiceRegistry();
    expect(registry.get('nope')).toBeUndefined();
  });

  it('throws on duplicate registration', () => {
    const registry = new ServiceRegistry();
    registry.register('dup', makeService('dup', []));

    expect(() => registry.register('dup', makeService('dup', []))).toThrow(
      'ServiceRegistry: "dup" is already registered',
    );
  });

  it('disposes services in reverse registration order', () => {
    const order: string[] = [];
    const registry = new ServiceRegistry();

    registry.register('first', makeService('first', order));
    registry.register('second', makeService('second', order));
    registry.register('third', makeService('third', order));

    registry.dispose();

    expect(order).toEqual(['third', 'second', 'first']);
  });

  it('clears services after dispose', () => {
    const registry = new ServiceRegistry();
    registry.register('svc', makeService('svc', []));

    registry.dispose();

    expect(registry.get('svc')).toBeUndefined();
  });

  it('returns the registered service for inline use', () => {
    const registry = new ServiceRegistry();
    const svc = makeService('inline', []);
    const returned = registry.register('inline', svc);

    expect(returned).toBe(svc);
  });
});
