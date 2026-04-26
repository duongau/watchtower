import { Handle, Position, type NodeProps } from '@xyflow/react';
import './RootNode.css';

export interface RootNodeData {
  label: string;
  agentCount: number;
  [key: string]: unknown;
}

export function RootNode({ data, selected }: NodeProps) {
  const d = data as RootNodeData;

  return (
    <div className={`root-node${selected ? ' root-node--selected' : ''}`}>
      <div className="root-node__body">
        <div className="root-node__name">{d.label}</div>
        <div className="root-node__meta">{d.agentCount} agents</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="root-node__handle" />
    </div>
  );
}
