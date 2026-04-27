import { Handle, Position, type NodeProps } from '@xyflow/react';
import { TowerControl } from 'lucide-react';
import './RootNode.css';

export interface RootNodeData {
  label: string;
  agentCount: number;
  universe?: string;
  [key: string]: unknown;
}

export function RootNode({ data, selected }: NodeProps) {
  const d = data as RootNodeData;

  return (
    <div className={`root-node${selected ? ' root-node--selected' : ''}`}>
      <div className="root-node__body">
        <div className="root-node__title-row">
          <TowerControl size={18} className="root-node__icon" />
          <div className="root-node__name">{d.label}</div>
        </div>
        <div className="root-node__meta">
          {d.universe && <span className="root-node__universe">{d.universe}</span>}
          <span>{d.agentCount} agents</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="root-node__handle" />
    </div>
  );
}
