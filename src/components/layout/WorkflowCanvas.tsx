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
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { Undo2, Redo2, Download, Upload, Play, Save, Settings } from 'lucide-react';
import { SettingsModal } from '../settings/SettingsModal';
import { TextNode } from '../nodes/TextNode';
import { ImageNode } from '../nodes/ImageNode';
import { LLMNode } from '../nodes/LLMNode';

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  llmNode: LLMNode,
};

const WorkflowCanvas = () => {
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
  } = useWorkflowStore();
  const { runWorkflow } = useWorkflowExecution();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJson = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
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
          }
        } catch (err) {
          console.error('Failed to import JSON', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const saveToDb = async () => {
    try {
      const response = await fetch('/api/workflow/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Workflow',
          nodes,
          edges,
        }),
      });
      if (response.ok) {
        alert('Workflow saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save to DB', err);
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
    [addNode]
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
        <Background gap={20} color="#cbd5e1" variant={'dots' as any} />
        <Controls position="bottom-left" className="!bg-white !border-node-border !shadow-lg !rounded-lg overflow-hidden" />
        <MiniMap position="bottom-right" className="!bg-white !border-node-border !shadow-lg !rounded-lg" />
        
        <Panel position="top-right" className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-node-border m-4">
          <div className="flex gap-1 pr-2 border-r border-node-border">
            <button onClick={undo} className="p-2 hover:bg-canvas rounded-xl transition-all" title="Undo">
              <Undo2 size={18} className="text-gray-600" />
            </button>
            <button onClick={redo} className="p-2 hover:bg-canvas rounded-xl transition-all" title="Redo">
              <Redo2 size={18} className="text-gray-600" />
            </button>
          </div>
          <div className="flex gap-1 px-1">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-canvas rounded-xl transition-all" title="Import">
              <Upload size={18} className="text-gray-600" />
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importFromJson} />
            </button>
            <button onClick={exportToJson} className="p-2 hover:bg-canvas rounded-xl transition-all" title="Export">
              <Download size={18} className="text-gray-600" />
            </button>
          </div>
          <button
            onClick={saveToDb}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-canvas rounded-xl transition-all"
            title="Save to Database"
          >
            <Save size={18} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-canvas rounded-xl transition-all"
            title="API Key Settings"
          >
            <Settings size={18} className="text-gray-600" />
          </button>
          <button
            onClick={runWorkflow}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 active:scale-95 ml-2"
          >
            <Play size={16} fill="white" />
            Run Flow
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
