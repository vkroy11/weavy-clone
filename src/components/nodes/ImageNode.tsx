"use client";

import React, { useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { NodeShell } from './NodeShell';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export const ImageNode = ({ id, data, selected }: NodeProps) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNodeData(id, { value: reader.result, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateNodeData(id, { value: null, fileName: null });
  };

  return (
    <div className="relative">
      <NodeShell title="Image Node" icon={ImageIcon} iconColor="text-green-500" selected={selected}>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image Source</label>
          
          {data.value ? (
            <div className="relative group">
              <img 
                src={data.value} 
                alt="Selected" 
                className="w-full h-40 object-cover rounded-xl border border-node-border shadow-sm"
              />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-red-500 shadow-md transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white truncate max-w-[80%]">
                {data.fileName}
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 border-2 border-dashed border-node-border hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary"
            >
              <div className="p-3 rounded-full bg-white shadow-sm border border-node-border group-hover:border-primary">
                <Upload size={20} />
              </div>
              <span className="text-xs font-semibold">Upload Image</span>
            </button>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              handleFileChange(e);
              e.target.value = ''; // Reset input value to allow re-uploading same file
            }} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
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

