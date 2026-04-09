"use client";

import React, { useState } from 'react';
import { Type, Image as ImageIcon, Cpu, Search, ChevronLeft, ChevronRight, LayoutTemplate } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { PRODUCT_LISTING_GENERATOR } from '@/lib/prebuiltWorkflows';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { addNode, setNodes, setEdges } = useWorkflowStore();

  const nodeTypes = [
    { type: 'textNode', label: 'Text Node', icon: Type, color: 'text-blue-500' },
    { type: 'imageNode', label: 'Image Node', icon: ImageIcon, color: 'text-green-500' },
    { type: 'llmNode', label: 'Run Any LLM Node', icon: Cpu, color: 'text-purple-500' },
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadTemplate = () => {
    setNodes(PRODUCT_LISTING_GENERATOR.nodes as any);
    setEdges(PRODUCT_LISTING_GENERATOR.edges as any);
  };

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-node-border h-screen flex flex-col relative z-50`}>
      <div className="p-4 border-b border-node-border flex items-center justify-between">
        {isOpen && <h2 className="font-bold text-lg text-primary tracking-tight">Weavy AI</h2>}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1.5 hover:bg-canvas rounded-lg transition-colors border border-transparent hover:border-node-border"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        {isOpen && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search nodes..."
              className="w-full pl-9 pr-4 py-2 bg-canvas border border-node-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}

        <div className="space-y-4">
          {isOpen && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Quick Access</p>}
          <div className="space-y-2">
            {nodeTypes.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                onClick={() => {
                   const id = `${node.type}-${Date.now()}`;
                   addNode({
                     id,
                     type: node.type,
                     position: { x: 250, y: 150 },
                     data: { label: node.label, value: '' },
                   });
                }}
                className={`group flex items-center gap-3 p-3 rounded-xl border border-node-border bg-white hover:border-primary hover:shadow-md cursor-grab active:cursor-grabbing transition-all ${!isOpen && 'justify-center'}`}
              >
                <div className={`p-2 rounded-lg bg-canvas group-hover:bg-primary/5 transition-colors`}>
                  <node.icon className={node.color} size={18} />
                </div>
                {isOpen && <span className="text-sm font-semibold text-gray-700">{node.label}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isOpen && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Templates</p>}
          <button
            onClick={loadTemplate}
            className={`flex items-center gap-3 p-3 rounded-xl border border-dashed border-node-border bg-gray-50/50 hover:bg-primary/5 hover:border-primary transition-all w-full ${!isOpen && 'justify-center'}`}
          >
            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
              <LayoutTemplate className="text-primary" size={18} />
            </div>
            {isOpen && (
              <div className="text-left">
                <span className="text-sm font-semibold text-gray-700 block">Product Listing</span>
                <span className="text-[10px] text-gray-400 block font-medium">Image + Name → Listing</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
