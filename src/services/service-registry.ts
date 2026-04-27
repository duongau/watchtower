// ---------------------------------------------------------------------------
// Watchtower — Service Registry
// Lightweight service container with lifecycle management.
// Services are disposed in reverse registration order on shutdown.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';

export class ServiceRegistry implements vscode.Disposable {
  private readonly services = new Map<string, vscode.Disposable>();
  private readonly order: string[] = [];

  /** Register a named service. Returns the service for inline use. */
  register<T extends vscode.Disposable>(name: string, service: T): T {
    if (this.services.has(name)) {
      throw new Error(`ServiceRegistry: "${name}" is already registered`);
    }
    this.services.set(name, service);
    this.order.push(name);
    return service;
  }

  /** Retrieve a service by name. Returns undefined if not registered. */
  get<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /** Dispose all services in reverse registration order. */
  dispose(): void {
    for (let i = this.order.length - 1; i >= 0; i--) {
      const name = this.order[i];
      const service = this.services.get(name);
      service?.dispose();
    }
    this.services.clear();
    this.order.length = 0;
  }
}
