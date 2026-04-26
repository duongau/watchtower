import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AgentStatus } from '../../types/index.js';
import './AgentNode.css';

export interface AgentNodeData {
  name: string;
  role: string;
  status: AgentStatus;
  model?: string;
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

  return (
    <div className={`agent-node ${statusClass}${selected ? ' agent-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="agent-node__handle" />
      <div className="agent-node__accent" />
      <div className="agent-node__body">
        <div className="agent-node__header">
          <span className={`agent-node__dot ${statusClass}`} />
          <span className="agent-node__name">{d.name}</span>
        </div>
        <div className="agent-node__role">{d.role}</div>
        {d.model && (
          <div className="agent-node__footer">
            <span className="agent-node__badge">{d.model}</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="agent-node__handle" />
    </div>
  );
}
