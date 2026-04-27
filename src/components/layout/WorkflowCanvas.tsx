"use client";

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Redo2,
  Settings,
  Undo2,
  Upload,
} from 'lucide-react';
import { SettingsModal } from '../settings/SettingsModal';
import { SessionsDropdown } from '../sessions/SessionsDropdown';
import { TextNode } from '../nodes/TextNode';
import { ImageNode } from '../nodes/ImageNode';
import { LLMNode } from '../nodes/LLMNode';
import { relativeTime } from '../sessions/relativeTime';

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  llmNode: LLMNode,
};

function SaveStatusPill() {
  const saveState = useWorkflowStore((s) => s.saveState);
  const lastSavedAt = useWorkflowStore((s) => s.lastSavedAt);
  const saveError = useWorkflowStore((s) => s.saveError);

  if (saveState === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 text-[11px] font-medium text-gray-500">
        <Loader2 size={11} className="animate-spin" aria-hidden="true" />
        Saving…
      </span>
    );
  }
  if (saveState === 'error') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600"
        title={saveError ?? undefined}
      >
        <AlertTriangle size={11} aria-hidden="true" />
        Save failed
      </span>
    );
  }
  if (saveState === 'saved' && lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 text-[11px] font-medium text-gray-500">
        <CheckCircle2 size={11} className="text-green-500" aria-hidden="true" />
        Saved {relativeTime(lastSavedAt)}
      </span>
    );
  }
  if (saveState === 'dirty') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 text-[11px] font-medium text-gray-500">
        Editing…
      </span>
    );
  }
  return null;
}

const WorkflowCanvas = () => {
  useAutoSave();
  const [showSettings, setShowSettings] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    undo,
    redo,
    addNode,
    setNodes,
    setEdges,
    currentWorkflowName,
    setCurrentWorkflowName,
  } = useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJson = () => {
    const data = { name: currentWorkflowName, nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentWorkflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
            if (typeof data.name === 'string' && data.name.trim()) {
              setCurrentWorkflowName(data.name.trim());
            }
          }
        } catch (err) {
          console.error('Failed to import JSON', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = { x: event.clientX - 300, y: event.clientY - 50 };
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node`, value: '' },
      };

      addNode(newNode);
    },
    [addNode],
  );

  return (
    <div className="flex-1 h-screen relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={20} color="#cbd5e1" variant={'dots' as 'dots'} />
        <Controls
          position="bottom-left"
          className="!bg-white !border-node-border !shadow-lg !rounded-lg overflow-hidden"
        />
        <MiniMap
          position="bottom-right"
          className="!bg-white !border-node-border !shadow-lg !rounded-lg"
        />

        {/* Top-left: workflow name + save status */}
        <Panel
          position="top-left"
          className="m-4 flex max-w-md items-center gap-2 rounded-2xl border border-node-border bg-white/85 p-1.5 shadow-xl backdrop-blur-md"
        >
          <input
            type="text"
            value={currentWorkflowName}
            onChange={(e) => setCurrentWorkflowName(e.target.value)}
            placeholder="Workflow name"
            aria-label="Workflow name"
            className="min-w-0 flex-1 rounded-xl bg-transparent px-2.5 py-1.5 text-sm font-semibold text-gray-800 focus:bg-canvas focus:outline-none"
            spellCheck={false}
            maxLength={120}
          />
          <SaveStatusPill />
        </Panel>

        {/* Top-right: action toolbar */}
        <Panel
          position="top-right"
          className="m-4 flex items-center gap-2 rounded-2xl border border-node-border bg-white/80 p-1.5 shadow-xl backdrop-blur-md"
        >
          <div className="flex gap-1 border-r border-node-border pr-2">
            <button
              onClick={undo}
              className="rounded-xl p-2 transition-all hover:bg-canvas"
              title="Undo"
            >
              <Undo2 size={18} className="text-gray-600" />
            </button>
            <button
              onClick={redo}
              className="rounded-xl p-2 transition-all hover:bg-canvas"
              title="Redo"
            >
              <Redo2 size={18} className="text-gray-600" />
            </button>
          </div>
          <div className="flex gap-1 px-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-2 transition-all hover:bg-canvas"
              title="Import JSON"
            >
              <Upload size={18} className="text-gray-600" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={importFromJson}
              />
            </button>
            <button
              onClick={exportToJson}
              className="rounded-xl p-2 transition-all hover:bg-canvas"
              title="Export JSON"
            >
              <Download size={18} className="text-gray-600" />
            </button>
          </div>
          <SessionsDropdown />
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-xl p-2 transition-all hover:bg-canvas"
            title="API Key Settings"
          >
            <Settings size={18} className="text-gray-600" />
          </button>
        </Panel>
      </ReactFlow>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default function WorkflowCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}
