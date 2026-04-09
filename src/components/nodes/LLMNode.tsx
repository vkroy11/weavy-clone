"use client";

import React, { useEffect, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Cpu, Settings2, Loader2 } from 'lucide-react';
import { NodeShell } from './NodeShell';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useApiTokenStore } from '@/store/useApiTokenStore';
import { getAvailableModels, type Provider } from '@/lib/models';

export const LLMNode = ({ id, data, selected }: NodeProps) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const tokens = useApiTokenStore((state) => state.tokens);
  const [systemProviders, setSystemProviders] = useState<Partial<Record<Provider, boolean>>>({});

  useEffect(() => {
    fetch('/api/config/providers')
      .then(r => r.json())
      .then(setSystemProviders)
      .catch(() => {});
  }, []);

  const configuredProviders: Provider[] = [];
  if (tokens.gemini || systemProviders.gemini) configuredProviders.push('gemini');
  if (tokens.openai || systemProviders.openai) configuredProviders.push('openai');

  const availableModels = getAvailableModels(configuredProviders);
  const modelsByProvider = configuredProviders.map(p => ({
    provider: p,
    label: p === 'gemini' ? 'Google Gemini' : 'OpenAI',
    models: availableModels.filter(m => m.provider === p),
  }));

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary border-2 border-primary !-left-1.5"
      />

      <NodeShell title="Generate Image" icon={Cpu} iconColor="text-purple-500" selected={selected}>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Settings2 size={12} className="text-gray-400" />
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image Model Selector</label>
            </div>
            {availableModels.length > 0 ? (
              <select
                value={data.model || availableModels[0]?.id || ''}
                onChange={(e) => updateNodeData(id, { model: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-node-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                {modelsByProvider.map((group) => (
                  <optgroup key={group.provider} label={group.label}>
                    {group.models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
                No API keys configured. Open Settings to add one.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Prompt (Optional)</label>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-xl bg-gray-50 border border-node-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
              placeholder="You are a helpful assistant..."
              value={data.systemPrompt || ''}
              onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <div className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${data.error ? 'bg-red-50 border-red-100' : 'bg-primary/5 border-primary/10'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${data.error ? 'text-red-500' : 'text-primary'}`}>
                  {data.error ? 'Error' : 'Output'}
                </span>
                {data.loading && <Loader2 size={12} className="text-primary animate-spin" />}
              </div>
              <div className="text-xs min-h-[40px] font-medium leading-relaxed">
                {data.error ? (
                  <span className="text-red-600">{data.error}</span>
                ) : data.value ? (
                   <div className="relative group">
                     <img
                       src={data.value}
                       alt="Generated"
                       className="w-full h-auto max-h-[200px] object-contain rounded-lg border border-primary/10"
                     />
                   </div>
                ) : (
                  <span className="text-gray-400 italic">
                    {data.loading ? 'Generating image...' : 'Image will appear here'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </NodeShell>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary border-2 border-primary !-right-1.5"
      />
    </div>
  );
};
