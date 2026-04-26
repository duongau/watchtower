// ---------------------------------------------------------------------------
// Watchtower — Shared Types
// Imported by both extension host (src/) and webview (src/webview/)
// ---------------------------------------------------------------------------

// Re-export message protocol types
export type {
  RequestMessage,
  ResponseMessage,
  PushMessage,
  WebviewToExtensionMessage,
  ExtensionToWebviewMessage,
  WebviewCommand,
  ExtensionCommand,
  RequestHandler,
} from './messages.js';

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
