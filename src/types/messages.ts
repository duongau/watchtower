// ---------------------------------------------------------------------------
// Watchtower — Message Protocol Types
// Shared by extension host (src/) and webview (src/webview/)
// ---------------------------------------------------------------------------
// Pattern: discriminated unions on `command` field
// Three message shapes: Request, Response, Push
// ---------------------------------------------------------------------------

import type { Agent, Squad } from './index.js';

// ---------------------------------------------------------------------------
// Base message shapes
// ---------------------------------------------------------------------------

/** Request message — webview → extension, expects a response */
export interface RequestMessage<C extends string = string, P = unknown> {
  command: C;
  requestId: string;
  payload?: P;
}

/** Response message — extension → webview, correlated to a request */
export interface ResponseMessage<C extends string = string, P = unknown> {
  command: C;
  requestId: string;
  payload?: P;
  error?: string;
}

/** Push message — extension → webview, no response expected */
export interface PushMessage<C extends string = string, P = unknown> {
  command: C;
  payload?: P;
}

// ---------------------------------------------------------------------------
// Webview → Extension (Requests & Commands)
// ---------------------------------------------------------------------------

export type WebviewToExtensionMessage =
  // Lifecycle
  | RequestMessage<'ready'>
  | RequestMessage<'refreshAll'>
  // Graph
  | RequestMessage<'graph:load'>
  // Agents
  | RequestMessage<'agent:list'>
  | RequestMessage<'agent:get', { agentId: string }>
  // Squads
  | RequestMessage<'squad:list'>
  // Capabilities
  | RequestMessage<'capabilities:get'>
  // Commands
  | RequestMessage<'command:execute', { commandId: string; args?: unknown[] }>
  // Navigation (webview telling extension to navigate)
  | RequestMessage<'openAgent', { agentId: string }>;

// ---------------------------------------------------------------------------
// Extension → Webview (Responses + Push notifications)
// ---------------------------------------------------------------------------

// -- Response types (correlated to requests via requestId) --

export type GraphLoadResponse = ResponseMessage<'graph:load', { nodes: unknown[]; edges: unknown[] }>;
export type AgentListResponse = ResponseMessage<'agent:list', { agents: Agent[] }>;
export type AgentGetResponse = ResponseMessage<'agent:get', { agent: Agent }>;
export type SquadListResponse = ResponseMessage<'squad:list', { squads: Squad[] }>;
export type CapabilitiesGetResponse = ResponseMessage<'capabilities:get', { capabilities: string[] }>;
export type CommandExecuteResponse = ResponseMessage<'command:execute', { result?: unknown }>;
export type GenericResponse = ResponseMessage<string, unknown>;

// -- Push notification types (no requestId) --

export type GraphUpdatePush = PushMessage<'graph:update', { nodes: unknown[]; edges: unknown[] }>;
export type AgentUpdatePush = PushMessage<'agent:update', { agent: Agent }>;
export type SquadUpdatePush = PushMessage<'squad:update', { squad: Squad }>;
export type ThemeChangedPush = PushMessage<'theme:changed', { kind: 'light' | 'dark' | 'highContrast' | 'highContrastLight' }>;
export type ErrorPush = PushMessage<'showError', { message: string }>;
export type NavigatePush = PushMessage<'navigate', { route: string }>;

// -- Discriminated union of ALL extension → webview messages --

export type ExtensionToWebviewMessage =
  // Responses
  | GraphLoadResponse
  | AgentListResponse
  | AgentGetResponse
  | SquadListResponse
  | CapabilitiesGetResponse
  | CommandExecuteResponse
  | GenericResponse
  // Push notifications
  | GraphUpdatePush
  | AgentUpdatePush
  | SquadUpdatePush
  | ThemeChangedPush
  | ErrorPush
  | NavigatePush;

// ---------------------------------------------------------------------------
// Handler types (used by bridges)
// ---------------------------------------------------------------------------

/** Extract the command string from a message union */
export type MessageCommand<T extends { command: string }> = T['command'];

/** Handler for a request — receives payload, returns response payload or throws */
export type RequestHandler<TReq = unknown, TRes = unknown> = (
  payload: TReq,
  requestId: string,
) => Promise<TRes> | TRes;

// ---------------------------------------------------------------------------
// Utility: type-safe command extraction
// ---------------------------------------------------------------------------

/** All command strings the webview can send */
export type WebviewCommand = WebviewToExtensionMessage['command'];

/** All command strings the extension can send */
export type ExtensionCommand = ExtensionToWebviewMessage['command'];
