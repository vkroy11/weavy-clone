"use client";

import React, { useState } from 'react';
import { X, Eye, EyeOff, Check, Trash2 } from 'lucide-react';
import { useApiTokenStore } from '@/store/useApiTokenStore';
import type { Provider } from '@/lib/models';

interface SettingsModalProps {
  onClose: () => void;
}

const PROVIDERS: { id: Provider; label: string; placeholder: string }[] = [
  { id: 'gemini', label: 'Google Gemini', placeholder: 'AIzaSy...' },
  { id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
];

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const { tokens, setToken, removeToken } = useApiTokenStore();
  const [drafts, setDrafts] = useState<Partial<Record<Provider, string>>>({});
  const [visible, setVisible] = useState<Partial<Record<Provider, boolean>>>({});

  const handleSave = (provider: Provider) => {
    const value = drafts[provider]?.trim();
    if (value) {
      setToken(provider, value);
      setDrafts(d => ({ ...d, [provider]: '' }));
    }
  };

  const handleRemove = (provider: Provider) => {
    removeToken(provider);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-node-border">
        <div className="flex items-center justify-between p-5 border-b border-node-border">
          <h2 className="text-lg font-bold text-gray-800">API Key Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-canvas rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {PROVIDERS.map((provider) => {
            const hasUserKey = !!tokens[provider.id];
            const isVisible = visible[provider.id];

            return (
              <div key={provider.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasUserKey ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-semibold text-gray-700">{provider.label}</span>
                  </div>
                  {hasUserKey && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Saved
                    </span>
                  )}
                </div>

                {hasUserKey ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 rounded-xl bg-gray-50 border border-node-border text-sm text-gray-500 font-mono">
                      {isVisible ? tokens[provider.id] : '••••••••••••••••'}
                    </div>
                    <button
                      onClick={() => setVisible(v => ({ ...v, [provider.id]: !isVisible }))}
                      className="p-2 hover:bg-canvas rounded-xl transition-colors border border-node-border"
                      aria-label={isVisible ? 'Hide key' : 'Show key'}
                    >
                      {isVisible ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
                    </button>
                    <button
                      onClick={() => handleRemove(provider.id)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors border border-node-border"
                      aria-label={`Remove ${provider.label} key`}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder={provider.placeholder}
                      value={drafts[provider.id] || ''}
                      onChange={(e) => setDrafts(d => ({ ...d, [provider.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(provider.id)}
                      className="flex-1 p-2.5 rounded-xl bg-gray-50 border border-node-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                    />
                    <button
                      onClick={() => handleSave(provider.id)}
                      disabled={!drafts[provider.id]?.trim()}
                      className="p-2 hover:bg-green-50 rounded-xl transition-colors border border-node-border disabled:opacity-30"
                      aria-label={`Save ${provider.label} key`}
                    >
                      <Check size={16} className="text-green-600" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-node-border bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center">
            Keys are stored only in your browser&rsquo;s localStorage. Weavy doesn&rsquo;t send them anywhere except the model provider you chose.
          </p>
        </div>
      </div>
    </div>
  );
};
