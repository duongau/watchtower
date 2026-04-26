// ---------------------------------------------------------------------------
// Watchtower — Shared Types
// Imported by both extension host (src/) and webview (src/webview/)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Message Protocol (extension ↔ webview)
// ---------------------------------------------------------------------------

/** Base message shape — every message has a command discriminator */
export interface BaseMessage {
  command: string;
}

/** Messages the extension host sends TO the webview */
export type ExtensionToWebviewMessage =
  | { command: 'updateAgents'; agents: Agent[] }
  | { command: 'updateSquads'; squads: Squad[] }
  | { command: 'navigate'; route: string }
  | { command: 'showError'; message: string };

/** Messages the webview sends TO the extension host */
export type WebviewToExtensionMessage =
  | { command: 'ready' }
  | { command: 'requestAgents' }
  | { command: 'requestSquads' }
  | { command: 'openAgent'; agentId: string }
  | { command: 'refreshAll' };

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export type AgentStatus = 'active' | 'idle' | 'error' | 'offline';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  model?: string;
  /** Absolute path to the squad this agent belongs to */
  squadPath: string;
}

// ---------------------------------------------------------------------------
// Squad
// ---------------------------------------------------------------------------

export interface Squad {
  /** Display name derived from .squad/ config or folder name */
  name: string;
  /** Absolute path to the project root containing .squad/ */
  path: string;
  /** Agents discovered in this squad */
  agents: Agent[];
  /** Thematic universe (e.g. "naruto-hokages") */
  universe?: string;
}
