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

// Re-export service types needed by both sides
export type { Session } from '../services/session-service.js';

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

// ---------------------------------------------------------------------------
// Parsed types — output of squad parsers (src/services/squad-parser.ts)
// ---------------------------------------------------------------------------

export interface ParsedAgent {
  name: string;
  role: string;
  status: AgentStatus;
  model?: string;
  charterPath?: string;
}

export interface ParsedDecision {
  timestamp: string;
  title: string;
  by: string;
  summary: string;
}

export interface ParsedSquad {
  /** Display name derived from team.md or folder name */
  name: string;
  /** Absolute path to the project root containing .squad/ */
  path: string;
  /** Thematic universe from team.md Project Context */
  universe?: string;
  /** Agents parsed from team.md Members table */
  agents: ParsedAgent[];
  /** Decisions parsed from decisions.md */
  decisions: ParsedDecision[];
  /** Skill directory names from .squad/skills/ */
  skills: string[];
}
