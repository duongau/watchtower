import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AgentStatus } from '../../types/index.js';
import './AgentNode.css';

export interface AgentNodeData {
  name: string;
  role: string;
  status: AgentStatus;
  model?: string;
  initials?: string;
  avatarColor?: string;
  [key: string]: unknown;
}

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as AgentNodeData;

  const statusClass =
    d.status === 'active'
      ? 'agent-node--active'
      : d.status === 'idle'
        ? 'agent-node--idle'
        : 'agent-node--offline';

  const statusLabel = d.status === 'active' ? 'Active' : d.status === 'idle' ? 'Idle' : 'Offline';
  const initials = d.initials ?? d.name.slice(0, 2).toUpperCase();

  return (
    <div className={`agent-node ${statusClass}${selected ? ' agent-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="agent-node__handle" />
      <div className="agent-node__accent" />
      <div className="agent-node__body">
        <div className="agent-node__header">
          <div
            className="agent-node__avatar"
            style={{ backgroundColor: d.avatarColor ?? 'var(--vscode-descriptionForeground)' }}
          >
            {initials}
          </div>
          <div className="agent-node__info">
            <span className="agent-node__name">{d.name}</span>
            <span className="agent-node__role">{d.role}</span>
          </div>
        </div>
        <div className="agent-node__footer">
          <span className="agent-node__badge agent-node__status-chip">
            <span className={`agent-node__dot ${statusClass}`} />
            {statusLabel}
          </span>
          {d.model && <span className="agent-node__badge">{d.model}</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="agent-node__handle" />
    </div>
  );
}
