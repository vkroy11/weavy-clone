"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Type } from 'lucide-react';
import { NodeShell } from './NodeShell';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export const TextNode = ({ id, data, selected }: NodeProps) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  return (
    <div className="relative">
      <NodeShell title="Text Node" icon={Type} iconColor="text-blue-500" selected={selected}>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Text</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-xl bg-gray-50 border border-node-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
            placeholder="Enter your text here..."
            value={data.value || ''}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
        </div>
      </NodeShell>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-white !-right-1.5"
      />
    </div>
  );
};

